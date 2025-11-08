import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const userId = searchParams.get("userId")

    let sql = `
      SELECT 
        r.id,
        r.reminder_type,
        r.reminder_title,
        r.reminder_description,
        r.due_date,
        f.facility_name,
        DATEDIFF(r.due_date, CURDATE()) as days_remaining,
        CASE
          WHEN DATEDIFF(r.due_date, CURDATE()) <= 30 THEN 'critical'
          WHEN DATEDIFF(r.due_date, CURDATE()) <= 60 THEN 'high'
          WHEN DATEDIFF(r.due_date, CURDATE()) <= 90 THEN 'medium'
          ELSE 'low'
        END as priority
      FROM tbl_reminders r
      LEFT JOIN tbl_client_facilities f ON r.facility_id = f.id
      WHERE r.is_completed = FALSE
    `
    const params: any[] = []

    if (clientId) {
      sql += " AND r.client_id = ?"
      params.push(clientId)
    }

    sql += " ORDER BY r.due_date ASC"

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Compliance alerts API error:", error)
    return NextResponse.json({ error: "Failed to fetch alerts" }, { status: 500 })
  }
}
