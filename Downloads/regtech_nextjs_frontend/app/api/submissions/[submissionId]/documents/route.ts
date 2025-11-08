import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const { submissionId } = await params
    const result = await query(`SELECT * FROM tbl_documents WHERE submission_id = ? AND deleted_at IS NULL`, [
      submissionId,
    ])

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching documents:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}
