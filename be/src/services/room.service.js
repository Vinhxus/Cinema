import pool from '../config/db.js';
import * as roomRepository from '../repositories/room.repository.js';
import * as cinemaRepository from '../repositories/cinema.repository.js';
import { AppError } from '../utils/AppError.js';

function pickDefined(target, key, value) {
  if (value !== undefined) {
    target[key] = value;
  }
}

function mapRoomFields(payload) {
  const mapped = {};
  pickDefined(mapped, 'CinemaID', payload.cinemaId ?? payload.cinema_id);
  pickDefined(
    mapped,
    'RoomNumber',
    payload.roomNumber ?? payload.room_number
  );
  pickDefined(mapped, 'RoomType', payload.roomType ?? payload.room_type);
  pickDefined(
    mapped,
    'FormatDescription',
    payload.formatDescription ?? payload.format_description
  );
  pickDefined(mapped, 'HallNote', payload.hallNote ?? payload.hall_note);
  pickDefined(mapped, 'Capacity', payload.capacity);
  pickDefined(mapped, 'Status', payload.status);
  return mapped;
}

function buildSeatTypeLookup(seatTypes) {
  const idSet = new Set();
  const codeMap = new Map();

  for (const st of seatTypes) {
    idSet.add(Number(st.SeatTypeID));
    codeMap.set(String(st.TypeCode).toLowerCase(), Number(st.SeatTypeID));
    codeMap.set(String(st.TypeName).toLowerCase(), Number(st.SeatTypeID));
  }

  return { idSet, codeMap };
}

function resolveSeatTypeId(seat, lookup) {
  const rawId = seat.seatTypeId ?? seat.seat_type_id;
  if (rawId !== undefined) {
    const id = Number(rawId);
    if (!lookup.idSet.has(id)) {
      throw new AppError(`Invalid seat type id: ${rawId}`, 400);
    }
    return id;
  }

  const rawCode = seat.typeCode ?? seat.type_code ?? seat.seatType ?? seat.seat_type;
  if (rawCode !== undefined) {
    const normalized = String(rawCode).trim().toLowerCase();
    const mapped = lookup.codeMap.get(normalized);
    if (!mapped) {
      throw new AppError(`Invalid seat type: ${rawCode}`, 400);
    }
    return mapped;
  }

  return undefined;
}

function resolveSeatIsActive(seat) {
  const rawActive = seat.isActive ?? seat.is_active;
  if (rawActive !== undefined) {
    return Boolean(rawActive);
  }
  if (seat.status !== undefined) {
    return seat.status === 'ACTIVE';
  }
  return undefined;
}

export async function listRooms(query) {
  return roomRepository.findAll({
    cinemaId: query.cinema_id ?? query.cinemaId,
    status: query.status,
  });
}

export async function createRoom(payload) {
  const data = mapRoomFields(payload);
  const cinema = await cinemaRepository.findById(data.CinemaID);
  if (!cinema) {
    throw new AppError('Cinema not found', 404);
  }

  return roomRepository.create(data);
}

export async function updateRoom(roomId, payload) {
  const existing = await roomRepository.findById(roomId);
  if (!existing) {
    throw new AppError('Room not found', 404);
  }

  const fields = mapRoomFields(payload);
  if (fields.CinemaID !== undefined) {
    const cinema = await cinemaRepository.findById(fields.CinemaID);
    if (!cinema) {
      throw new AppError('Cinema not found', 404);
    }
  }

  return roomRepository.update(roomId, fields);
}

export async function deleteRoom(roomId) {
  const existing = await roomRepository.findById(roomId);
  if (!existing) {
    throw new AppError('Room not found', 404);
  }

  const hasBookings = await roomRepository.hasBookingsOrTickets(roomId);
  if (hasBookings) {
    throw new AppError(
      'Cannot delete room because it has existing bookings or tickets',
      400
    );
  }

  await roomRepository.remove(roomId);
  return { deletedId: roomId };
}

export async function getRoomLayout(roomId) {
  const room = await roomRepository.findById(roomId);
  if (!room) {
    throw new AppError('Room not found', 404);
  }

  const seats = await roomRepository.getSeatsByRoomId(roomId);
  return { room, seats };
}

export async function updateRoomLayout(roomId, payload) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();

    const room = await roomRepository.findById(roomId, conn);
    if (!room) {
      throw new AppError('Room not found', 404);
    }

    const blocked =
      await roomRepository.hasActiveShowtimesWithSoldOrHeldTickets(roomId, conn);
    if (blocked) {
      throw new AppError(
        'Cannot update room layout while room has active or upcoming showtimes with sold or held tickets',
        400
      );
    }

    const seatTypes = await roomRepository.getAllSeatTypes(conn);
    const lookup = buildSeatTypeLookup(seatTypes);
    const replaceAll = Boolean(payload.replaceAll ?? payload.replace_all);
    const keepLabels = [];

    for (const item of payload.seats) {
      const seatId = item.seatId ?? item.seat_id;
      const seatTypeId = resolveSeatTypeId(item, lookup);
      const isActive = resolveSeatIsActive(item);
      const seatRow = item.seatRow ?? item.seat_row;
      const seatNumber = item.seatNumber ?? item.seat_number;
      const derivedLabel =
        seatRow !== undefined && seatNumber !== undefined
          ? `${seatRow}${String(seatNumber).padStart(2, '0')}`
          : undefined;
      const seatLabel = item.seatLabel ?? item.seat_label ?? derivedLabel;

      if (!replaceAll && seatId !== undefined) {
        const currentSeat = await roomRepository.findSeatByIdInRoom(
          roomId,
          seatId,
          conn
        );
        if (!currentSeat) {
          throw new AppError(`Seat ${seatId} not found in this room`, 404);
        }

        const updateFields = {};
        pickDefined(updateFields, 'SeatTypeID', seatTypeId);
        pickDefined(updateFields, 'SeatRow', seatRow);
        pickDefined(updateFields, 'SeatNumber', seatNumber);
        pickDefined(updateFields, 'SeatLabel', item.seatLabel ?? item.seat_label);
        pickDefined(updateFields, 'IsActive', isActive);

        await roomRepository.updateSeatById(roomId, seatId, updateFields, conn);
        continue;
      }

      if (
        !replaceAll &&
        seatLabel !== undefined &&
        (seatRow === undefined || seatNumber === undefined || seatTypeId === undefined)
      ) {
        const existingByLabel = await roomRepository.findSeatByLabelInRoom(
          roomId,
          seatLabel,
          conn
        );
        if (existingByLabel) {
          const updateFields = {};
          pickDefined(updateFields, 'SeatTypeID', seatTypeId);
          pickDefined(updateFields, 'SeatRow', seatRow);
          pickDefined(updateFields, 'SeatNumber', seatNumber);
          pickDefined(updateFields, 'IsActive', isActive);

          await roomRepository.updateSeatById(
            roomId,
            existingByLabel.SeatID,
            updateFields,
            conn
          );
          continue;
        }
      }

      if (!seatRow || !seatNumber || !seatLabel || seatTypeId === undefined) {
        throw new AppError(
          'Each seat requires seat_row, seat_number, seat_label, and seat_type',
          400
        );
      }

      await roomRepository.upsertSeat(
        roomId,
        {
          SeatTypeID: seatTypeId,
          SeatRow: seatRow,
          SeatNumber: seatNumber,
          SeatLabel: seatLabel,
          IsActive: isActive ?? true,
        },
        conn
      );

      if (replaceAll) {
        keepLabels.push(seatLabel);
      }
    }

    if (replaceAll) {
      await roomRepository.deleteSeatsNotInLabels(roomId, keepLabels, conn);
    }

    await roomRepository.syncRoomCapacity(roomId, conn);

    const updatedRoom = await roomRepository.findById(roomId, conn);
    const updatedSeats = await roomRepository.getSeatsByRoomId(roomId, conn);

    await conn.commit();
    return { room: updatedRoom, seats: updatedSeats };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}
