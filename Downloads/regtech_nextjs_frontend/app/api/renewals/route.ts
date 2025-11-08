import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")

    let sql = `
      SELECT 
        r.id,
        r.reminder_type,
        r.reminder_title,
        r.due_date,
        r.is_completed,
        f.facility_name,
        f.facility_type,
        DATEDIFF(r.due_date, CURDATE()) as days_remaining,
        CASE
          WHEN r.is_completed THEN 'completed'
          WHEN DATEDIFF(r.due_date, CURDATE()) <= 30 THEN 'critical'
          WHEN DATEDIFF(r.due_date, CURDATE()) <= 60 THEN 'high'
          WHEN DATEDIFF(r.due_date, CURDATE()) <= 90 THEN 'medium'
          ELSE 'low'
        END as urgency
      FROM tbl_reminders r
      LEFT JOIN tbl_client_facilities f ON r.facility_id = f.id
      WHERE r.reminder_type IN ('renewal', 'annual_fee', 'inspection')
    `
    const params: any[] = []

    if (clientId) {
      sql += " AND r.client_id = ?"
      params.push(clientId)
    }

    if (status === "pending") {
      sql += " AND r.is_completed = FALSE"
    } else if (status === "completed") {
      sql += " AND r.is_completed = TRUE"
    }

    sql += " ORDER BY r.due_date ASC"

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Renewals API error:", error)
    return NextResponse.json({ error: "Failed to fetch renewals" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, facilityId, renewalType, dueDate, reminderTitle } = body

    const result = await query(
      `INSERT INTO tbl_reminders 
       (client_id, facility_id, reminder_type, reminder_title, due_date, reminder_description)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [clientId, facilityId, renewalType, reminderTitle, dueDate, `Auto-generated renewal task for ${renewalType}`],
    )

    return NextResponse.json({ id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating renewal:", error)
    return NextResponse.json({ error: "Failed to create renewal" }, { status: 500 })
  }
}
