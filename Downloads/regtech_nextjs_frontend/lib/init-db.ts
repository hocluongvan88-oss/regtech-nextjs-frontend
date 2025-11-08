import mysql from "mysql2/promise"
import * as fs from "fs/promises"
import * as path from "path"

async function initDatabase() {
  console.log("🚀 Initializing FDA Registry Database...")

  const connection = await mysql.createConnection({
    host: process.env.MYSQL_HOST || "localhost",
    port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
    user: process.env.MYSQL_USER || "root",
    password: process.env.MYSQL_PASSWORD || "",
    multipleStatements: true,
  })

  try {
    // Create database
    const dbName = process.env.MYSQL_DATABASE || "fda_registry"
    console.log(`📦 Creating database: ${dbName}`)
    await connection.execute(`CREATE DATABASE IF NOT EXISTS ${dbName}`)
    await connection.execute(`USE ${dbName}`)
    console.log("✅ Database ready")

    // Read SQL schema file
    const schemaPath = path.join(process.cwd(), "scripts", "01_create_fda_schema_mysql.sql")
    console.log(`📄 Reading schema from: ${schemaPath}`)
    const schema = await fs.readFile(schemaPath, "utf-8")

    // Split by semicolon and execute each statement
    const statements = schema
      .split(";")
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith("--"))

    console.log(`📝 Executing ${statements.length} SQL statements...`)

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      if (statement) {
        try {
          await connection.execute(statement)
          if ((i + 1) % 5 === 0) {
            console.log(`   ✓ Executed ${i + 1}/${statements.length} statements`)
          }
        } catch (error: any) {
          // Ignore "already exists" errors
          if (!error.message.includes("already exists") && !error.message.includes("Duplicate")) {
            console.error(`❌ Error executing statement ${i + 1}:`, error.message)
            console.error("Statement:", statement.substring(0, 100))
          }
        }
      }
    }

    console.log("✅ All tables created successfully!")

    // Verify tables
    const [tables] = await connection.execute("SHOW TABLES")
    console.log(`\n📊 Database contains ${(tables as any[]).length} tables:`)
    ;(tables as any[]).forEach((table: any) => {
      console.log(`   - ${Object.values(table)[0]}`)
    })

    console.log("\n🎉 Database initialization complete!")
  } catch (error) {
    console.error("❌ Database initialization failed:", error)
    process.exit(1)
  } finally {
    await connection.end()
  }
}

initDatabase()
