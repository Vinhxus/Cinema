import jwt from 'jsonwebtoken';
import pool from '../config/db.js';
import * as staffRepository from '../repositories/staff.repository.js';
import * as cinemaRepository from '../repositories/cinema.repository.js';
import { AppError } from '../utils/AppError.js';

function getTodayUtc7() {
  const now = new Date(Date.now() + 7 * 60 * 60 * 1000);
  return now.toISOString().slice(0, 10);
}

function verifyQrToken(qrToken) {
  try {
    const secret = process.env.JWT_SECRET || 'cinema_secret_2026';
    return jwt.verify(qrToken, secret);
  } catch {
    throw new AppError('Invalid or expired QR ticket token', 400);
  }
}

export async function listCinemas() {
  return cinemaRepository.findAll();
}

export async function listShowtimes(query) {
  return staffRepository.getStaffShowtimes({
    cinemaId: query.cinema_id ?? query.cinemaId,
    date: query.date || getTodayUtc7(),
  });
}

export async function listCheckins(query) {
  const cinemaId = query.cinema_id ?? query.cinemaId;
  const showtimeId = query.showtime_id ?? query.showtimeId;
  const limit = query.limit ?? 20;

  const checkins = await staffRepository.getRecentCheckins({
    cinemaId,
    showtimeId,
    limit,
  });

  const counts = showtimeId
    ? await staffRepository.getShowtimeCheckinCounts(showtimeId)
    : null;

  return { checkins, counts };
}

export async function lookupTickets(query) {
  const tickets = await staffRepository.searchTickets({
    q: query.q,
    cinemaId: query.cinema_id ?? query.cinemaId,
    showtimeId: query.showtime_id ?? query.showtimeId,
  });
  return tickets;
}

export async function checkinTicket(payload, staffUser, ipAddress) {
  const qrToken = payload.qr_token ?? payload.qrToken;
  const ticketNoInput = payload.ticket_no ?? payload.ticketNo;
  const barcodeInput = payload.barcode;
  const bookingCodeInput = payload.booking_code ?? payload.bookingCode;
  const phoneInput = payload.phone_number ?? payload.phoneNumber;
  const expectedCinemaId = payload.cinema_id ?? payload.cinemaId;
  const expectedShowtimeId = payload.showtime_id ?? payload.showtimeId;

  let ticket = null;

  if (qrToken) {
    const decoded = verifyQrToken(qrToken);
    const decodedTicketNo = decoded.ticketNo || decoded.TicketNo || decoded.ticket_no;
    const decodedBarcode = decoded.barcode || decoded.Barcode;

    if (decodedTicketNo) {
      ticket = await staffRepository.findTicketDetailByTicketNo(decodedTicketNo);
    } else if (decodedBarcode) {
      ticket = await staffRepository.findTicketDetailByBarcode(decodedBarcode);
    } else {
      throw new AppError('QR token payload is missing ticket identifier', 400);
    }
  } else if (ticketNoInput) {
    ticket = await staffRepository.findTicketDetailByTicketNo(ticketNoInput);
  } else if (barcodeInput) {
    ticket = await staffRepository.findTicketDetailByBarcode(barcodeInput);
  } else {
    const queryTerm = bookingCodeInput || phoneInput;
    const matches = await staffRepository.searchTickets({
      q: queryTerm,
      cinemaId: expectedCinemaId,
      showtimeId: expectedShowtimeId,
    });
    if (matches.length > 0) {
      ticket = matches[0];
    }
  }

  if (!ticket) {
    throw new AppError('Ticket not found', 404);
  }

  if (
    expectedCinemaId !== undefined &&
    Number(ticket.CinemaID) !== Number(expectedCinemaId)
  ) {
    throw new AppError(
      `Ticket belongs to ${ticket.CinemaName}, not the selected cinema`,
      400,
      { code: 'CINEMA_MISMATCH', ticket }
    );
  }

  if (
    expectedShowtimeId !== undefined &&
    Number(ticket.ShowtimeID) !== Number(expectedShowtimeId)
  ) {
    throw new AppError(
      `Ticket is for ${ticket.RoomNumber} at ${ticket.Time}, not the selected showtime`,
      400,
      { code: 'SHOWTIME_MISMATCH', ticket }
    );
  }

  if (ticket.status === 'USED') {
    throw new AppError('Ticket has already been checked in', 409, {
      code: 'ALREADY_USED',
      ticket,
    });
  }

  if (ticket.status !== 'VALID') {
    throw new AppError(`Ticket cannot be admitted (status: ${ticket.status})`, 400, {
      code: 'INVALID_STATUS',
      ticket,
    });
  }

  const staffUserId = staffUser?.userId ?? staffUser?.UserID ?? null;
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const affected = await staffRepository.markTicketUsed(
      ticket.TicketNo,
      staffUserId,
      conn
    );

    if (affected === 0) {
      const latest = await staffRepository.findTicketDetailByTicketNo(
        ticket.TicketNo,
        conn
      );
      throw new AppError('Ticket has already been checked in', 409, {
        code: 'ALREADY_USED',
        ticket: latest,
      });
    }

    await staffRepository.insertAuditLog(
      {
        userId: staffUserId,
        action: 'TICKET_CHECKIN',
        details: {
          ticketNo: ticket.TicketNo,
          bookingCode: ticket.BookingCode,
          gate: ticket.Gate,
          showtimeId: ticket.ShowtimeID,
        },
        ipAddress,
      },
      conn
    );

    const updatedTicket = await staffRepository.findTicketDetailByTicketNo(
      ticket.TicketNo,
      conn
    );

    await conn.commit();
    return updatedTicket;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
