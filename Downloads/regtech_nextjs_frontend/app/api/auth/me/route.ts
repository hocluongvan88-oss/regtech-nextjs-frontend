import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyToken } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    const decoded = await verifyToken(token)

    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    const users = await query(
      `SELECT u.*, c.organization_name, c.id as client_id
       FROM tbl_users u
       LEFT JOIN tbl_clients c ON u.client_id = c.id
       WHERE u.id = ? AND u.status = 'active'`,
      [decoded.userId],
    )

    if (!Array.isArray(users)) {
      console.error("[v0] Database query returned non-array:", users)
      return NextResponse.json({ error: "Database query failed" }, { status: 500 })
    }

    if (users.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const user = users[0]

    const userRoles = await query(
      `SELECT r.role_name 
       FROM tbl_user_roles ur
       JOIN tbl_roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [user.id],
    )

    const roles = Array.isArray(userRoles) ? userRoles.map((r: any) => r.role_name) : []

    const isSystemAdmin = roles.includes("system_administrator")
    const isServiceManager = roles.includes("service_manager")
    const isTenantAdmin = roles.includes("tenant_administrator")

    const fullName = [user.first_name, user.last_name].filter(Boolean).join(" ") || user.email

    const response = {
      user: {
        id: user.id,
        email: user.email,
        name: fullName,
        clientId: user.client_id,
        organizationName: user.organization_name,
        roles,
        isSystemAdmin,
        isServiceManager,
        isTenantAdmin,
      },
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] GET /api/auth/me - Error:", {
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
    })
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
