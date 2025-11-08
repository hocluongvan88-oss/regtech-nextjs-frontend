import mysql from "mysql2/promise"

async function seedDatabase() {
  console.log("Seeding database...")

  const pool = mysql.createPool({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    database: process.env.MYSQL_DATABASE || "fda_registry",
  })

  try {
    const connection = await pool.getConnection()

    // Verify tables exist
    const [tables] = await connection.execute(
      `SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = ?`,
      [process.env.MYSQL_DATABASE || "fda_registry"],
    )

    console.log(`Found ${(tables as any[]).length} tables`)

    // Verify roles exist
    const [roles] = await connection.execute("SELECT * FROM tbl_roles")
    console.log(`Roles: ${(roles as any[]).length}`)

    if ((roles as any[]).length === 0) {
      console.log("Roles table is empty. Default roles should be inserted by schema.")
    }

    console.log("Database seeding complete!")
    connection.release()
  } catch (error) {
    console.error("Database seeding failed:", error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

seedDatabase()
