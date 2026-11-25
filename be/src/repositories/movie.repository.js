import pool from '../config/db.js';

/** Chỉ 2 trạng thái này được hiển thị trên trang khám phá phim. */
const VISIBLE_STATUSES = ['NOW_SHOWING', 'COMING_SOON'];

/** Người dùng có thể nhập % hoặc _ => escape để LIKE hiểu là ký tự thường. */
function escapeLike(value) {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}

const MOVIE_COLUMNS = [
  'MovieID',
  'Code',
  'Title',
  'Subtitle',
  'Tagline',
  'Description',
  'Genre',
  'Duration',
  "DATE_FORMAT(ReleaseDate, '%Y-%m-%d') AS ReleaseDate",
  'AgeRating',
  'AgeNotice',
  'Language',
  'Formats',
  'ImdbScore',
  'AudienceScore',
  'PosterUrl',
  'BackdropUrl',
  'TrailerUrl',
  'Director',
  'Starring',
  'Status',
].join(', ');

/**
 * Danh sách phim cho trang chủ.
 * - status: 'NOW_SHOWING' | 'COMING_SOON' | null (null => mọi phim chưa kết thúc)
 * - genre: so khớp tương đối trên cột Genre (vd: "Action")
 */
export async function findMovies({ status, genre } = {}) {
  const conditions = [];
  const params = [];

  if (VISIBLE_STATUSES.includes(status)) {
    conditions.push('Status = ?');
    params.push(status);
  } else {
    conditions.push("Status NOT IN ('ENDED', 'DRAFT')");
  }

  if (genre) {
    conditions.push('Genre LIKE ?');
    params.push(`%${escapeLike(genre)}%`);
  }

  const [rows] = await pool.query(
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE ${conditions.join(' AND ')}
     ORDER BY CASE WHEN Status = 'COMING_SOON' THEN 1 ELSE 0 END,
              CASE WHEN Status = 'COMING_SOON' THEN ReleaseDate END ASC,
              MovieID ASC`,
    params
  );

  return rows;
}

/** Đếm số phim theo từng tab (không phụ thuộc bộ lọc thể loại). */
export async function countVisibleMoviesByStatus() {
  const [rows] = await pool.query(
    `SELECT Status, COUNT(*) AS Total
     FROM movies
     WHERE Status IN ('NOW_SHOWING', 'COMING_SOON')
     GROUP BY Status`
  );

  return rows;
}

/** Danh sách thể loại đang có phim hiển thị. */
export async function findVisibleGenres() {
  const [rows] = await pool.query(
    `SELECT DISTINCT Genre
     FROM movies
     WHERE Status IN ('NOW_SHOWING', 'COMING_SOON')
     ORDER BY Genre ASC`
  );

  return rows.map((row) => row.Genre);
}

/** Tìm kiếm nhanh theo tên phim (tối đa 8 kết quả). */
export async function searchMovies(keyword, limit = 8) {
  const contains = `%${escapeLike(keyword)}%`;
  const startsWith = `${escapeLike(keyword)}%`;

  const [rows] = await pool.query(
    `SELECT MovieID, Title, Subtitle, Tagline, Description, Genre, Duration,
            AgeRating, Formats, ImdbScore, PosterUrl, BackdropUrl, TrailerUrl, Status
     FROM movies
     WHERE Status NOT IN ('ENDED', 'DRAFT')
       AND (Title LIKE ? OR Subtitle LIKE ?)
     ORDER BY CASE WHEN Title LIKE ? THEN 0 ELSE 1 END, MovieID ASC
     LIMIT ?`,
    [contains, contains, startsWith, limit]
  );

  return rows;
}

/** Chi tiết 1 phim theo MovieID (trả null nếu không tồn tại). */
export async function findMovieById(movieId) {
  const [rows] = await pool.query(
    `SELECT ${MOVIE_COLUMNS}
     FROM movies
     WHERE MovieID = ?
     LIMIT 1`,
    [movieId]
  );

  return rows[0] ?? null;
}