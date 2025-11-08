import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const facilityId = searchParams.get("facilityId")
    const complianceStatus = searchParams.get("status")

    let sql = "SELECT * FROM tbl_compliance_status WHERE 1=1"
    const params: any[] = []

    if (clientId) {
      sql += " AND client_id = ?"
      params.push(clientId)
    }

    if (facilityId) {
      sql += " AND facility_id = ?"
      params.push(facilityId)
    }

    if (complianceStatus) {
      sql += " AND compliance_status = ?"
      params.push(complianceStatus)
    }

    sql += " ORDER BY updated_at DESC"

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Compliance API error:", error)
    return NextResponse.json({ error: "Failed to fetch compliance data" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, facilityId, complianceType, complianceStatus } = body

    const result = await query(
      `INSERT INTO tbl_compliance_status (client_id, facility_id, compliance_type, compliance_status)
       VALUES (?, ?, ?, ?)`,
      [clientId, facilityId, complianceType, complianceStatus || "pending"],
    )

    return NextResponse.json({ id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Compliance creation error:", error)
    return NextResponse.json({ error: "Failed to create compliance record" }, { status: 500 })
  }
}
