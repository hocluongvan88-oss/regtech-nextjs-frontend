import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] GET /api/users - Starting")

    // Get token from cookie
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Verify token
    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    // Get client_id from query params
    const clientId = request.nextUrl.searchParams.get("client_id")
    console.log("[v0] Fetching users for client_id:", clientId)

    if (!clientId) {
      return NextResponse.json({ error: "client_id query parameter required" }, { status: 400 })
    }

    const users = await query(
      `SELECT 
        u.id,
        u.email,
        u.first_name,
        u.last_name,
        u.status,
        u.created_at,
        GROUP_CONCAT(r.role_name) as roles
       FROM tbl_users u
       LEFT JOIN tbl_user_roles ur ON u.id = ur.user_id
       LEFT JOIN tbl_roles r ON ur.role_id = r.id
       WHERE u.client_id = ? AND u.status = 'active'
       GROUP BY u.id
       ORDER BY u.created_at DESC`,
      [clientId],
    )

    console.log("[v0] Users query result:", {
      isArray: Array.isArray(users),
      count: Array.isArray(users) ? users.length : 0,
    })

    if (!Array.isArray(users)) {
      console.error("[v0] Database query returned non-array:", users)
      return NextResponse.json({ error: "Database error" }, { status: 500 })
    }

    const formattedUsers = users.map((user: any) => ({
      id: user.id,
      email: user.email,
      full_name: `${user.first_name || ""} ${user.last_name || ""}`.trim(),
      first_name: user.first_name,
      last_name: user.last_name,
      status: user.status,
      roles: user.roles ? user.roles.split(",") : [],
      created_at: user.created_at,
    }))

    console.log("[v0] GET /api/users - Success:", formattedUsers.length, "users found")
    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("[v0] GET /api/users - Error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("[v0] POST /api/users - Starting")

    // Verify authentication
    const token = request.cookies.get("auth-token")?.value
    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = await verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const body = await request.json()
    const { email, first_name, last_name, client_id, role_ids } = body

    if (!email || !client_id) {
      return NextResponse.json({ error: "email and client_id are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO tbl_users (email, first_name, last_name, client_id, status, created_at)
       VALUES (?, ?, ?, ?, 'active', NOW())`,
      [email, first_name || "", last_name || "", client_id],
    )

    if (!result || !result.insertId) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 })
    }

    const userId = result.insertId

    // Assign roles if provided
    if (role_ids && Array.isArray(role_ids)) {
      for (const roleId of role_ids) {
        await query(`INSERT INTO tbl_user_roles (user_id, role_id) VALUES (?, ?)`, [userId, roleId])
      }
    }

    console.log("[v0] POST /api/users - User created:", userId)
    return NextResponse.json(
      {
        id: userId,
        email,
        full_name: `${first_name || ""} ${last_name || ""}`.trim(),
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("[v0] POST /api/users - Error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
