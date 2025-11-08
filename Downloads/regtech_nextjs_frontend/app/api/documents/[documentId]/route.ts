import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params
    const result = await query(
      `SELECT d.*, u.email as uploaded_by_email FROM tbl_documents d
       LEFT JOIN tbl_users u ON d.uploaded_by = u.id
       WHERE d.id = ? AND d.deleted_at IS NULL`,
      [documentId],
    )

    if (!result || (Array.isArray(result) && result.length === 0)) {
      return NextResponse.json({ error: "Document not found" }, { status: 404 })
    }

    return NextResponse.json(Array.isArray(result) ? result[0] : result)
  } catch (error) {
    console.error("[v0] Error fetching document:", error)
    return NextResponse.json({ error: "Failed to fetch document" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params
    const body = await request.json()
    const { documentName, documentType, isRequired } = body

    await query(
      `UPDATE tbl_documents 
       SET document_name = ?, document_type = ?
       WHERE id = ?`,
      [documentName, documentType, documentId],
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error updating document:", error)
    return NextResponse.json({ error: "Failed to update document" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ documentId: string }> }) {
  try {
    const { documentId } = await params
    await query("UPDATE tbl_documents SET deleted_at = CURRENT_TIMESTAMP WHERE id = ?", [documentId])

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Error deleting document:", error)
    return NextResponse.json({ error: "Failed to delete document" }, { status: 500 })
  }
}
