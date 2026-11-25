import pool from '../config/db.js';

function buildShowtimeFilters({ cinemaId, roomId }, aliasSt = 'st', aliasRoom = 'r') {
  const conditions = [];
  const params = [];

  if (cinemaId) {
    conditions.push(`${aliasRoom}.CinemaID = ?`);
    params.push(cinemaId);
  }

  if (roomId) {
    conditions.push(`${aliasSt}.RoomID = ?`);
    params.push(roomId);
  }

  return { conditions, params };
}

export async function getDailyRevenue({ from, to, cinemaId, roomId }) {
  const { conditions, params } = buildShowtimeFilters({ cinemaId, roomId });
  const where = [
    "b.status = 'PAID'",
    'st.ShowDate BETWEEN ? AND ?',
    ...conditions,
  ].join(' AND ');

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS date,
            COALESCE(SUM(b.total_amount), 0) AS revenue
     FROM booking b
     JOIN showtimes st ON st.ShowtimeID = b.ShowtimeID
     JOIN rooms r ON r.RoomID = st.RoomID
     WHERE ${where}
     GROUP BY st.ShowDate
     ORDER BY st.ShowDate ASC`,
    [from, to, ...params]
  );
  return rows;
}

export async function getDailyTicketCount({ from, to, cinemaId, roomId }) {
  const { conditions, params } = buildShowtimeFilters({ cinemaId, roomId });
  const where = [
    "b.status = 'PAID'",
    "os.SeatStatus = 'BOOKED'",
    'st.ShowDate BETWEEN ? AND ?',
    ...conditions,
  ].join(' AND ');

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS date,
            COUNT(os.OrderSeatID) AS ticketCount
     FROM order_seats os
     JOIN booking b ON b.BookingID = os.BookingID
     JOIN showtimes st ON st.ShowtimeID = os.ShowtimeID
     JOIN rooms r ON r.RoomID = st.RoomID
     WHERE ${where}
     GROUP BY st.ShowDate
     ORDER BY st.ShowDate ASC`,
    [from, to, ...params]
  );
  return rows;
}

export async function getDateSnapshot({ date, cinemaId, roomId }) {
  const { conditions, params } = buildShowtimeFilters({ cinemaId, roomId });
  const extraWhere =
    conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

  const [[revRow]] = await pool.query(
    `SELECT COALESCE(SUM(b.total_amount), 0) AS revenue
     FROM booking b
     JOIN showtimes st ON st.ShowtimeID = b.ShowtimeID
     JOIN rooms r ON r.RoomID = st.RoomID
     WHERE b.status = 'PAID' AND st.ShowDate = ? ${extraWhere}`,
    [date, ...params]
  );

  const [[ticketRow]] = await pool.query(
    `SELECT COUNT(os.OrderSeatID) AS ticketsSold
     FROM order_seats os
     JOIN booking b ON b.BookingID = os.BookingID
     JOIN showtimes st ON st.ShowtimeID = os.ShowtimeID
     JOIN rooms r ON r.RoomID = st.RoomID
     WHERE b.status = 'PAID' AND os.SeatStatus = 'BOOKED' AND st.ShowDate = ? ${extraWhere}`,
    [date, ...params]
  );

  const [[screenRow]] = await pool.query(
    `SELECT COUNT(*) AS totalScreenings,
            SUM(CASE WHEN st.Status = 'COMPLETED' THEN 1 ELSE 0 END) AS completedScreenings,
            SUM(CASE WHEN st.Status IN ('SCHEDULED', 'CHECKIN_OPEN') THEN 1 ELSE 0 END) AS upcomingScreenings,
            COALESCE(SUM(CASE WHEN st.Status <> 'CANCELED' THEN r.Capacity ELSE 0 END), 0) AS totalCapacity
     FROM showtimes st
     JOIN rooms r ON r.RoomID = st.RoomID
     WHERE st.ShowDate = ? ${extraWhere}`,
    [date, ...params]
  );

  const ticketsSold = Number(ticketRow?.ticketsSold || 0);
  const totalCapacity = Number(screenRow?.totalCapacity || 0);
  const occupancyRate =
    totalCapacity > 0
      ? Number(((ticketsSold / totalCapacity) * 100).toFixed(1))
      : 0;

  return {
    date,
    revenue: Number(revRow?.revenue || 0),
    ticketsSold,
    totalCapacity,
    occupancyRate,
    totalScreenings: Number(screenRow?.totalScreenings || 0),
    completedScreenings: Number(screenRow?.completedScreenings || 0),
    upcomingScreenings: Number(screenRow?.upcomingScreenings || 0),
  };
}

export async function getAttendanceByTimeSlot({ date, cinemaId, roomId }) {
  const { conditions, params } = buildShowtimeFilters({ cinemaId, roomId });
  const extraWhere =
    conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT DATE_FORMAT(st.StartTime, '%H:00') AS slot,
            COUNT(os.OrderSeatID) AS ticketCount
     FROM showtimes st
     JOIN rooms r ON r.RoomID = st.RoomID
     LEFT JOIN order_seats os ON os.ShowtimeID = st.ShowtimeID AND os.SeatStatus = 'BOOKED'
     LEFT JOIN booking b ON b.BookingID = os.BookingID AND b.status = 'PAID'
     WHERE st.ShowDate = ? AND st.Status <> 'CANCELED' ${extraWhere}
       AND (os.OrderSeatID IS NULL OR b.BookingID IS NOT NULL)
     GROUP BY DATE_FORMAT(st.StartTime, '%H:00')
     ORDER BY slot ASC`,
    [date, ...params]
  );
  return rows.map((r) => ({
    slot: r.slot,
    ticketCount: Number(r.ticketCount || 0),
  }));
}

export async function getScreeningsForDate({ date, cinemaId, roomId }) {
  const { conditions, params } = buildShowtimeFilters({ cinemaId, roomId });
  const extraWhere =
    conditions.length > 0 ? `AND ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT st.ShowtimeID,
            DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS ShowDate,
            st.StartTime, st.EndTime, st.Status,
            m.Title AS MovieTitle,
            r.RoomID, r.RoomNumber, r.Capacity,
            COALESCE(SUM(CASE WHEN b.status = 'PAID' AND os.SeatStatus = 'BOOKED' THEN 1 ELSE 0 END), 0) AS SoldTickets
     FROM showtimes st
     JOIN movies m ON m.MovieID = st.MovieID
     JOIN rooms r ON r.RoomID = st.RoomID
     LEFT JOIN order_seats os ON os.ShowtimeID = st.ShowtimeID
     LEFT JOIN booking b ON b.BookingID = os.BookingID
     WHERE st.ShowDate = ? AND st.Status <> 'CANCELED' ${extraWhere}
     GROUP BY st.ShowtimeID, st.ShowDate, st.StartTime, st.EndTime, st.Status, m.Title, r.RoomID, r.RoomNumber, r.Capacity
     ORDER BY st.StartTime ASC`,
    [date, ...params]
  );

  return rows.map((row) => ({
    ...row,
    Capacity: Number(row.Capacity || 0),
    SoldTickets: Number(row.SoldTickets || 0),
  }));
}

export async function getOperationsSummary({ cinemaId } = {}) {
  const roomWhere = cinemaId ? 'WHERE CinemaID = ?' : '';
  const roomParams = cinemaId ? [cinemaId] : [];

  const [[roomRow]] = await pool.query(
    `SELECT COUNT(*) AS totalRooms,
            SUM(CASE WHEN Status = 'READY' THEN 1 ELSE 0 END) AS readyRooms,
            SUM(CASE WHEN Status <> 'READY' THEN 1 ELSE 0 END) AS attentionRooms
     FROM rooms
     ${roomWhere}`,
    roomParams
  );

  const refundWhere = cinemaId ? 'WHERE r.CinemaID = ?' : '';
  const [recentRefunds] = await pool.query(
    `SELECT rf.RefundID, rf.RefundReference, rf.RefundAmount, rf.Status,
            b.BookingCode, rf.RequestedAt
     FROM refunds rf
     JOIN booking b ON b.BookingID = rf.BookingID
     JOIN showtimes st ON st.ShowtimeID = b.ShowtimeID
     JOIN rooms r ON r.RoomID = st.RoomID
     ${refundWhere}
     ORDER BY rf.RequestedAt DESC
     LIMIT 3`,
    roomParams
  );

  return {
    totalRooms: Number(roomRow?.totalRooms || 0),
    readyRooms: Number(roomRow?.readyRooms || 0),
    attentionRooms: Number(roomRow?.attentionRooms || 0),
    recentRefunds,
  };
}
