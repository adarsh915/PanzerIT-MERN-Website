import mysql from 'mysql2/promise'

const globalForDb = global as unknown as {
  pool: mysql.Pool | undefined
}

export const pool =
  globalForDb.pool ??
  mysql.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'panzarit',
    port: process.env.DB_PORT ? parseInt(process.env.DB_PORT, 10) : 3306,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

if (process.env.NODE_ENV !== 'production') globalForDb.pool = pool

export default pool
