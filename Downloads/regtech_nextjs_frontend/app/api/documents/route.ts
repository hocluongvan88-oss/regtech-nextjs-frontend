import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const submissionId = searchParams.get("submissionId")
    const facilityId = searchParams.get("facilityId")
    const docType = searchParams.get("docType")

    let sql = `
      SELECT 
        d.*,
        u.email as uploaded_by_email,
        COUNT(DISTINCT dv.id) as version_count
      FROM tbl_documents d
      LEFT JOIN tbl_users u ON d.uploaded_by = u.id
      LEFT JOIN tbl_document_versions dv ON d.id = dv.document_id
      WHERE d.deleted_at IS NULL
    `
    const params: any[] = []

    if (clientId) {
      sql += " AND d.client_id = ?"
      params.push(clientId)
    }

    if (submissionId) {
      sql += " AND d.submission_id = ?"
      params.push(submissionId)
    }

    if (facilityId) {
      sql += " AND d.facility_id = ?"
      params.push(facilityId)
    }

    if (docType) {
      sql += " AND d.document_type = ?"
      params.push(docType)
    }

    sql += " GROUP BY d.id ORDER BY d.upload_date DESC"

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] Documents API error:", error)
    return NextResponse.json({ error: "Failed to fetch documents" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      clientId,
      submissionId,
      facilityId,
      documentName,
      documentType,
      filePath,
      fileSize,
      fileMimeType,
      uploadedBy,
      isRequired,
    } = body

    const docResult = await query(
      `INSERT INTO tbl_documents 
       (client_id, submission_id, facility_id, document_name, document_type, file_path, file_size, file_mime_type, uploaded_by, is_required)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        submissionId,
        facilityId,
        documentName,
        documentType,
        filePath,
        fileSize,
        fileMimeType,
        uploadedBy,
        isRequired || false,
      ],
    )

    const documentId = (docResult as any).insertId

    // Create initial version record
    await query(
      `INSERT INTO tbl_document_versions 
       (document_id, version_number, file_path, uploaded_by, approval_status, change_notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [documentId, 1, filePath, uploadedBy, "pending", "Initial version"],
    )

    return NextResponse.json({ id: documentId }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating document:", error)
    return NextResponse.json({ error: "Failed to create document" }, { status: 500 })
  }
}
