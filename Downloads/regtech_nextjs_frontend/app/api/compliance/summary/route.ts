import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "clientId is required" }, { status: 400 })
    }

    const summaryQuery = `
      SELECT
        COUNT(DISTINCT CASE WHEN cs.compliance_status = 'compliant' THEN cs.id END) as compliant_count,
        COUNT(DISTINCT CASE WHEN cs.compliance_status = 'non_compliant' THEN cs.id END) as non_compliant_count,
        COUNT(DISTINCT CASE WHEN cs.compliance_status = 'action_required' THEN cs.id END) as action_required_count,
        COUNT(DISTINCT CASE WHEN r.is_completed = FALSE AND DATEDIFF(r.due_date, CURDATE()) <= 30 THEN r.id END) as critical_deadlines,
        COUNT(DISTINCT CASE WHEN r.is_completed = FALSE AND DATEDIFF(r.due_date, CURDATE()) <= 90 THEN r.id END) as upcoming_deadlines
      FROM tbl_compliance_status cs
      LEFT JOIN tbl_reminders r ON cs.facility_id = r.facility_id
      WHERE cs.client_id = ?
    `

    const result = await query(summaryQuery, [clientId])
    return NextResponse.json(Array.isArray(result) ? result[0] : result)
  } catch (error) {
    console.error("[v0] Compliance summary error:", error)
    return NextResponse.json({ error: "Failed to fetch compliance summary" }, { status: 500 })
  }
}
