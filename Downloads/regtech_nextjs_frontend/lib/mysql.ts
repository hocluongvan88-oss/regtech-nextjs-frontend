import mysql from "mysql2/promise"

let pool: mysql.Pool | null = null

export async function getPool() {
  if (pool) return pool

  const connectionString = process.env.NEON_DATABASE_URL || process.env.MYSQL_URL

  if (connectionString) {
    const url = new URL(connectionString)

    pool = mysql.createPool({
      host: url.hostname,
      port: Number.parseInt(url.port || "3306"),
      user: url.username,
      password: url.password,
      database: url.pathname.substring(1),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    })
  } else {
    // Individual environment variables (XAMPP-compatible)
    pool = mysql.createPool({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "veximfda",
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      enableKeepAlive: true,
      keepAliveInitialDelayMs: 0,
    })
  }

  return pool
}

export async function getDb() {
  return getPool()
}

export async function query(sql: string, values?: any[]) {
  const pool = await getPool()
  const connection = await pool.getConnection()
  try {
    const [results] = await connection.execute(sql, values || [])
    return results
  } finally {
    connection.release()
  }
}

export async function closePool() {
  if (pool) {
    await pool.end()
    pool = null
  }
}
