
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

export const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'cinema_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
});

export async function testDatabaseConnection(): Promise<void> {
    try {
        const connection = await pool.getConnection();

        const [rows] = await connection.query(
            'SELECT DATABASE() AS databaseName'
        );

        console.log('MySQL connected successfully:', rows);

        connection.release();
    } catch (error) {
        console.error('MySQL connection failed:', error);
        throw error;
    }
}
