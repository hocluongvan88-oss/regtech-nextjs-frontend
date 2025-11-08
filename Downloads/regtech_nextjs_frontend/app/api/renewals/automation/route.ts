import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, facilityId, facilityType } = body

    // Get facility details
    const facilityResult: any = await query("SELECT * FROM tbl_client_facilities WHERE id = ? AND client_id = ?", [
      facilityId,
      clientId,
    ])

    const facility = Array.isArray(facilityResult) ? facilityResult[0] : facilityResult

    if (!facility) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 })
    }

    // Calculate next renewal date (365 days from now)
    const renewalDate = new Date()
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)

    // Create reminder at 90 days before
    const alertDate90 = new Date(renewalDate)
    alertDate90.setDate(alertDate90.getDate() - 90)

    // Check if reminder already exists
    const existingReminder: any = await query(
      `SELECT id FROM tbl_reminders 
       WHERE client_id = ? AND facility_id = ? AND reminder_type = 'renewal' 
       AND YEAR(due_date) = ?`,
      [clientId, facilityId, renewalDate.getFullYear()],
    )

    if (!existingReminder || (Array.isArray(existingReminder) && existingReminder.length === 0)) {
      // Create renewal reminder at 90 days
      await query(
        `INSERT INTO tbl_reminders 
         (client_id, facility_id, reminder_type, reminder_title, reminder_description, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          facilityId,
          "renewal",
          `${facility.facility_type} Facility Annual Renewal - 90 Days`,
          `90-day reminder for annual renewal of ${facility.facility_name}`,
          alertDate90.toISOString().split("T")[0],
        ],
      )

      // Create 60-day reminder
      const alertDate60 = new Date(renewalDate)
      alertDate60.setDate(alertDate60.getDate() - 60)
      await query(
        `INSERT INTO tbl_reminders 
         (client_id, facility_id, reminder_type, reminder_title, reminder_description, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          facilityId,
          "renewal",
          `${facility.facility_type} Facility Annual Renewal - 60 Days`,
          `60-day reminder for annual renewal of ${facility.facility_name}`,
          alertDate60.toISOString().split("T")[0],
        ],
      )

      // Create 30-day reminder
      const alertDate30 = new Date(renewalDate)
      alertDate30.setDate(alertDate30.getDate() - 30)
      await query(
        `INSERT INTO tbl_reminders 
         (client_id, facility_id, reminder_type, reminder_title, reminder_description, due_date)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [
          clientId,
          facilityId,
          "renewal",
          `${facility.facility_type} Facility Annual Renewal - CRITICAL`,
          `30-day critical reminder for annual renewal of ${facility.facility_name}`,
          alertDate30.toISOString().split("T")[0],
        ],
      )
    }

    // Handle MDUFA fees for medical devices
    if (facility.facility_type === "device") {
      const mdfuaResult: any = await query(
        `SELECT id FROM tbl_reminders 
         WHERE client_id = ? AND facility_id = ? AND reminder_type = 'annual_fee'`,
        [clientId, facilityId],
      )

      if (!mdfuaResult || (Array.isArray(mdfuaResult) && mdfuaResult.length === 0)) {
        await query(
          `INSERT INTO tbl_reminders 
           (client_id, facility_id, reminder_type, reminder_title, reminder_description, due_date, is_required)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
          [
            clientId,
            facilityId,
            "annual_fee",
            "MDUFA Annual Fee Due",
            "Medical Device User Fee (MDUFA) annual payment required. Include PIN and PCN.",
            renewalDate.toISOString().split("T")[0],
            true,
          ],
        )
      }
    }

    return NextResponse.json({
      success: true,
      message: "Renewal reminders created automatically",
      renewalDate: renewalDate.toISOString().split("T")[0],
    })
  } catch (error) {
    console.error("[v0] Error in renewal automation:", error)
    return NextResponse.json({ error: "Failed to automate renewal" }, { status: 500 })
  }
}
