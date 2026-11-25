import pool from '../config/db.js';

const BASE_SELECT = `
  SELECT st.ShowtimeID, st.MovieID, st.RoomID,
         DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS ShowDate,
         st.StartTime, st.EndTime, st.Format, st.BaseTicketPrice, st.Status, st.created_at,
         m.Code AS MovieCode, m.Title AS MovieTitle, m.Duration AS MovieDuration,
         r.RoomNumber, r.CinemaID, c.CinemaName
  FROM showtimes st
  JOIN movies m ON m.MovieID = st.MovieID
  JOIN rooms r ON r.RoomID = st.RoomID
  JOIN cinemas c ON c.CinemaID = r.CinemaID
`;

export async function findAll({
  cinemaId,
  roomId,
  movieId,
  date,
  status,
} = {}) {
  const conditions = [];
  const params = [];

  if (cinemaId) {
    conditions.push('r.CinemaID = ?');
    params.push(cinemaId);
  }

  if (roomId) {
    conditions.push('st.RoomID = ?');
    params.push(roomId);
  }

  if (movieId) {
    conditions.push('st.MovieID = ?');
    params.push(movieId);
  }

  if (date) {
    conditions.push('st.ShowDate = ?');
    params.push(date);
  }

  if (status) {
    conditions.push('st.Status = ?');
    params.push(status);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `${BASE_SELECT} ${whereClause} ORDER BY st.ShowDate ASC, st.StartTime ASC`,
    params
  );
  return rows;
}

export async function findById(showtimeId, conn = pool) {
  const [rows] = await conn.query(
    `${BASE_SELECT} WHERE st.ShowtimeID = ? LIMIT 1`,
    [showtimeId]
  );
  return rows[0] || null;
}

export async function findOverlapping(
  {
    roomId,
    showDate,
    newStartDateTime,
    newEndDateTime,
    excludeShowtimeId = null,
  },
  conn = pool
) {
  const params = [
    roomId,
    showDate,
    showDate,
    newEndDateTime,
    newStartDateTime,
  ];
  let excludeClause = '';

  if (excludeShowtimeId !== null && excludeShowtimeId !== undefined) {
    excludeClause = 'AND ShowtimeID <> ?';
    params.push(excludeShowtimeId);
  }

  const [rows] = await conn.query(
    `SELECT ShowtimeID, MovieID, RoomID,
            DATE_FORMAT(ShowDate, '%Y-%m-%d') AS ShowDate,
            StartTime, EndTime
     FROM showtimes
     WHERE RoomID = ?
       AND Status <> 'CANCELED'
       AND ShowDate BETWEEN DATE_SUB(?, INTERVAL 1 DAY) AND DATE_ADD(?, INTERVAL 1 DAY)
       AND TIMESTAMP(ShowDate, StartTime) < ?
       AND IF(
         EndTime < StartTime,
         DATE_ADD(TIMESTAMP(ShowDate, EndTime), INTERVAL 1 DAY),
         TIMESTAMP(ShowDate, EndTime)
       ) > ?
       ${excludeClause}`,
    params
  );
  return rows;
}

export async function create(data, conn = pool) {
  const [result] = await conn.query(
    `INSERT INTO showtimes (
      MovieID, RoomID, ShowDate, StartTime, EndTime, Format, BaseTicketPrice, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.MovieID,
      data.RoomID,
      data.ShowDate,
      data.StartTime,
      data.EndTime,
      data.Format ?? '2D Vietnamese Subs',
      data.BaseTicketPrice ?? 110000.0,
      data.Status ?? 'SCHEDULED',
    ]
  );
  return findById(result.insertId, conn);
}

export async function update(showtimeId, fields, conn = pool) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(showtimeId, conn);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...keys.map((key) => fields[key]), showtimeId];

  await conn.query(
    `UPDATE showtimes SET ${setClause} WHERE ShowtimeID = ?`,
    values
  );
  return findById(showtimeId, conn);
}

export async function hasPaidTickets(showtimeId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT 1
     FROM showtimes st
     WHERE st.ShowtimeID = ?
       AND (
         EXISTS (SELECT 1 FROM booking b WHERE b.ShowtimeID = st.ShowtimeID AND b.status = 'PAID')
         OR EXISTS (SELECT 1 FROM ticket t WHERE t.ShowtimeID = st.ShowtimeID AND t.status IN ('VALID', 'USED'))
         OR EXISTS (SELECT 1 FROM order_seats os WHERE os.ShowtimeID = st.ShowtimeID AND os.SeatStatus = 'BOOKED')
       )
     LIMIT 1`,
    [showtimeId]
  );
  return rows.length > 0;
}

export async function hasAnyBookingsOrTickets(showtimeId, conn = pool) {
  const [rows] = await conn.query(
    `SELECT 1
     FROM showtimes st
     WHERE st.ShowtimeID = ?
       AND (
         EXISTS (SELECT 1 FROM booking b WHERE b.ShowtimeID = st.ShowtimeID)
         OR EXISTS (SELECT 1 FROM ticket t WHERE t.ShowtimeID = st.ShowtimeID)
       )
     LIMIT 1`,
    [showtimeId]
  );
  return rows.length > 0;
}

export async function remove(showtimeId, conn = pool) {
  const [result] = await conn.query(
    'DELETE FROM showtimes WHERE ShowtimeID = ?',
    [showtimeId]
  );
  return result.affectedRows > 0;
}

export async function findByDateAndCinema(
  { sourceDate, cinemaId, roomId },
  conn = pool
) {
  const conditions = [
    'st.ShowDate = ?',
    'r.CinemaID = ?',
    "st.Status <> 'CANCELED'",
  ];
  const params = [sourceDate, cinemaId];

  if (roomId) {
    conditions.push('st.RoomID = ?');
    params.push(roomId);
  }

  const [rows] = await conn.query(
    `SELECT st.ShowtimeID, st.MovieID, st.RoomID,
            DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS ShowDate,
            st.StartTime, st.EndTime, st.Format, st.BaseTicketPrice,
            m.Duration AS MovieDuration, m.Title AS MovieTitle,
            r.RoomNumber
     FROM showtimes st
     JOIN rooms r ON r.RoomID = st.RoomID
     JOIN movies m ON m.MovieID = st.MovieID
     WHERE ${conditions.join(' AND ')}
     ORDER BY st.RoomID ASC, st.StartTime ASC`,
    params
  );
  return rows;
}
