import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-client-id")
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"
    const isServiceManager = request.headers.get("x-is-service-manager") === "true"

    if (!clientId && !isSystemAdmin && !isServiceManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let q = `SELECT id, organization_name, organization_type, fei_number, status, created_at 
             FROM tbl_clients WHERE deleted_at IS NULL`
    const params: any[] = []

    if (!isSystemAdmin && !isServiceManager) {
      q += ` AND id = ?`
      params.push(clientId)
    }

    q += ` ORDER BY created_at DESC`

    const clients = await query(q, params)
    return NextResponse.json(clients)
  } catch (error) {
    console.error("[v0] Error fetching clients:", error)
    return NextResponse.json({ error: "Failed to fetch clients" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { organization_name, organization_type, duns_number, fei_number } = body

    if (!organization_name) {
      return NextResponse.json({ error: "Organization name is required" }, { status: 400 })
    }

    const existing = await query(
      `SELECT id, organization_name FROM tbl_clients WHERE organization_name = ? AND deleted_at IS NULL LIMIT 1`,
      [organization_name],
    )

    if (Array.isArray(existing) && existing.length > 0) {
      return NextResponse.json(
        {
          error: "Organization name already exists",
          code: "DUPLICATE_ENTRY",
          details: `Organization "${organization_name}" is already registered in the system`,
          existingId: existing[0].id,
        },
        { status: 409 },
      )
    }

    const result = await query(
      `INSERT INTO tbl_clients (organization_name, organization_type, duns_number, fei_number)
       VALUES (?, ?, ?, ?)`,
      [organization_name, organization_type, duns_number, fei_number],
    )

    return NextResponse.json(result, { status: 201 })
  } catch (error: any) {
    console.error("[v0] Error creating client:", error)

    if (
      error.code === "ER_DUP_ENTRY" ||
      error.errno === 1062 ||
      error.message?.includes("Duplicate entry") ||
      error.message?.includes("duplicate key")
    ) {
      return NextResponse.json(
        {
          error: "Organization name already exists",
          code: "DUPLICATE_ENTRY",
          details: "This organization name is already registered in the system. Please use a different name.",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        error: "Failed to create client",
        details: process.env.NODE_ENV === "development" ? error.message : undefined,
      },
      { status: 500 },
    )
  }
}
