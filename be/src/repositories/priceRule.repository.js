import pool from '../config/db.js';

export async function findAll({ typeCode } = {}) {
  const conditions = [];
  const params = [];

  if (typeCode) {
    conditions.push('TypeCode = ?');
    params.push(typeCode);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT SeatTypeID, TypeCode, TypeName, BasePrice, Surcharge, SeatsPerUnit,
            (BasePrice + Surcharge) AS EffectivePrice
     FROM seat_types
     ${whereClause}
     ORDER BY SeatTypeID ASC`,
    params
  );
  return rows;
}

export async function findById(seatTypeId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT SeatTypeID, TypeCode, TypeName, BasePrice, Surcharge, SeatsPerUnit,
            (BasePrice + Surcharge) AS EffectivePrice
     FROM seat_types
     WHERE SeatTypeID = ?
     LIMIT 1`,
    [seatTypeId]
  );
  return rows[0] || null;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO seat_types (
      TypeCode, TypeName, BasePrice, Surcharge, SeatsPerUnit
    ) VALUES (?, ?, ?, ?, ?)`,
    [
      data.TypeCode,
      data.TypeName,
      data.BasePrice,
      data.Surcharge ?? 0.0,
      data.SeatsPerUnit ?? 1,
    ]
  );
  return findById(result.insertId);
}

export async function update(seatTypeId, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(seatTypeId);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...keys.map((key) => fields[key]), seatTypeId];

  await pool.query(
    `UPDATE seat_types SET ${setClause} WHERE SeatTypeID = ?`,
    values
  );
  return findById(seatTypeId);
}

export async function isAssignedToSeats(seatTypeId) {
  const [rows] = await pool.query(
    'SELECT 1 FROM seats WHERE SeatTypeID = ? LIMIT 1',
    [seatTypeId]
  );
  return rows.length > 0;
}

export async function remove(seatTypeId) {
  const [result] = await pool.query(
    'DELETE FROM seat_types WHERE SeatTypeID = ?',
    [seatTypeId]
  );
  return result.affectedRows > 0;
}

export async function applyShowtimeSurcharge(filters, conn) {
  const conditions = [
    "st.Status IN ('SCHEDULED', 'CHECKIN_OPEN')",
    "NOT EXISTS (SELECT 1 FROM booking b WHERE b.ShowtimeID = st.ShowtimeID AND b.status = 'PAID')",
  ];
  const params = [];

  let setClause;
  if (filters.baseTicketPrice !== undefined) {
    setClause = 'st.BaseTicketPrice = ?';
    params.push(filters.baseTicketPrice);
  } else {
    setClause = 'st.BaseTicketPrice = GREATEST(0, st.BaseTicketPrice + ?)';
    params.push(filters.surchargeDelta);
  }

  if (filters.cinemaId) {
    conditions.push('r.CinemaID = ?');
    params.push(filters.cinemaId);
  }

  if (filters.roomId) {
    conditions.push('st.RoomID = ?');
    params.push(filters.roomId);
  }

  if (filters.dateFrom) {
    conditions.push('st.ShowDate >= ?');
    params.push(filters.dateFrom);
  }

  if (filters.dateTo) {
    conditions.push('st.ShowDate <= ?');
    params.push(filters.dateTo);
  }

  if (filters.startTimeFrom) {
    conditions.push('st.StartTime >= ?');
    params.push(filters.startTimeFrom);
  }

  if (filters.startTimeTo) {
    conditions.push('st.StartTime <= ?');
    params.push(filters.startTimeTo);
  }

  if (filters.weekendOnly) {
    conditions.push('DAYOFWEEK(st.ShowDate) IN (1, 6, 7)');
  }

  const [result] = await conn.query(
    `UPDATE showtimes st
     JOIN rooms r ON r.RoomID = st.RoomID
     SET ${setClause}
     WHERE ${conditions.join(' AND ')}`,
    params
  );

  return result.affectedRows;
}
