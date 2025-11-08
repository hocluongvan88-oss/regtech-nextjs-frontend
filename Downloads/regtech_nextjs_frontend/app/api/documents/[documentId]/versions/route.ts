import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params
    const result = await query(
      `SELECT dv.*, u.email as uploaded_by_email
       FROM tbl_document_versions dv
       LEFT JOIN tbl_users u ON dv.uploaded_by = u.id
       WHERE dv.document_id = ?
       ORDER BY dv.version_number DESC`,
      [documentId],
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching document versions:", error)
    return NextResponse.json({ error: "Failed to fetch versions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params
    const body = await request.json()
    const { filePath, uploadedBy, changeNotes } = body

    const versionResult: any = await query(
      `SELECT MAX(version_number) as max_version FROM tbl_document_versions WHERE document_id = ?`,
      [documentId],
    )

    const newVersionNumber =
      (Array.isArray(versionResult) ? versionResult[0]?.max_version : versionResult?.max_version) || 0 + 1

    // Create new version
    const result = await query(
      `INSERT INTO tbl_document_versions 
       (document_id, version_number, file_path, uploaded_by, approval_status, change_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [documentId, newVersionNumber, filePath, uploadedBy, "pending", changeNotes || ""],
    )

    // Update document with new file path
    await query(`UPDATE tbl_documents SET file_path = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      filePath,
      documentId,
    ])

    return NextResponse.json({ versionNumber: newVersionNumber }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating document version:", error)
    return NextResponse.json({ error: "Failed to create version" }, { status: 500 })
  }
}
