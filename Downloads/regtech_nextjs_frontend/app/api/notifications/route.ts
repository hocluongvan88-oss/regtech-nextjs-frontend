import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)
    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { user } = authResult

    const notifications = await query(
      `SELECT 
        id,
        reminder_title as title,
        reminder_description as description,
        reminder_type as type,
        created_at,
        is_completed as is_read
      FROM tbl_reminders
      WHERE client_id = ?
      AND is_sent = TRUE
      ORDER BY created_at DESC
      LIMIT 20`,
      [user.client_id],
    )

    const unreadResult = await query(
      `SELECT COUNT(*) as count
      FROM tbl_reminders
      WHERE client_id = ?
      AND is_sent = TRUE
      AND is_completed = FALSE`,
      [user.client_id],
    )

    const unreadCount = unreadResult[0]?.count || 0

    return NextResponse.json({
      notifications,
      unreadCount,
    })
  } catch (error) {
    console.error("Error fetching notifications:", error)
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 })
  }
}
