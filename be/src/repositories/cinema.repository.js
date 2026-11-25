import pool from '../config/db.js';

/**
 * Danh sách cụm rạp kèm số phòng chiếu.
 * - RoomCount: tổng số phòng của cụm.
 * - ReadyRoomCount: số phòng đang READY (sẵn sàng bán vé).
 * - ReadyCapacity: tổng số ghế của các phòng READY.
 */
export async function findCinemas() {
  const [rows] = await pool.query(
    `SELECT c.CinemaID,
            c.Slug,
            c.CinemaName,
            c.Branch,
            c.Address,
            c.City,
            c.DistanceLabel,
            c.Perk,
            c.MapUrl,
            COUNT(r.RoomID) AS RoomCount,
            COALESCE(SUM(CASE WHEN r.Status = 'READY' THEN 1 ELSE 0 END), 0) AS ReadyRoomCount,
            COALESCE(SUM(CASE WHEN r.Status = 'READY' THEN r.Capacity ELSE 0 END), 0) AS ReadyCapacity
     FROM cinemas c
     LEFT JOIN rooms r ON r.CinemaID = c.CinemaID
     GROUP BY c.CinemaID
     ORDER BY c.CinemaID ASC`
  );

  return rows;
}