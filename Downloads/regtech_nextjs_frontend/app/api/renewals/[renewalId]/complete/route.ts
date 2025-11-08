import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { renewalId: string } }) {
  try {
    const body = await request.json()
    const { certificationNumber, paymentPIN, paymentConfirmation } = body

    const updateData: any = {
      is_completed: true,
      completed_date: new Date().toISOString(),
    }

    let updateSql = "UPDATE tbl_reminders SET is_completed = TRUE, completed_date = CURRENT_TIMESTAMP"
    const params: any[] = []

    // If payment details provided, store them in reminder description
    if (paymentPIN || paymentConfirmation) {
      updateSql += ", reminder_description = CONCAT(reminder_description, ?, ?)"
      params.push(` | PIN: ${paymentPIN}`, ` | PCN: ${paymentConfirmation}`)
    }

    updateSql += " WHERE id = ?"
    params.push(params.renewalId)

    await query(updateSql, params)

    // Log completion in audit trail
    await query(
      `INSERT INTO tbl_audit_log (client_id, user_id, action, entity_type, entity_id, status)
       SELECT ?, ?, ?, ?, ?, ? FROM tbl_reminders WHERE id = ?`,
      ["current-client-id", "current-user-id", "renew", "facility", params.renewalId, "success", params.renewalId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error completing renewal:", error)
    return NextResponse.json({ error: "Failed to complete renewal" }, { status: 500 })
  }
}
