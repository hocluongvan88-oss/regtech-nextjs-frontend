import mysql from "mysql2/promise"

async function setupDatabase() {
  console.log("Setting up MySQL database...")

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
  })

  try {
    // Create database if not exists
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQL_DATABASE || "fda_registry"}`)
    console.log("Database created or already exists")

    // Switch to the database
    await connection.execute(`USE ${process.env.MYSQL_DATABASE || "fda_registry"}`)

    // Read and execute schema
    const fs = require("fs").promises
    const schema = await fs.readFile("./scripts/01_create_fda_schema_mysql.sql", "utf-8")

    // Split by delimiter and execute
    const statements = schema.split(";").filter((s: string) => s.trim())
    for (const statement of statements) {
      if (statement.trim()) {
        try {
          await connection.execute(statement)
        } catch (error: any) {
          if (!error.message.includes("already exists")) {
            console.error("Error executing statement:", error)
          }
        }
      }
    }

    console.log("Database setup complete!")
  } catch (error) {
    console.error("Database setup failed:", error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

setupDatabase()
