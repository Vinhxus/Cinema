import 'dotenv/config';
import mysql from 'mysql2/promise';

const DB_TIMEZONE = '+07:00';

export const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: Number(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD ?? '',
  database: process.env.DB_NAME || 'cinema_db',
  // mysql2 đọc/ghi DATETIME theo múi giờ này...
  timezone: DB_TIMEZONE,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ...nên NOW() của MySQL cũng phải cùng múi giờ, nếu không hold_expires_at sẽ lệch 7 tiếng.
// Mỗi khi pool mở một kết nối mới -> set time_zone cho kết nối đó.
pool.pool.on('connection', (conn) => {
  conn.query(`SET time_zone = '${DB_TIMEZONE}'`);
});

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    return true;
  } finally {
    conn.release();
  }
}

/**
 * Chạy `work(conn)` trong 1 transaction.
 * - work chạy xong không lỗi -> COMMIT
 * - work ném lỗi -> ROLLBACK rồi ném tiếp lỗi ra ngoài
 * Luôn trả connection về pool (finally), kể cả khi lỗi.
 */
export async function withTransaction(work) {
  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const result = await work(conn);
    await conn.commit();
    return result;
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default pool;
