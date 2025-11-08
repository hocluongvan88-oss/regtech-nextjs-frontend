import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const userId = searchParams.get("user_id")
    const action = searchParams.get("action")
    const limit = Number.parseInt(searchParams.get("limit") || "50")
    const offset = Number.parseInt(searchParams.get("offset") || "0")

    let q = `SELECT * FROM tbl_audit_log WHERE 1=1`
    const params: any[] = []

    if (clientId) {
      q += ` AND client_id = ?`
      params.push(clientId)
    }

    if (userId) {
      q += ` AND user_id = ?`
      params.push(userId)
    }

    if (action) {
      q += ` AND action = ?`
      params.push(action)
    }

    q += ` ORDER BY timestamp DESC LIMIT ? OFFSET ?`
    params.push(limit, offset)

    const logs = await query(q, params)

    return NextResponse.json(logs)
  } catch (error) {
    console.error("[v0] Error fetching audit logs:", error)
    return NextResponse.json({ error: "Failed to fetch audit logs" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      user_id,
      action,
      entity_type,
      entity_id,
      old_values,
      new_values,
      ip_address,
      user_agent,
      status = "success",
      error_message,
    } = body

    const result = await query(
      `INSERT INTO tbl_audit_log 
       (client_id, user_id, action, entity_type, entity_id, old_values, new_values, 
        ip_address, user_agent, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id,
        user_id,
        action,
        entity_type,
        entity_id,
        JSON.stringify(old_values),
        JSON.stringify(new_values),
        ip_address,
        user_agent,
        status,
        error_message,
      ],
    )

    const inserted: any = await query(`SELECT * FROM tbl_audit_log WHERE id = LAST_INSERT_ID()`)
    return NextResponse.json(inserted[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating audit log:", error)
    return NextResponse.json({ error: "Failed to create audit log" }, { status: 500 })
  }
}
