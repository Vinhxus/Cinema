import pool from '../config/db.js';

const TICKET_DETAIL_SELECT = `
  SELECT t.TicketNo, t.BookingID, t.ShowtimeID, t.SeatID, t.Barcode,
         t.Price, t.SeatRow, t.SeatNumber, t.SeatLabel, t.SeatType,
         t.CinemaID, t.RoomNumber, t.Gate,
         DATE_FORMAT(t.Date, '%Y-%m-%d') AS Date,
         t.Time, t.status, t.checkin_time, t.checkin_staff_id,
         b.BookingCode, b.customer_name, b.customer_phone, b.customer_email,
         st.Format, st.StartTime, st.EndTime, st.Status AS ShowtimeStatus,
         m.Title AS MovieTitle,
         c.CinemaName,
         u.name AS CheckinStaffName
  FROM ticket t
  JOIN booking b ON b.BookingID = t.BookingID
  JOIN showtimes st ON st.ShowtimeID = t.ShowtimeID
  JOIN movies m ON m.MovieID = st.MovieID
  JOIN cinemas c ON c.CinemaID = t.CinemaID
  LEFT JOIN users u ON u.UserID = t.checkin_staff_id
`;

export async function findTicketDetailByTicketNo(ticketNo, conn = pool) {
  const [rows] = await conn.query(
    `${TICKET_DETAIL_SELECT} WHERE t.TicketNo = ? LIMIT 1`,
    [ticketNo]
  );
  return rows[0] || null;
}

export async function findTicketDetailByBarcode(barcode, conn = pool) {
  const [rows] = await conn.query(
    `${TICKET_DETAIL_SELECT} WHERE t.Barcode = ? LIMIT 1`,
    [barcode]
  );
  return rows[0] || null;
}

export async function searchTickets(
  { q, cinemaId, showtimeId },
  conn = pool
) {
  const conditions = [
    '(t.TicketNo = ? OR t.Barcode = ? OR b.BookingCode = ? OR b.customer_phone = ?)',
  ];
  const params = [q, q, q, q];

  if (cinemaId) {
    conditions.push('t.CinemaID = ?');
    params.push(cinemaId);
  }

  if (showtimeId) {
    conditions.push('t.ShowtimeID = ?');
    params.push(showtimeId);
  }

  const [rows] = await conn.query(
    `${TICKET_DETAIL_SELECT}
     WHERE ${conditions.join(' AND ')}
     ORDER BY FIELD(t.status, 'VALID', 'USED', 'CANCELED', 'REFUNDED'), t.Date DESC, t.Time DESC`,
    params
  );
  return rows;
}

export async function markTicketUsed(ticketNo, staffUserId, conn) {
  const [result] = await conn.query(
    `UPDATE ticket
     SET status = 'USED', checkin_time = NOW(), checkin_staff_id = ?
     WHERE TicketNo = ? AND status = 'VALID'`,
    [staffUserId, ticketNo]
  );
  return result.affectedRows;
}

export async function insertAuditLog(
  { userId, action, details, ipAddress },
  conn = pool
) {
  await conn.query(
    'INSERT INTO audit_logs (UserID, Action, Details, IPAddress) VALUES (?, ?, ?, ?)',
    [userId, action, JSON.stringify(details), ipAddress || null]
  );
}

export async function getRecentCheckins({
  cinemaId,
  showtimeId,
  limit = 20,
} = {}) {
  const conditions = ["t.status = 'USED'"];
  const params = [];

  if (cinemaId) {
    conditions.push('t.CinemaID = ?');
    params.push(cinemaId);
  }

  if (showtimeId) {
    conditions.push('t.ShowtimeID = ?');
    params.push(showtimeId);
  }

  params.push(Number(limit));

  const [rows] = await pool.query(
    `${TICKET_DETAIL_SELECT}
     WHERE ${conditions.join(' AND ')}
     ORDER BY t.checkin_time DESC
     LIMIT ?`,
    params
  );
  return rows;
}

export async function getShowtimeCheckinCounts(showtimeId) {
  const [[row]] = await pool.query(
    `SELECT SUM(CASE WHEN status = 'USED' THEN 1 ELSE 0 END) AS admittedCount,
            SUM(CASE WHEN status IN ('VALID', 'USED') THEN 1 ELSE 0 END) AS totalTickets
     FROM ticket
     WHERE ShowtimeID = ?`,
    [showtimeId]
  );

  return {
    admittedCount: Number(row?.admittedCount || 0),
    totalTickets: Number(row?.totalTickets || 0),
  };
}

export async function getStaffShowtimes({ cinemaId, date } = {}) {
  const conditions = ["st.Status <> 'CANCELED'"];
  const params = [];

  if (date) {
    conditions.push('st.ShowDate = ?');
    params.push(date);
  }

  if (cinemaId) {
    conditions.push('r.CinemaID = ?');
    params.push(cinemaId);
  }

  const [rows] = await pool.query(
    `SELECT st.ShowtimeID,
            DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS ShowDate,
            st.StartTime, st.EndTime, st.Format, st.Status,
            m.Title AS MovieTitle,
            r.RoomID, r.RoomNumber, r.CinemaID, c.CinemaName,
            COALESCE(SUM(CASE WHEN t.status = 'USED' THEN 1 ELSE 0 END), 0) AS AdmittedCount,
            COALESCE(SUM(CASE WHEN t.status IN ('VALID', 'USED') THEN 1 ELSE 0 END), 0) AS TotalTickets
     FROM showtimes st
     JOIN movies m ON m.MovieID = st.MovieID
     JOIN rooms r ON r.RoomID = st.RoomID
     JOIN cinemas c ON c.CinemaID = r.CinemaID
     LEFT JOIN ticket t ON t.ShowtimeID = st.ShowtimeID
     WHERE ${conditions.join(' AND ')}
     GROUP BY st.ShowtimeID, st.ShowDate, st.StartTime, st.EndTime, st.Format, st.Status,
              m.Title, r.RoomID, r.RoomNumber, r.CinemaID, c.CinemaName
     ORDER BY st.ShowDate ASC, st.StartTime ASC`,
    params
  );

  return rows.map((r) => ({
    ...r,
    AdmittedCount: Number(r.AdmittedCount || 0),
    TotalTickets: Number(r.TotalTickets || 0),
  }));
}
