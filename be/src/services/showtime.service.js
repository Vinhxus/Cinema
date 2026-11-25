import * as showtimeRepository from '../repositories/showtime.repository.js';
import { getOrSet } from '../utils/cache.js';
import {
  addDaysISO,
  describeDate,
  getVnDateISO,
  isIsoDate,
  toShowtimeEpochMs,
} from '../utils/datetime.js';

const SHOWTIME_TTL_MS = 15_000; // số ghế trống đổi liên tục nên cache rất ngắn
const DEFAULT_WINDOW_DAYS = 7;

/** Đọc ngưỡng từ .env, sai/thiếu thì dùng mặc định. */
function toPositiveInt(value, fallback) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function toNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

const LOW_SEAT_THRESHOLD = toPositiveInt(process.env.LOW_SEAT_THRESHOLD, 20);
const SALES_CUTOFF_MINUTES = toPositiveInt(process.env.SALES_CUTOFF_MINUTES, 15);

/** Nhãn tồn kho ghế: hết vé / sắp hết (<= ngưỡng) / còn nhiều. */
function buildAvailability(availableSeats) {
  if (availableSeats <= 0) {
    return { availability: 'sold_out', seatsLeft: 'Hết vé', isSoldOut: true };
  }

  if (availableSeats <= LOW_SEAT_THRESHOLD) {
    return {
      availability: 'few',
      seatsLeft: `Chỉ còn ${availableSeats} ghế`,
      isSoldOut: false,
    };
  }

  return {
    availability: 'available',
    seatsLeft: `Còn ${availableSeats} ghế`,
    isSoldOut: false,
  };
}

function mapShowtime(row, startMs, cutoffMs) {
  const availableSeats = toNumber(row.AvailableSeats);
  const { availability, seatsLeft, isSoldOut } = buildAvailability(availableSeats);
  const isClosed = startMs <= cutoffMs; // sát giờ chiếu (<= 15 phút) hoặc đã bắt đầu

  return {
    showtimeId: row.ShowtimeID,
    startTime: row.StartTime,
    endTime: row.EndTime,
    format: row.Format,
    roomType: row.RoomType ?? '',
    hall: row.RoomNumber,
    hallNote: row.HallNote ?? row.FormatDescription ?? '',
    price: toNumber(row.BaseTicketPrice),
    capacity: toNumber(row.RoomSeats),
    availableSeats,
    availability,
    seatsLeft,
    isClosed,
    isSoldOut,
    isBookable: !isClosed && !isSoldOut,
  };
}

/** Gom Cụm rạp -> Định dạng -> Suất chiếu. */
function buildCinemaGroups(entries) {
  const cinemas = new Map();

  for (const entry of entries) {
    const { row, showtime } = entry;

    let cinema = cinemas.get(row.CinemaID);
    if (!cinema) {
      cinema = {
        cinemaId: row.CinemaID,
        slug: row.Slug,
        name: row.CinemaName,
        branch: row.Branch ?? '',
        address: row.Address,
        city: row.City ?? '',
        distance: row.DistanceLabel ?? '',
        perk: row.Perk ?? '',
        formats: [],
        showtimeCount: 0,
        openCount: 0,
      };
      cinemas.set(row.CinemaID, cinema);
    }

    let format = cinema.formats.find((item) => item.format === row.Format);
    if (!format) {
      format = { format: row.Format, roomType: row.RoomType ?? '', showtimes: [] };
      cinema.formats.push(format);
    }

    format.showtimes.push(showtime);
    cinema.showtimeCount += 1;
    if (showtime.isBookable) cinema.openCount += 1;
  }

  return [...cinemas.values()].map((cinema) => ({
    ...cinema,
    formatCount: cinema.formats.length,
  }));
}

/** Dải ngày có suất chiếu thật (từ hôm nay trở đi), kèm số suất còn mở. */
function buildAvailableDates(entries, todayISO) {
  const buckets = new Map();

  for (const entry of entries) {
    const dateISO = entry.row.ShowDate;

    let bucket = buckets.get(dateISO);
    if (!bucket) {
      bucket = { ...describeDate(dateISO, todayISO), slots: 0, total: 0 };
      buckets.set(dateISO, bucket);
    }

    bucket.total += 1;
    if (!entry.showtime.isClosed) bucket.slots += 1;
  }

  return [...buckets.values()];
}

/**
 * GET /api/showtimes?movieId=&date=&cinemaId=&format=&days=
 * - Ẩn hoàn toàn suất đã bắt đầu chiếu.
 * - Suất còn <= SALES_CUTOFF_MINUTES phút nữa chiếu: đánh dấu isClosed (không cho đặt).
 * - Số ghế trống lấy từ SQL (ghế active - ghế HELD/BOOKED).
 */
export async function getMovieShowtimes({ movieId, date, cinemaId, format, days } = {}) {
  const todayISO = getVnDateISO();
  const windowDays = toPositiveInt(days, DEFAULT_WINDOW_DAYS);
  const requestedDate = isIsoDate(date) && date >= todayISO ? date : todayISO;
  const lastWindowISO = addDaysISO(todayISO, windowDays - 1);
  const queryToISO = requestedDate > lastWindowISO ? requestedDate : lastWindowISO;
  const normalizedFormat = format?.trim() || null;

  const cacheKey = [
    'showtimes',
    movieId,
    `${todayISO}:${queryToISO}`,
    requestedDate,
    cinemaId ?? '*',
    normalizedFormat ? normalizedFormat.toLowerCase() : '*',
  ].join(':');

  return getOrSet(cacheKey, SHOWTIME_TTL_MS, async () => {
    const rows = await showtimeRepository.findShowtimesInRange({
      movieId,
      from: todayISO,
      to: queryToISO,
      cinemaId,
      format: normalizedFormat,
    });

    const nowMs = Date.now();
    const cutoffMs = nowMs + SALES_CUTOFF_MINUTES * 60_000;

    const upcoming = rows
      .map((row) => ({ row, startMs: toShowtimeEpochMs(row.ShowDate, row.StartTime) }))
      .filter((entry) => entry.startMs > nowMs)
      .map((entry) => ({
        ...entry,
        showtime: mapShowtime(entry.row, entry.startMs, cutoffMs),
      }));

    const ofDate = upcoming.filter((entry) => entry.row.ShowDate === requestedDate);
    const cinemas = buildCinemaGroups(ofDate);

    return {
      movieId,
      date: requestedDate,
      today: todayISO,
      window: { from: todayISO, to: queryToISO, days: windowDays },
      thresholds: {
        lowSeatThreshold: LOW_SEAT_THRESHOLD,
        salesCutoffMinutes: SALES_CUTOFF_MINUTES,
      },
      availableDates: buildAvailableDates(upcoming, todayISO),
      cinemas,
      totals: {
        cinemas: cinemas.length,
        showtimes: ofDate.length,
        open: ofDate.filter((entry) => entry.showtime.isBookable).length,
        soldOut: ofDate.filter((entry) => entry.showtime.isSoldOut && !entry.showtime.isClosed).length,
        closed: ofDate.filter((entry) => entry.showtime.isClosed).length,
      },
    };
  });
}