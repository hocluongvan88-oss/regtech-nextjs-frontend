import { submitToFDAESG } from "@/lib/fda-api"
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { submissionId, clientId } = await request.json()

    if (!submissionId || !clientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const submissions: any = await query(
      `SELECT s.*, f.*, p.fei_number, c.organization_name
       FROM tbl_submissions s
       JOIN tbl_client_facilities f ON s.facility_id = f.id
       JOIN tbl_clients c ON s.client_id = c.id
       WHERE s.id = ?`,
      [submissionId],
    )

    if (!Array.isArray(submissions) || submissions.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    const submission = submissions[0]

    // Fetch associated products
    const products: any = await query(
      `SELECT p.* FROM tbl_products p
       JOIN tbl_submission_products sp ON p.id = sp.product_id
       WHERE sp.submission_id = ?`,
      [submissionId],
    )

    // Build FDA submission payload
    const fdaPayload = {
      submissionType: submission.submission_type,
      facilityInfo: {
        feiNumber: submission.fei_number,
        facilityName: submission.facility_name,
        address: submission.street_address,
        city: submission.city,
        state: submission.state_province,
        zip: submission.postal_code,
        country: submission.country,
      },
      products: products.map((p: any) => ({
        productName: p.product_name,
        productCode: p.product_code,
        classification: p.product_classification,
        intendedUse: p.intended_use,
      })),
      documents: [],
    }

    // Submit to FDA
    const result = await submitToFDAESG(clientId, submissionId, fdaPayload)

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({
      message: "Submission sent to FDA",
      fdaSubmissionId: result.fdaSubmissionId,
    })
  } catch (error: any) {
    console.error("[v0] FDA submission error:", error)
    return NextResponse.json({ error: "Failed to submit to FDA" }, { status: 500 })
  }
}
