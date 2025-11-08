import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const { submissionId } = await params
    const result = await query(`SELECT * FROM tbl_submissions WHERE id = ? AND deleted_at IS NULL`, [submissionId])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error fetching submission:", error)
    return NextResponse.json({ error: "Failed to fetch submission" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const { submissionId } = await params
    const body = await request.json()
    const { submission_status, comments, reviewed_by } = body

    await query(
      `UPDATE tbl_submissions 
       SET submission_status = IFNULL(?, submission_status),
           comments = IFNULL(?, comments),
           reviewed_by = IFNULL(?, reviewed_by),
           reviewed_date = CASE WHEN ? IS NOT NULL THEN NOW() ELSE reviewed_date END
       WHERE id = ?`,
      [submission_status, comments, reviewed_by, submission_status, submissionId],
    )

    const result: any = await query(`SELECT * FROM tbl_submissions WHERE id = ?`, [submissionId])
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating submission:", error)
    return NextResponse.json({ error: "Failed to update submission" }, { status: 500 })
  }
}
