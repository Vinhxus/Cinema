import pool from '../config/db.js';
import * as showtimeRepository from '../repositories/showtime.repository.js';
import * as movieRepository from '../repositories/movie.repository.js';
import * as roomRepository from '../repositories/room.repository.js';
import * as cinemaRepository from '../repositories/cinema.repository.js';
import { AppError } from '../utils/AppError.js';

export function normalizeTime(timeInput) {
  const str = String(timeInput).trim();
  const match = str.match(/^(\d{2}):(\d{2})(?::(\d{2}))?$/);
  if (!match) {
    throw new AppError('Invalid time format, expected HH:MM or HH:MM:SS', 400);
  }

  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  const seconds = Number(match[3] ?? '0');

  if (hours > 23 || minutes > 59 || seconds > 59) {
    throw new AppError('Time value out of valid 24-hour range', 400);
  }

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function addDays(dateStr, days) {
  const [year, month, day] = dateStr.split('-').map(Number);
  const dt = new Date(Date.UTC(year, month - 1, day + days));
  const yyyy = dt.getUTCFullYear();
  const mm = String(dt.getUTCMonth() + 1).padStart(2, '0');
  const dd = String(dt.getUTCDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function computeScheduleWindow(
  showDate,
  rawStartTime,
  durationMinutes,
  bufferMinutes = 15
) {
  const startTime = normalizeTime(rawStartTime);
  const [startH, startM, startS] = startTime.split(':').map(Number);

  const totalMinutes =
    startH * 60 + startM + Number(durationMinutes) + bufferMinutes;
  const dayOffset = Math.floor(totalMinutes / 1440);
  const endMinutesOfDay = totalMinutes % 1440;
  const endH = Math.floor(endMinutesOfDay / 60);
  const endM = endMinutesOfDay % 60;

  const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}:${String(startS).padStart(2, '0')}`;
  const endDate = addDays(showDate, dayOffset);

  return {
    startTime,
    endTime,
    startDateTime: `${showDate} ${startTime}`,
    endDateTime: `${endDate} ${endTime}`,
  };
}

export function computeExistingWindow(showDate, startTime, endTime) {
  const normalizedStart = normalizeTime(startTime);
  const normalizedEnd = normalizeTime(endTime);
  const endDate =
    normalizedEnd < normalizedStart ? addDays(showDate, 1) : showDate;

  return {
    startDateTime: `${showDate} ${normalizedStart}`,
    endDateTime: `${endDate} ${normalizedEnd}`,
  };
}

function splitDateAndTime(rawDate, rawTime) {
  const timeStr = String(rawTime).trim();
  const combinedMatch = timeStr.match(
    /^(\d{4}-\d{2}-\d{2})[T\s](\d{2}:\d{2}(?::\d{2})?)/
  );

  if (combinedMatch) {
    return {
      showDate: rawDate || combinedMatch[1],
      startTime: combinedMatch[2],
    };
  }

  return {
    showDate: rawDate,
    startTime: timeStr,
  };
}

export async function listShowtimes(query) {
  return showtimeRepository.findAll({
    cinemaId: query.cinema_id ?? query.cinemaId,
    roomId: query.room_id ?? query.roomId,
    movieId: query.movie_id ?? query.movieId,
    date: query.date ?? query.show_date ?? query.showDate,
    status: query.status,
  });
}

export async function createShowtime(payload) {
  const movieId = payload.movieId ?? payload.movie_id;
  const roomId = payload.roomId ?? payload.room_id;
  const rawDate = payload.showDate ?? payload.show_date ?? payload.date;
  const rawStart = payload.startTime ?? payload.start_time;

  const { showDate, startTime: parsedStart } = splitDateAndTime(
    rawDate,
    rawStart
  );
  if (!showDate) {
    throw new AppError('show_date is required', 400);
  }

  const movie = await movieRepository.findById(movieId);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  const room = await roomRepository.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const window = computeScheduleWindow(
    showDate,
    parsedStart,
    movie.Duration,
    15
  );

  const conflicts = await showtimeRepository.findOverlapping({
    roomId,
    showDate,
    newStartDateTime: window.startDateTime,
    newEndDateTime: window.endDateTime,
  });

  if (conflicts.length > 0) {
    throw new AppError(
      'Showtime overlaps with an existing showtime in the same room',
      409,
      { conflicts }
    );
  }

  return showtimeRepository.create({
    MovieID: movieId,
    RoomID: roomId,
    ShowDate: showDate,
    StartTime: window.startTime,
    EndTime: window.endTime,
    Format: payload.format ?? room.RoomType ?? '2D Vietnamese Subs',
    BaseTicketPrice:
      payload.baseTicketPrice ?? payload.base_ticket_price ?? 110000.0,
    Status: payload.status ?? 'SCHEDULED',
  });
}

export async function updateShowtime(showtimeId, payload) {
  const existing = await showtimeRepository.findById(showtimeId);
  if (!existing) {
    throw new AppError('Showtime not found', 404);
  }

  const hasPaid = await showtimeRepository.hasPaidTickets(showtimeId);
  if (hasPaid) {
    throw new AppError(
      'Cannot modify showtime that already has paid tickets',
      400
    );
  }

  const movieId = payload.movieId ?? payload.movie_id ?? existing.MovieID;
  const roomId = payload.roomId ?? payload.room_id ?? existing.RoomID;
  const rawDate =
    payload.showDate ?? payload.show_date ?? payload.date ?? existing.ShowDate;
  const rawStart = payload.startTime ?? payload.start_time ?? existing.StartTime;
  const { showDate, startTime: parsedStart } = splitDateAndTime(
    rawDate,
    rawStart
  );

  const movie = await movieRepository.findById(movieId);
  if (!movie) {
    throw new AppError('Movie not found', 404);
  }

  if (roomId !== existing.RoomID) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }
  }

  const window = computeScheduleWindow(
    showDate,
    parsedStart,
    movie.Duration,
    15
  );
  const status = payload.status ?? existing.Status;

  if (status !== 'CANCELED') {
    const conflicts = await showtimeRepository.findOverlapping({
      roomId,
      showDate,
      newStartDateTime: window.startDateTime,
      newEndDateTime: window.endDateTime,
      excludeShowtimeId: showtimeId,
    });

    if (conflicts.length > 0) {
      throw new AppError(
        'Showtime overlaps with an existing showtime in the same room',
        409,
        { conflicts }
      );
    }
  }

  return showtimeRepository.update(showtimeId, {
    MovieID: movieId,
    RoomID: roomId,
    ShowDate: showDate,
    StartTime: window.startTime,
    EndTime: window.endTime,
    Format: payload.format ?? existing.Format,
    BaseTicketPrice:
      payload.baseTicketPrice ??
      payload.base_ticket_price ??
      existing.BaseTicketPrice,
    Status: status,
  });
}

export async function deleteShowtime(showtimeId) {
  const existing = await showtimeRepository.findById(showtimeId);
  if (!existing) {
    throw new AppError('Showtime not found', 404);
  }

  const hasPaid = await showtimeRepository.hasPaidTickets(showtimeId);
  if (hasPaid) {
    throw new AppError(
      'Cannot delete showtime that already has paid tickets',
      400
    );
  }

  const hasBookings =
    await showtimeRepository.hasAnyBookingsOrTickets(showtimeId);
  if (hasBookings) {
    throw new AppError(
      'Cannot delete showtime with existing bookings or tickets',
      400
    );
  }

  await showtimeRepository.remove(showtimeId);
  return { deletedId: showtimeId };
}

export async function copyShowtimes(payload) {
  const sourceDate = payload.sourceDate ?? payload.source_date;
  const targetDate = payload.targetDate ?? payload.target_date;
  const cinemaId = payload.cinemaId ?? payload.cinema_id;
  const roomId = payload.roomId ?? payload.room_id;

  if (sourceDate === targetDate) {
    throw new AppError(
      'Target date must be different from source date',
      400
    );
  }

  const cinema = await cinemaRepository.findById(cinemaId);
  if (!cinema) {
    throw new AppError('Cinema not found', 404);
  }

  if (roomId !== undefined) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw new AppError('Room not found', 404);
    }
    if (Number(room.CinemaID) !== Number(cinemaId)) {
      throw new AppError('Room does not belong to the specified cinema', 400);
    }
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const sources = await showtimeRepository.findByDateAndCinema(
      { sourceDate, cinemaId, roomId },
      conn
    );

    const created = [];
    const skipped = [];

    for (const src of sources) {
      const targetWindow = computeExistingWindow(
        targetDate,
        src.StartTime,
        src.EndTime
      );

      const conflicts = await showtimeRepository.findOverlapping(
        {
          roomId: src.RoomID,
          showDate: targetDate,
          newStartDateTime: targetWindow.startDateTime,
          newEndDateTime: targetWindow.endDateTime,
        },
        conn
      );

      if (conflicts.length > 0) {
        skipped.push({
          sourceShowtimeId: src.ShowtimeID,
          roomId: src.RoomID,
          roomNumber: src.RoomNumber,
          movieId: src.MovieID,
          movieTitle: src.MovieTitle,
          startTime: src.StartTime,
          endTime: src.EndTime,
          reason: 'Schedule conflict on target date',
          conflicts,
        });
        continue;
      }

      const inserted = await showtimeRepository.create(
        {
          MovieID: src.MovieID,
          RoomID: src.RoomID,
          ShowDate: targetDate,
          StartTime: src.StartTime,
          EndTime: src.EndTime,
          Format: src.Format,
          BaseTicketPrice: src.BaseTicketPrice,
          Status: 'SCHEDULED',
        },
        conn
      );
      created.push(inserted);
    }

    await conn.commit();

    return {
      createdCount: created.length,
      skippedCount: skipped.length,
      created,
      skipped,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
