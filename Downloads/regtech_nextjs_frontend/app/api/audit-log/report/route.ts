import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = request.headers.get("x-client-id")
    const startDate = searchParams.get("start_date")
    const endDate = searchParams.get("end_date")

    if (!clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!startDate || !endDate) {
      return NextResponse.json({ error: "Start and end dates are required" }, { status: 400 })
    }

    const logs: any = await query(
      `SELECT * FROM tbl_audit_log 
       WHERE client_id = ? 
       AND DATE(timestamp) >= DATE(?)
       AND DATE(timestamp) <= DATE(?)
       ORDER BY timestamp`,
      [clientId, startDate, endDate],
    )

    // Generate summary statistics
    const summary = {
      period: { start: startDate, end: endDate },
      total_records: logs.length,
      by_action: {} as Record<string, number>,
      by_entity: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
      by_user: {} as Record<string, number>,
    }

    for (const log of logs) {
      summary.by_action[log.action] = (summary.by_action[log.action] || 0) + 1
      summary.by_entity[log.entity_type] = (summary.by_entity[log.entity_type] || 0) + 1
      summary.by_status[log.status] = (summary.by_status[log.status] || 0) + 1

      if (log.user_id) {
        summary.by_user[log.user_id] = (summary.by_user[log.user_id] || 0) + 1
      }
    }

    return NextResponse.json({
      summary,
      logs: logs.slice(0, 100),
    })
  } catch (error: any) {
    console.error("[v0] Error generating audit report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
