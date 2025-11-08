import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: { complianceId: string } }) {
  try {
    const result = await query("SELECT * FROM tbl_compliance_status WHERE id = ?", [params.complianceId])

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Compliance record not found" }, { status: 404 })
    }

    return NextResponse.json(Array.isArray(result) ? result[0] : result)
  } catch (error) {
    console.error("[v0] Error fetching compliance:", error)
    return NextResponse.json({ error: "Failed to fetch compliance record" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { complianceId: string } }) {
  try {
    const body = await request.json()
    const { complianceStatus, warningMessage, actionRequired, lastInspectionDate } = body

    await query(
      `UPDATE tbl_compliance_status 
       SET compliance_status = ?, warning_message = ?, action_required = ?, last_inspection_date = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [complianceStatus, warningMessage, actionRequired || false, lastInspectionDate, params.complianceId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating compliance:", error)
    return NextResponse.json({ error: "Failed to update compliance record" }, { status: 500 })
  }
}
