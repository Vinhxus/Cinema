import pool from '../config/db.js';

export async function findAll({ search, status, genre } = {}) {
  const conditions = [];
  const params = [];

  if (search) {
    conditions.push('(Title LIKE ? OR Code LIKE ?)');
    const pattern = `%${search}%`;
    params.push(pattern, pattern);
  }

  if (status) {
    conditions.push('Status = ?');
    params.push(status);
  }

  if (genre) {
    conditions.push('Genre LIKE ?');
    params.push(`%${genre}%`);
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

  const [rows] = await pool.query(
    `SELECT * FROM movies ${whereClause} ORDER BY MovieID DESC`,
    params
  );
  return rows;
}

export async function findById(movieId, conn = pool) {
  const [rows] = await conn.query(
    'SELECT * FROM movies WHERE MovieID = ? LIMIT 1',
    [movieId]
  );
  return rows[0] || null;
}

export async function create(data) {
  const [result] = await pool.query(
    `INSERT INTO movies (
      Code, Title, Subtitle, Tagline, Description, Genre, Duration, ReleaseDate,
      AgeRating, AgeNotice, Language, Formats, ImdbScore, AudienceScore,
      PosterUrl, BackdropUrl, TrailerUrl, Director, Starring, Status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.Code,
      data.Title,
      data.Subtitle ?? null,
      data.Tagline ?? null,
      data.Description ?? null,
      data.Genre,
      data.Duration,
      data.ReleaseDate ?? null,
      data.AgeRating ?? 'P',
      data.AgeNotice ?? null,
      data.Language ?? 'English with Vietnamese Subtitles',
      data.Formats ?? '2D',
      data.ImdbScore ?? 0.0,
      data.AudienceScore ?? 0.0,
      data.PosterUrl ?? null,
      data.BackdropUrl ?? null,
      data.TrailerUrl ?? null,
      data.Director ?? null,
      data.Starring ?? null,
      data.Status ?? 'NOW_SHOWING',
    ]
  );
  return findById(result.insertId);
}

export async function update(movieId, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) {
    return findById(movieId);
  }

  const setClause = keys.map((key) => `${key} = ?`).join(', ');
  const values = [...keys.map((key) => fields[key]), movieId];

  await pool.query(
    `UPDATE movies SET ${setClause} WHERE MovieID = ?`,
    values
  );
  return findById(movieId);
}

export async function hasSoldTickets(movieId) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM showtimes st
     WHERE st.MovieID = ?
       AND (
         EXISTS (SELECT 1 FROM booking b WHERE b.ShowtimeID = st.ShowtimeID AND b.status = 'PAID')
         OR EXISTS (SELECT 1 FROM ticket t WHERE t.ShowtimeID = st.ShowtimeID AND t.status IN ('VALID', 'USED'))
         OR EXISTS (SELECT 1 FROM order_seats os WHERE os.ShowtimeID = st.ShowtimeID AND os.SeatStatus = 'BOOKED')
       )
     LIMIT 1`,
    [movieId]
  );
  return rows.length > 0;
}

export async function hasAnyBookingsOrTickets(movieId) {
  const [rows] = await pool.query(
    `SELECT 1
     FROM showtimes st
     WHERE st.MovieID = ?
       AND (
         EXISTS (SELECT 1 FROM booking b WHERE b.ShowtimeID = st.ShowtimeID)
         OR EXISTS (SELECT 1 FROM ticket t WHERE t.ShowtimeID = st.ShowtimeID)
       )
     LIMIT 1`,
    [movieId]
  );
  return rows.length > 0;
}

export async function remove(movieId) {
  const [result] = await pool.query(
    'DELETE FROM movies WHERE MovieID = ?',
    [movieId]
  );
  return result.affectedRows > 0;
}
