import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const facilityId = searchParams.get("facilityId")
    const eventType = searchParams.get("eventType")
    const isActive = searchParams.get("isActive") === "true"

    let sql = `
      SELECT r.*, f.facility_name
      FROM tbl_reminders r
      LEFT JOIN tbl_client_facilities f ON r.facility_id = f.id
      WHERE 1=1
    `
    const params: any[] = []

    if (clientId) {
      sql += " AND r.client_id = ?"
      params.push(clientId)
    }

    if (facilityId) {
      sql += " AND r.facility_id = ?"
      params.push(facilityId)
    }

    if (eventType) {
      sql += " AND r.reminder_type = ?"
      params.push(eventType)
    }

    if (isActive) {
      sql += " AND r.is_completed = FALSE"
    }

    sql += " ORDER BY r.due_date ASC"

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Compliance events API error:", error)
    return NextResponse.json({ error: "Failed to fetch compliance events" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, facilityId, submissionId, reminderType, reminderTitle, reminderDescription, dueDate } = body

    const result = await query(
      `INSERT INTO tbl_reminders 
       (client_id, facility_id, submission_id, reminder_type, reminder_title, reminder_description, due_date)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [clientId, facilityId, submissionId, reminderType, reminderTitle, reminderDescription, dueDate],
    )

    return NextResponse.json({ id: (result as any).insertId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating compliance event:", error)
    return NextResponse.json({ error: "Failed to create compliance event" }, { status: 500 })
  }
}
