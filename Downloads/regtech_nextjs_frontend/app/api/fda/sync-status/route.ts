import { getSubmissionStatus } from "@/lib/fda-api"
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const submissions: any = await query(
      `SELECT id, client_id, fda_submission_id FROM tbl_submissions 
       WHERE fda_submission_id IS NOT NULL 
       AND submission_status NOT IN ('approved', 'rejected')
       AND deleted_at IS NULL`,
    )

    const results = []

    for (const submission of submissions) {
      const status = await getSubmissionStatus(submission.client_id, submission.id, submission.fda_submission_id)

      results.push({
        submissionId: submission.id,
        status: status.status,
        error: status.error,
      })
    }

    return NextResponse.json({
      message: "Status sync completed",
      synced: results.length,
      results,
    })
  } catch (error: any) {
    console.error("[v0] Status sync error:", error)
    return NextResponse.json({ error: "Sync failed" }, { status: 500 })
  }
}
