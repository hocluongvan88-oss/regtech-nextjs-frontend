import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { coeId: string } }) {
  try {
    const body = await request.json()
    const { exportingCountry, recipientCountry, certificationDate, submittedBy } = body

    const coeSubmission = await query(
      `SELECT s.*, f.facility_name, f.fei_number, f.duns_number
       FROM tbl_submissions s
       JOIN tbl_client_facilities f ON s.facility_id = f.id
       WHERE s.id = ? AND s.submission_type = 'coe'`,
      [params.coeId],
    )

    if (!coeSubmission || (Array.isArray(coeSubmission) && coeSubmission.length === 0)) {
      return NextResponse.json({ error: "COE not found" }, { status: 404 })
    }

    const coe = Array.isArray(coeSubmission) ? coeSubmission[0] : coeSubmission

    // Get linked products
    const products: any = await query(
      `SELECT p.product_name, p.product_code FROM tbl_submission_products sp
       JOIN tbl_products p ON sp.product_id = p.id
       WHERE sp.submission_id = ?`,
      [params.coeId],
    )

    // Format COE submission
    const coeData = {
      submission_id: params.coeId,
      fei_number: coe.fei_number,
      facility_name: coe.facility_name,
      products: Array.isArray(products) ? products : [products],
      exporting_country: exportingCountry,
      recipient_country: recipientCountry,
      certification_date: certificationDate,
      statement: coe.comments,
    }

    // Update submission status
    await query(
      `UPDATE tbl_submissions 
       SET submission_status = ?, submitted_date = CURRENT_TIMESTAMP, submitted_by = ?
       WHERE id = ?`,
      ["submitted", submittedBy, params.coeId],
    )

    // Log COE submission
    await query(
      `INSERT INTO tbl_audit_log 
       (client_id, user_id, action, entity_type, entity_id, status, new_values)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [coe.client_id, submittedBy, "submit", "coe", params.coeId, "success", JSON.stringify(coeData)],
    )

    return NextResponse.json({
      success: true,
      submissionId: params.coeId,
      coeData,
      message: "COE submitted successfully. Please verify with FDA portal.",
    })
  } catch (error) {
    console.error("[v0] Error submitting COE:", error)
    return NextResponse.json({ error: "Failed to submit COE" }, { status: 500 })
  }
}
