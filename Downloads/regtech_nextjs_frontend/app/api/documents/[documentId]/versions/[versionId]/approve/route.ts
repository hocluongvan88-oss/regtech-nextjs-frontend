import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest, { params }: { params: { documentId: string; versionId: string } }) {
  try {
    const body = await request.json()
    const { approvedBy, approvalNotes } = body

    await query(
      `UPDATE tbl_document_versions 
       SET approval_status = ?, approved_by = ?, approval_date = CURRENT_TIMESTAMP, approval_notes = ?
       WHERE id = ?`,
      [approvedBy ? "approved" : "pending", approvedBy, approvalNotes || "", params.versionId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error approving document version:", error)
    return NextResponse.json({ error: "Failed to approve version" }, { status: 500 })
  }
}
