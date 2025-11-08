import mysql from "mysql2/promise"
import * as bcrypt from "bcryptjs"
import { v4 as uuidv4 } from 'uuid' // Thêm: Import thư viện UUID để tạo ID hợp lệ

// Thông tin Admin mặc định
const ADMIN_EMAIL = "admin@veximglobal.com"
const ADMIN_PASSWORD = "Vexim@Global2024!"
const CLIENT_ORG_NAME = "VEXIM GLOBAL"
const SYS_ROLE_NAME = "system_administrator"

async function setupVeximGlobalAdmin() {
  console.log("[v0] Setting up VEXIM GLOBAL system admin...")

  let connection: any = null
  try {
    // 1. KẾT NỐI DATABASE (Sử dụng tên database VEXIMFDA)
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST || "localhost",
      port: Number.parseInt(process.env.MYSQL_PORT || "3306"),
      user: process.env.MYSQL_USER || "root",
      password: process.env.MYSQL_PASSWORD || "",
      database: process.env.MYSQL_DATABASE || "veximfda", // <-- ĐÃ SỬA: Thay fda_registry thành veximfda
    })

    // 2. KIỂM TRA ADMIN ĐÃ TỒN TẠI CHƯA
    const [existingAdmin]: any = await connection.execute(`SELECT id FROM tbl_users WHERE email = ? LIMIT 1`, [
      ADMIN_EMAIL,
    ])

    if (existingAdmin && existingAdmin.length > 0) {
      console.log(`[v0] ${CLIENT_ORG_NAME} admin already exists`)
      return
    }

    // --- 3. TÌM CLIENT (TỔ CHỨC) ---
    const [[veximClient]]: any = await connection.execute(
      `SELECT id FROM tbl_clients WHERE organization_name = ? LIMIT 1`,
      [CLIENT_ORG_NAME],
    )

    let veximClientId = veximClient?.id

    if (!veximClientId) {
      console.error(`[v0] Error: Client '${CLIENT_ORG_NAME}' not found. Please run setup_data.sql first.`)
      throw new Error(`Client ${CLIENT_ORG_NAME} not initialized.`)
    }
    // ----------------------------------------------

    // --- 4. TÌM ROLE (VAI TRÒ) ---
    const [[sysAdminRole]]: any = await connection.execute(
      `SELECT id FROM tbl_roles WHERE role_name = ? AND is_system_role = TRUE LIMIT 1`,
      [SYS_ROLE_NAME],
    )

    let sysAdminRoleId = sysAdminRole?.id

    if (!sysAdminRoleId) {
      console.error(`[v0] Error: System Role '${SYS_ROLE_NAME}' not found. Please run setup_data.sql first.`)
      throw new Error(`System Role ${SYS_ROLE_NAME} not initialized.`)
    }
    // ----------------------------------------------

    // --- 5. TẠO USER (ADMIN) ---
    const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10)
    const adminId = uuidv4() // Tạo UUID hợp lệ cho người dùng

    await connection.execute(
      `INSERT INTO tbl_users (id, client_id, email, first_name, last_name, password_hash, status, email_verified)
        VALUES (?, ?, ?, ?, ?, ?, ?, TRUE)`,
      [adminId, veximClientId, ADMIN_EMAIL, "System", "Administrator", passwordHash, "active"],
    )

    // --- 6. GÁN ROLE CHO USER ---
    await connection.execute(
      `INSERT INTO tbl_user_roles (user_id, role_id, assigned_by)
        VALUES (?, ?, ?)`,
      [adminId, sysAdminRoleId, adminId],
    )

    console.log(`[v0] ${CLIENT_ORG_NAME} system admin created successfully`)
    console.log(`[v0] Admin email: ${ADMIN_EMAIL}`)
    console.log(`[v0] Password: ${ADMIN_PASSWORD} (Please change on first login)`)

    await connection.end()
  } catch (error) {
    console.error("[v0] Setup failed:", error)
    // Thêm kiểm tra lỗi để nhắc nhở người dùng chạy script SQL
    if (error && (error as any).code === 'ER_NO_SUCH_TABLE') {
        console.error("\n*** LỖI QUAN TRỌNG: Database Schema chưa được tạo! ***");
        console.error("Vui lòng chạy file SQL (01_create_fda_schema_mysql.sql) để tạo các bảng trước.");
    }
    throw error
  }
}

setupVeximGlobalAdmin()
