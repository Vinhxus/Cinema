import pool from '../config/db.js';

export async function findByEmail(mail) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE mail = ? LIMIT 1',
    [mail]
  );
  return rows[0] || null;
}

export async function findByPhone(phoneNumber) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE phone_number = ? LIMIT 1',
    [phoneNumber]
  );
  return rows[0] || null;
}

export async function findByIdentifier(identifier) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE mail = ? OR phone_number = ? LIMIT 1',
    [identifier, identifier]
  );
  return rows[0] || null;
}

export async function findById(userId) {
  const [rows] = await pool.query(
    'SELECT UserID, name, phone_number, mail, UserType, cine_points, tier, birthdate, created_at, updated_at FROM users WHERE UserID = ? LIMIT 1',
    [userId]
  );
  return rows[0] || null;
}

export async function createUser({
  name,
  phone_number = null,
  mail,
  hashed_password,
  UserType = 'CUSTOMER',
  birthdate = null,
}) {
  const [result] = await pool.query(
    'INSERT INTO users (name, phone_number, mail, hashed_password, UserType, birthdate) VALUES (?, ?, ?, ?, ?, ?)',
    [name, phone_number, mail, hashed_password, UserType, birthdate]
  );
  return findById(result.insertId);
}

