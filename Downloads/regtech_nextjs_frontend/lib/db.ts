"use server"

let mysql: any = null
let pool: any = null

async function getMysql() {
  if (!mysql) {
    const mysqlModule = await import("mysql2/promise")
    mysql = mysqlModule.default
  }
  return mysql
}

async function getPool() {
  if (pool) return pool

  const mysqlModule = await getMysql()

  pool = mysqlModule.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "fda_registry",
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
  })

  return pool
}

export async function query(sql: string, values?: any[]): Promise<any> {
  const connectionPool = await getPool()
  const connection = await connectionPool.getConnection()
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
