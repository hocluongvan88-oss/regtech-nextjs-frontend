import { query } from "@/lib/db"
import { createUser, createJWT } from "@/lib/auth"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organization_name, email, first_name, last_name, password, password_confirm } = body

    // Validate input
    if (!organization_name || !email || !first_name || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (password !== password_confirm) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existingClient: any = await query(`SELECT id FROM tbl_clients WHERE organization_name = ? LIMIT 1`, [
      organization_name,
    ])

    let clientId: string

    if (Array.isArray(existingClient) && existingClient.length > 0) {
      // Organization already exists, use existing client
      clientId = existingClient[0].id
    } else {
      // Create new client
      const clientResult: any = await query(
        `INSERT INTO tbl_clients (organization_name, status)
         VALUES (?, 'active')`,
        [organization_name],
      )
      clientId = clientResult.insertId
    }

    // Get admin role ID
    const roleResult: any = await query(`SELECT id FROM tbl_roles WHERE role_name = 'admin' LIMIT 1`)

    if (!Array.isArray(roleResult) || roleResult.length === 0) {
      throw new Error("Admin role not found")
    }

    const adminRoleId = roleResult[0].id

    // Create user
    const user = await createUser(clientId, email, first_name, last_name, password, [adminRoleId])

    // Create JWT token
    const token = await createJWT({
      userId: user.id,
      clientId,
      email: user.email,
      roles: ["admin"],
    })

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: user.id,
          email: user.email,
          first_name: user.first_name,
          last_name: user.last_name,
        },
      },
      { status: 201 },
    )

    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400,
    })

    return response
  } catch (error: any) {
    console.error("[v0] Registration error:", error)

    if (error.message?.includes("duplicate key") || error.message?.includes("Duplicate entry")) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 })
    }

    if (error.message?.includes("Foreign key") || error.message?.includes("FOREIGN KEY")) {
      return NextResponse.json({ error: "Invalid organization or role data" }, { status: 400 })
    }

    return NextResponse.json({ error: "Registration failed" }, { status: 500 })
  }
}
