import pool from '../config/db.js';

export async function findAll({ cinemaId, status } = {}) {
  const conditions = [];
  const params = [];

  if (cinemaId) {
    conditions.push('r.CinemaID = ?');
    params.push(cinemaId);
  }

  if (status) {
    conditions.push('r.Status = ?');
    params.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT r.*, c.CinemaName
     FROM rooms r
     JOIN cinemas c ON c.CinemaID = r.CinemaID
     ${whereClause}
     ORDER BY r.CinemaID ASC, r.RoomID ASC`,
    params
  );
  return rows;
}

export async function findById(roomId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT r.*, c.CinemaName
     FROM rooms r
     JOIN cinemas c ON c.CinemaID = r.CinemaID
     WHERE r.RoomID = ?
     LIMIT 1`,
    [roomId]
  );
  return rows[0] || null;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO rooms (
      CinemaID, RoomNumber, RoomType, FormatDescription, HallNote, Capacity, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      data.CinemaID,
      data.RoomNumber,
      data.RoomType ?? '2D',
      data.FormatDescription ?? null,
      data.HallNote ?? null,
      data.Capacity ?? 100,
      data.Status ?? 'READY',
    ]
  );
  return findById(result.insertId);
}

export async function update(roomId, fields, conn = pool) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(roomId, conn);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...keys.map((key) => fields[key]), roomId];

  await conn.query(
    `UPDATE rooms SET ${setClause} WHERE RoomID = ?`,
    values
  );
  return findById(roomId, conn);
}

export async function hasBookingsOrTickets(roomId) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM showtimes st
     WHERE st.RoomID = ?
       AND (
         EXISTS (SELECT 1 FROM booking b WHERE b.ShowtimeID = st.ShowtimeID)
         OR EXISTS (SELECT 1 FROM ticket t WHERE t.ShowtimeID = st.ShowtimeID)
       )
     LIMIT 1`,
    [roomId]
  );
  return rows.length > 0;
}

export async function remove(roomId) {
  const [result] = await pool.query(
    'DELETE FROM rooms WHERE RoomID = ?',
    [roomId]
  );
  return result.affectedRows > 0;
}

export async function getSeatsByRoomId(roomId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT s.SeatID, s.RoomID, s.SeatTypeID, s.SeatRow, s.SeatNumber, s.SeatLabel, s.IsActive,
            st.TypeCode, st.TypeName, st.BasePrice, st.Surcharge, st.SeatsPerUnit
     FROM seats s
     JOIN seat_types st ON st.SeatTypeID = s.SeatTypeID
     WHERE s.RoomID = ?
     ORDER BY s.SeatRow ASC, s.SeatNumber ASC`,
    [roomId]
  );
  return rows;
}

export async function getAllSeatTypes(conn = pool) {
  const [rows] = await conn.query(
    'SELECT SeatTypeID, TypeCode, TypeName, BasePrice, Surcharge, SeatsPerUnit FROM seat_types ORDER BY SeatTypeID ASC'
  );
  return rows;
}

export async function hasActiveShowtimesWithSoldOrHeldTickets(roomId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT 1
     FROM showtimes st
     WHERE st.RoomID = ?
       AND st.Status IN ('SCHEDULED', 'CHECKIN_OPEN')
       AND IF(
         st.EndTime < st.StartTime,
         DATE_ADD(TIMESTAMP(st.ShowDate, st.EndTime), INTERVAL 1 DAY),
         TIMESTAMP(st.ShowDate, st.EndTime)
       ) >= NOW()
       AND (
         EXISTS (
           SELECT 1
           FROM order_seats os
           WHERE os.ShowtimeID = st.ShowtimeID AND os.SeatStatus IN ('HELD', 'BOOKED')
         )
         OR EXISTS (
           SELECT 1
           FROM booking b
           WHERE b.ShowtimeID = st.ShowtimeID AND b.status IN ('HOLDING', 'CHECKOUT_PENDING', 'PAID')
         )
         OR EXISTS (
           SELECT 1
           FROM ticket t
           WHERE t.ShowtimeID = st.ShowtimeID AND t.status IN ('VALID', 'USED')
         )
       )
     LIMIT 1`,
    [roomId]
  );
  return rows.length > 0;
}

export async function findSeatByIdInRoom(roomId, seatId, conn = pool) {
  const [rows] = await conn.query(
    'SELECT * FROM seats WHERE RoomID = ? AND SeatID = ? LIMIT 1',
    [roomId, seatId]
  );
  return rows[0] || null;
}

export async function findSeatByLabelInRoom(roomId, seatLabel, conn = pool) {
  const [rows] = await conn.query(
    'SELECT * FROM seats WHERE RoomID = ? AND SeatLabel = ? LIMIT 1',
    [roomId, seatLabel]
  );
  return rows[0] || null;
}

export async function updateSeatById(roomId, seatId, fields, conn) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return 0;
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...keys.map((key) => fields[key]), seatId, roomId];

  const [result] = await conn.query(
    `UPDATE seats SET ${setClause} WHERE SeatID = ? AND RoomID = ?`,
    values
  );
  return result.affectedRows;
}

export async function upsertSeat(roomId, seatData, conn) {
  await conn.query(
    `INSERT INTO seats (RoomID, SeatTypeID, SeatRow, SeatNumber, SeatLabel, IsActive)
     VALUES (?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
       SeatTypeID = VALUES(SeatTypeID),
       SeatRow = VALUES(SeatRow),
       SeatNumber = VALUES(SeatNumber),
       IsActive = VALUES(IsActive)`,
    [
      roomId,
      seatData.SeatTypeID,
      seatData.SeatRow,
      seatData.SeatNumber,
      seatData.SeatLabel,
      seatData.IsActive,
    ]
  );
}

export async function deleteSeatsNotInLabels(roomId, keepLabels, conn) {
  let rows;
  if (keepLabels.length > 0) {
    const placeholders = keepLabels.map(() => '?').join(', ');
    [rows] = await conn.query(
      `SELECT SeatID FROM seats WHERE RoomID = ? AND SeatLabel NOT IN (${placeholders})`,
      [roomId, ...keepLabels]
    );
  } else {
    [rows] = await conn.query(
      'SELECT SeatID FROM seats WHERE RoomID = ?',
      [roomId]
    );
  }

  if (rows.length === 0) {
    return;
  }

  const candidateIds = rows.map((r) => r.SeatID);
  const idPlaceholders = candidateIds.map(() => '?').join(', ');

  const [refRows] = await conn.query(
    `SELECT DISTINCT SeatID FROM ticket WHERE SeatID IN (${idPlaceholders})`,
    candidateIds
  );
  const referencedSet = new Set(refRows.map((r) => r.SeatID));

  const toDeactivate = candidateIds.filter((id) => referencedSet.has(id));
  const toDelete = candidateIds.filter((id) => !referencedSet.has(id));

  if (toDeactivate.length > 0) {
    const deactPlaceholders = toDeactivate.map(() => '?').join(', ');
    await conn.query(
      `UPDATE seats SET IsActive = FALSE WHERE SeatID IN (${deactPlaceholders})`,
      toDeactivate
    );
  }

  if (toDelete.length > 0) {
    const delPlaceholders = toDelete.map(() => '?').join(', ');
    await conn.query(
      `DELETE FROM seats WHERE SeatID IN (${delPlaceholders})`,
      toDelete
    );
  }
}

export async function syncRoomCapacity(roomId, conn) {
  await conn.query(
    `UPDATE rooms
     SET Capacity = (SELECT COUNT(*) FROM seats WHERE RoomID = ? AND IsActive = TRUE)
     WHERE RoomID = ?`,
    [roomId, roomId]
  );
}
