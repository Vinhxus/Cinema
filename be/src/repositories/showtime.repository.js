import pool from '../config/db.js';

/** Người dùng có thể nhập % hoặc _ => escape để LIKE hiểu là ký tự thường. */
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

/**
 * Số ghế trống được tính ngay trong SQL:
 *   (ghế đang hoạt động của phòng) - (ghế đã HELD/BOOKED của suất)
 * GREATEST(..., 0) để không bao giờ trả số âm.
 */
const SHOWTIME_SELECT = `
  SELECT st.ShowtimeID,
         st.MovieID,
         DATE_FORMAT(st.ShowDate, '%Y-%m-%d') AS ShowDate,
         TIME_FORMAT(st.StartTime, '%H:%i') AS StartTime,
         TIME_FORMAT(st.EndTime, '%H:%i') AS EndTime,
         st.Format,
         st.BaseTicketPrice,
         st.Status,
         r.RoomID,
         r.RoomNumber,
         r.RoomType,
         r.FormatDescription,
         r.HallNote,
         c.CinemaID,
         c.Slug,
         c.CinemaName,
         c.Branch,
         c.Address,
         c.City,
         c.DistanceLabel,
         c.Perk,
         (SELECT COUNT(*)
            FROM seats s
           WHERE s.RoomID = r.RoomID AND s.IsActive = TRUE) AS RoomSeats,
         GREATEST(
           (SELECT COUNT(*)
              FROM seats s
             WHERE s.RoomID = r.RoomID AND s.IsActive = TRUE)
           - (SELECT COUNT(*)
                FROM order_seats os
               WHERE os.ShowtimeID = st.ShowtimeID
                 AND os.SeatStatus IN ('HELD', 'BOOKED')),
           0
         ) AS AvailableSeats
  FROM showtimes st
  JOIN rooms r ON r.RoomID = st.RoomID
  JOIN cinemas c ON c.CinemaID = r.CinemaID
`;

/** Toàn bộ suất chiếu của 1 phim trong khoảng ngày [from, to]. */
export async function findShowtimesInRange({ movieId, from, to, cinemaId, format }) {
  const conditions = [
    'st.MovieID = ?',
    "st.Status <> 'CANCELED'",
    'st.ShowDate BETWEEN ? AND ?',
  ];
  const params = [movieId, from, to];

  if (cinemaId) {
    conditions.push('c.CinemaID = ?');
    params.push(cinemaId);
  }

  if (format) {
    conditions.push('st.Format LIKE ?');
    params.push(`%${escapeLike(format)}%`);
  }

  const [rows] = await pool.query(
    `${SHOWTIME_SELECT}
     WHERE ${conditions.join(' AND ')}
     ORDER BY st.ShowDate ASC, c.CinemaID ASC, st.StartTime ASC, st.ShowtimeID ASC`,
    params
  );

  return rows;
}