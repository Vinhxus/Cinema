import pool from '../config/db.js';

export async function findAll({ search, city } = {}) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(CinemaName LIKE ? OR Slug LIKE ? OR Address LIKE ?)');
    const pattern = `%${search}%`;
    params.push(pattern, pattern, pattern);
  }

  if (city) {
    conditions.push('City = ?');
    params.push(city);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT * FROM cinemas ${whereClause} ORDER BY CinemaID ASC`,
    params
  );
  return rows;
}

export async function findById(cinemaId, conn = pool) {
  const [rows] = await conn.query(
    'SELECT * FROM cinemas WHERE CinemaID = ? LIMIT 1',
    [cinemaId]
  );
  return rows[0] || null;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO cinemas (
      Slug, CinemaName, Branch, Address, City, DistanceLabel, Perk, MapUrl
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.Slug,
      data.CinemaName,
      data.Branch ?? null,
      data.Address,
      data.City ?? 'Ho Chi Minh City',
      data.DistanceLabel ?? null,
      data.Perk ?? null,
      data.MapUrl ?? null,
    ]
  );
  return findById(result.insertId);
}

export async function update(cinemaId, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(cinemaId);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...keys.map((key) => fields[key]), cinemaId];

  await pool.query(
    `UPDATE cinemas SET ${setClause} WHERE CinemaID = ?`,
    values
  );
  return findById(cinemaId);
}

export async function hasBookingsOrTickets(cinemaId) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM cinemas c
     WHERE c.CinemaID = ?
       AND (
         EXISTS (SELECT 1 FROM ticket t WHERE t.CinemaID = c.CinemaID)
         OR EXISTS (
           SELECT 1
           FROM rooms r
           JOIN showtimes st ON st.RoomID = r.RoomID
           JOIN booking b ON b.ShowtimeID = st.ShowtimeID
           WHERE r.CinemaID = c.CinemaID
         )
       )
     LIMIT 1`,
    [cinemaId]
  );
  return rows.length > 0;
}

export async function remove(cinemaId) {
  const [result] = await pool.query(
    'DELETE FROM cinemas WHERE CinemaID = ?',
    [cinemaId]
  );
  return result.affectedRows > 0;
}
