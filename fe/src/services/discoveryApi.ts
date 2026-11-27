import type { AgeRating, Movie } from "../components/MovieComponents/MovieCard";
import {
  AGE_NOTICE,
  splitTitle,
  type Availability,
  type CastMember,
  type Cinema,
  type MovieDetailData,
  type ShowDate,
} from "../data/movieDetail";

/** URL gốc của Backend Express (có thể override bằng VITE_API_BASE_URL). */
const API_BASE_URL = String(import.meta.env.VITE_API_BASE_URL ?? "http://localhost:5000").replace(/\/+$/, "");

/* ------------------------------- Kiểu dữ liệu ------------------------------- */

export type MovieStatus = "NOW_SHOWING" | "COMING_SOON" | "ENDED" | "DRAFT";

/** Dòng thô trả về từ MySQL (tên cột PascalCase). */
export interface RawMovie {
  MovieID: number;
  Code?: string;
  Title: string;
  Subtitle: string | null;
  Tagline: string | null;
  Description: string | null;
  Genre: string;
  Duration: number;
  ReleaseDate?: string | null;
  AgeRating: string;
  AgeNotice?: string | null;
  Language?: string | null;
  Formats: string | null;
  ImdbScore: string | number | null;
  AudienceScore?: string | number | null;
  PosterUrl: string | null;
  BackdropUrl: string | null;
  TrailerUrl?: string | null;
  Director?: string | null;
  Starring?: string | null;
  Status: MovieStatus;
}

/** Movie của UI + vài trường phụ dùng cho banner Spotlight. */
export interface MovieSummary extends Movie {
  duration: number;
  description: string;
  tagline: string;
  backdrop: string;
  trailerUrl: string;
  status: MovieStatus;
}

export interface MovieCounts {
  nowShowing: number;
  comingSoon: number;
}

export interface MovieListResult {
  items: MovieSummary[];
  total: number;
  filters: { status: string; genre: string | null };
  counts: MovieCounts;
  genres: string[];
}

export interface FetchMoviesParams {
  status?: "now" | "upcoming" | "all";
  genre?: string;
}

interface ApiErrorPayload {
  message?: string;
  details?: unknown;
}

interface ApiEnvelope<T> {
  success: boolean;
  data: T | null;
  error: ApiErrorPayload | null;
}

interface RawMovieListPayload {
  items?: RawMovie[];
  total?: number;
  filters?: { status: string; genre: string | null };
  counts?: MovieCounts;
  genres?: string[];
}

interface RawMovieSearchPayload {
  items?: RawMovie[];
  total?: number;
  query?: string;
}

/* ------------------------------ Hàm map dữ liệu ----------------------------- */

/** MySQL lưu T13/T16/T18 nhưng UI dùng C13/C16/C18 (badge của MovieCard). */
const AGE_RATING_MAP: Record<string, AgeRating> = {
  P: "P",
  T13: "C13",
  T16: "C16",
  T18: "C18",
  C13: "C13",
  C16: "C16",
  C18: "C18",
};

export function mapAgeRating(raw: string | null | undefined): AgeRating {
  const key = (raw ?? "").trim().toUpperCase();
  return AGE_RATING_MAP[key] ?? "P";
}

function toNumber(value: string | number | null | undefined): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

/** Map 1 dòng MySQL -> object mà MovieCard/MovieHero đang dùng. */
export function mapMovie(row: RawMovie): MovieSummary {
  const formats = (row.Formats ?? "").trim() || "2D";
  const formatTokens = formats
    .split("•")
    .map((token) => token.trim())
    .filter(Boolean);

  const tags = formatTokens
    .filter((token) => /imax|4dx|screenx/i.test(token))
    .slice(0, 2)
    .map((token) => token.toUpperCase());

  return {
    id: row.MovieID,
    title: row.Title,
    subtitle: row.Subtitle ?? row.Tagline ?? "",
    age: mapAgeRating(row.AgeRating),
    tags,
    genre: row.Genre,
    formats,
    rating: toNumber(row.ImdbScore),
    poster: row.PosterUrl ?? "",
    duration: toNumber(row.Duration),
    description: row.Description ?? "",
    tagline: row.Tagline ?? "",
    backdrop: row.BackdropUrl || row.PosterUrl || "",
    trailerUrl: row.TrailerUrl ?? "",
    status: row.Status,
  };
}

/* --------------------------------- Gọi API --------------------------------- */

async function request<T>(path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { Accept: "application/json" },
    });
  } catch {
    throw new Error("Can't reach the API server. Please start the backend on port 5000.");
  }

  let payload: ApiEnvelope<T> | null = null;
  try {
    payload = (await response.json()) as ApiEnvelope<T>;
  } catch {
    payload = null;
  }

  if (!response.ok || !payload?.success) {
    const details = payload?.error?.details;
    const firstDetail = Array.isArray(details)
      ? (details as Array<{ message?: string }>).find((item) => item?.message)?.message
      : undefined;

    throw new Error(
      firstDetail ??
        payload?.error?.message ??
        `Request failed (HTTP ${response.status}).`
    );
  }

  return payload.data as T;
}

/** Danh sách phim theo tab + thể loại (kèm counts và genres). */
export async function fetchMovies({
  status = "all",
  genre,
}: FetchMoviesParams = {}): Promise<MovieListResult> {
  const query = new URLSearchParams({ status });
  if (genre) query.set("genre", genre);

  const data = await request<RawMovieListPayload>(`/api/movies?${query.toString()}`);

  return {
    items: (data.items ?? []).map(mapMovie),
    total: data.total ?? data.items?.length ?? 0,
    filters: data.filters ?? { status, genre: genre ?? null },
    counts: data.counts ?? { nowShowing: 0, comingSoon: 0 },
    genres: data.genres ?? [],
  };
}

/** Tìm kiếm nhanh theo tên phim (BE giới hạn tối đa 8 kết quả). */
export async function searchMovies(keyword: string): Promise<MovieSummary[]> {
  const query = keyword.trim();
  if (!query) return [];

  const data = await request<RawMovieSearchPayload>(
    `/api/movies/search?q=${encodeURIComponent(query)}`
  );

  return (data.items ?? []).map(mapMovie);
}

/* ---------------------------- Cụm rạp & lịch chiếu ---------------------------- */

/** 1 cụm rạp BE trả về — GET /api/cinemas đã map sẵn sang camelCase. */
export interface RawCinema {
  cinemaId: number;
  slug: string;
  name: string;
  branch: string | null;
  address: string;
  city: string | null;
  distance: string | null;
  perk: string | null;
  mapUrl?: string | null;
  roomCount: string | number;
  readyRoomCount: string | number;
  readyCapacity: string | number;
}

/** Cụm rạp đã chuẩn hoá cho dropdown "Cinemas". */
export interface CinemaSummary {
  cinemaId: number;
  slug: string;
  name: string;
  /** Nhãn hiển thị dropdown: "SENEMA Nguyễn Du (Standard 2D) · 1.2km away". */
  label: string;
  branch: string;
  address: string;
  city: string;
  distance: string;
  perk: string;
  roomCount: number;
  readyRoomCount: number;
  readyCapacity: number;
}

export interface CinemaListResult {
  items: CinemaSummary[];
  total: number;
}

/** 1 suất chiếu đã được BE tính sẵn số ghế trống + nhãn tồn kho. */
export interface ShowtimeItem {
  showtimeId: number;
  startTime: string;
  endTime: string;
  format: string;
  roomType: string;
  hall: string;
  hallNote: string;
  price: number;
  capacity: number;
  availableSeats: number;
  availability: Availability;
  seatsLeft: string;
  isClosed: boolean;
  isSoldOut: boolean;
  isBookable: boolean;
}

export interface ShowtimeFormatGroup {
  format: string;
  roomType: string;
  showtimes: ShowtimeItem[];
}

export interface ShowtimeCinemaGroup {
  cinemaId: number;
  slug: string;
  name: string;
  branch: string;
  address: string;
  city: string;
  distance: string;
  perk: string;
  formatCount: number;
  showtimeCount: number;
  openCount: number;
  formats: ShowtimeFormatGroup[];
}

/** 1 ngày có suất chiếu thật (nhãn thứ/ngày/tháng do BE tính theo giờ VN). */
export interface ShowtimeDate {
  date: string;
  weekDay: string;
  fullName: string;
  day: string;
  month: string;
  slots: number;
  total: number;
}

export interface ShowtimeTotals {
  cinemas: number;
  showtimes: number;
  open: number;
  soldOut: number;
  closed: number;
}

export interface MovieShowtimesResult {
  movieId: number;
  date: string;
  today: string;
  window: { from: string; to: string; days: number };
  thresholds: { lowSeatThreshold: number; salesCutoffMinutes: number };
  availableDates: ShowtimeDate[];
  cinemas: ShowtimeCinemaGroup[];
  totals: ShowtimeTotals;
}

export interface FetchShowtimesParams {
  movieId: number;
  date?: string;
  cinemaId?: number;
  format?: string;
  days?: number;
}

function mapCinema(row: RawCinema): CinemaSummary {
  const name = row.name ?? "";
  const branch = row.branch ?? "";
  const distance = row.distance ?? "";
  const label = [branch ? `${name} (${branch})` : name, distance]
    .filter(Boolean)
    .join(" · ");

  return {
    cinemaId: toNumber(row.cinemaId),
    slug: row.slug ?? "",
    name,
    label,
    branch,
    address: row.address ?? "",
    city: row.city ?? "",
    distance,
    perk: row.perk ?? "",
    roomCount: toNumber(row.roomCount),
    readyRoomCount: toNumber(row.readyRoomCount),
    readyCapacity: toNumber(row.readyCapacity),
  };
}

/** POSTER: danh sách cụm rạp kèm số phòng chiếu (dùng cho dropdown lọc rạp). */
export async function fetchCinemas(): Promise<CinemaListResult> {
  const data = await request<{ items?: RawCinema[]; total?: number }>("/api/cinemas");
  const items = (data.items ?? []).map(mapCinema);

  return { items, total: data.total ?? items.length };
}

function mapShowtimeItem(item: ShowtimeItem): ShowtimeItem {
  return {
    ...item,
    showtimeId: toNumber(item.showtimeId),
    price: toNumber(item.price),
    capacity: toNumber(item.capacity),
    availableSeats: toNumber(item.availableSeats),
    format: item.format ?? "2D",
    roomType: item.roomType ?? "",
    hallNote: item.hallNote ?? "",
    isClosed: Boolean(item.isClosed),
    isSoldOut: Boolean(item.isSoldOut),
    isBookable: Boolean(item.isBookable),
  };
}

function mapShowtimes(data: MovieShowtimesResult): MovieShowtimesResult {
  return {
    ...data,
    availableDates: data.availableDates ?? [],
    cinemas: (data.cinemas ?? []).map((cinema) => ({
      ...cinema,
      cinemaId: toNumber(cinema.cinemaId),
      formatCount: toNumber(cinema.formatCount),
      showtimeCount: toNumber(cinema.showtimeCount),
      openCount: toNumber(cinema.openCount),
      formats: (cinema.formats ?? []).map((format) => ({
        ...format,
        showtimes: (format.showtimes ?? []).map(mapShowtimeItem),
      })),
    })),
    totals:
      data.totals ?? { cinemas: 0, showtimes: 0, open: 0, soldOut: 0, closed: 0 },
  };
}

/**
 * Lịch chiếu thật của 1 phim: dải ngày có suất + lịch gom Cụm rạp -> Định dạng -> Suất.
 * BE tự ẩn suất đã bắt đầu và chặn bán vé trong 15 phút sát giờ.
 */
export async function fetchMovieShowtimes({
  movieId,
  date,
  cinemaId,
  format,
  days,
}: FetchShowtimesParams): Promise<MovieShowtimesResult> {
  const query = new URLSearchParams({ movieId: String(movieId) });
  if (date) query.set("date", date);
  if (cinemaId) query.set("cinemaId", String(cinemaId));
  if (format) query.set("format", format);
  if (days) query.set("days", String(days));

  const data = await request<MovieShowtimesResult>(`/api/showtimes?${query.toString()}`);
  return mapShowtimes(data);
}

/* ---------------------- Trang chi tiết phim (GET /api/movies/:id) ---------------------- */

/** Màu avatar xoay vòng cho dàn diễn viên dựng từ cột Starring. */
const CAST_ACCENTS = [
  "from-teal-500 to-slate-700",
  "from-amber-400 to-orange-600",
  "from-rose-500 to-red-700",
  "from-sky-500 to-indigo-600",
  "from-emerald-500 to-teal-700",
  "from-fuchsia-500 to-purple-700",
];

function toInitials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join("");
}

/** DB chỉ có 1 chuỗi Starring => tách thành danh sách cast cho khối Ratings & Cast. */
function buildCast(starring: string): CastMember[] {
  return starring
    .split(",")
    .map((name) => name.trim())
    .filter(Boolean)
    .slice(0, 6)
    .map((name, index) => ({
      id: `cast-${index + 1}`,
      name,
      role: "Cast",
      initials: toInitials(name),
      accent: CAST_ACCENTS[index % CAST_ACCENTS.length] ?? CAST_ACCENTS[0],
    }));
}

/** "2024-03-01" -> "Released 01/03/2024" (đúng layout của MovieHero). */
function formatReleaseDate(iso: string | null | undefined): string {
  const [year, month, day] = (iso ?? "").split("-");
  if (!year || !month || !day) return "";
  return `Released ${day}/${month}/${year}`;
}

/** 1 dòng MySQL -> MovieDetailData mà MovieHero / MovieRatingsAndCast đang dùng. */
export function mapMovieDetail(row: RawMovie): MovieDetailData {
  const age = mapAgeRating(row.AgeRating);
  const { prefix, accent } = splitTitle(row.Title ?? "");
  const formats = (row.Formats ?? "")
    .split("•")
    .map((token) => token.trim())
    .filter(Boolean);
  const poster = row.PosterUrl ?? "";
  const imdbScore = toNumber(row.ImdbScore);
  const audienceScore = toNumber(row.AudienceScore) || imdbScore;
  const tagline = row.Tagline ?? "";

  return {
    id: toNumber(row.MovieID),
    title: row.Title ?? "",
    titlePrefix: prefix,
    titleAccent: accent,
    subtitle: row.Subtitle ?? tagline,
    age,
    genre: row.Genre ?? "",
    releaseDate: formatReleaseDate(row.ReleaseDate),
    imdbScore,
    audienceScore,
    duration: row.Duration ? `${toNumber(row.Duration)} min` : "",
    tagline,
    synopsis: row.Description?.trim() || "Synopsis coming soon.",
    director: row.Director ?? "",
    starring: row.Starring ?? "",
    formats: formats.length > 0 ? formats : ["2D"],
    poster,
    backdrop: row.BackdropUrl || poster,
    trailer: {
      label: "OFFICIAL TRAILER",
      quality: "HD",
      url: row.TrailerUrl ?? "",
      duration: "",
      currentTime: "00:00",
      totalTime: "00:00",
      resolution: "1080p",
    },
    ageNotice: (row.AgeNotice ?? "").trim() || AGE_NOTICE[age],
    cast: buildCast(row.Starring ?? ""),
  };
}

/** Chi tiết 1 phim theo MovieID — BE trả 404 nếu phim không tồn tại. */
export async function fetchMovieDetail(movieId: number): Promise<MovieDetailData> {
  const row = await request<RawMovie>(`/api/movies/${encodeURIComponent(String(movieId))}`);
  return mapMovieDetail(row);
}

/** Đưa MovieDetailData về shape `Movie` để trang chọn ghế dùng lại BookingContext. */
export function toBookingMovie(detail: MovieDetailData): Movie {
  return {
    id: detail.id,
    title: detail.title,
    subtitle: detail.subtitle,
    age: detail.age,
    tags: detail.formats
      .filter((format) => /imax|4dx|screenx/i.test(format))
      .slice(0, 2)
      .map((format) => format.toUpperCase()),
    genre: detail.genre,
    formats: detail.formats.join(" • ") || "2D",
    rating: detail.imdbScore,
    poster: detail.poster,
  };
}

/* ------------ Lịch chiếu thật -> ShowDate[] + Cinema[] của ShowtimeSelector ------------ */

export interface MovieShowtimesView {
  dates: ShowDate[];
  cinemas: Cinema[];
  totals: ShowtimeTotals;
  thresholds: { lowSeatThreshold: number; salesCutoffMinutes: number };
  today: string;
  window: { from: string; to: string; days: number };
}

/**
 * BE trả Cụm rạp -> Định dạng -> Suất chiếu, còn ShowtimeSelector cần đúng shape
 * ShowDate[]/Cinema[] nên gom lại ở đây (giữ nguyên ghế trống + cờ khóa bán vé).
 */
export function mapShowtimesToView(result: MovieShowtimesResult): MovieShowtimesView {
  return {
    dates: result.availableDates.map((date) => ({
      id: date.date,
      weekDay: date.weekDay,
      fullName: date.fullName,
      day: date.day,
      month: date.month,
      slots: date.slots,
    })),
    cinemas: result.cinemas.map((cinema) => ({
      id: String(cinema.cinemaId),
      name: cinema.name || cinema.slug || "SENEMA",
      branch: cinema.branch,
      address: cinema.address,
      distance: cinema.distance,
      perk: cinema.perk || undefined,
      halls: cinema.formats.map((group) => ({
        id: `${cinema.cinemaId}-${group.format}-${group.roomType}`,
        format:
          group.roomType && group.roomType !== group.format
            ? `${group.format} • ${group.roomType}`
            : group.format,
        showtimes: group.showtimes.map((item) => ({
          showtimeId: item.showtimeId,
          id: String(item.showtimeId),
          startTime: item.startTime,
          endTime: item.endTime,
          hall: item.hall,
          hallNote: item.hallNote,
          seatsLeft: item.seatsLeft,
          availability: item.availability,
          price: item.price,
          isClosed: item.isClosed,
          isSoldOut: item.isSoldOut,
        })),
      })),
    })),
    totals: result.totals,
    thresholds: result.thresholds,
    today: result.today,
    window: result.window,
  };
}