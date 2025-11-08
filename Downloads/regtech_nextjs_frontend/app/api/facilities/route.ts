import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userClientId = request.headers.get("x-client-id")
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"
    const isServiceManager = request.headers.get("x-is-service-manager") === "true"

    if (!userClientId && !isSystemAdmin && !isServiceManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")

    let q = `SELECT * FROM tbl_client_facilities WHERE deleted_at IS NULL`
    const params: any[] = []

    // Enforce tenant isolation - users can only see facilities from their own organization
    if (!isSystemAdmin && !isServiceManager) {
      q += ` AND client_id = ?`
      params.push(userClientId)
    } else if (clientId) {
      // System admins can filter by specific client_id
      q += ` AND client_id = ?`
      params.push(clientId)
    }

    q += ` ORDER BY created_at DESC`
    const facilities = await query(q, params)

    return NextResponse.json(facilities)
  } catch (error) {
    console.error("[v0] Error fetching facilities:", error)
    return NextResponse.json({ error: "Failed to fetch facilities" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      facility_name,
      facility_type,
      street_address,
      city,
      state_province,
      postal_code,
      country,
      fei_number,
      primary_contact_name,
      primary_contact_email,
    } = body

    if (!client_id || !facility_name) {
      return NextResponse.json({ error: "Client ID and facility name are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO tbl_client_facilities 
       (client_id, facility_name, facility_type, street_address, city, state_province, 
        postal_code, country, fei_number, primary_contact_name, primary_contact_email)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id,
        facility_name,
        facility_type,
        street_address,
        city,
        state_province,
        postal_code,
        country,
        fei_number,
        primary_contact_name,
        primary_contact_email,
      ],
    )

    const inserted: any = await query(`SELECT * FROM tbl_client_facilities WHERE id = LAST_INSERT_ID()`)
    return NextResponse.json(inserted[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating facility:", error)
    return NextResponse.json({ error: "Failed to create facility" }, { status: 500 })
  }
}
