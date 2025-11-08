import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")
    const status = searchParams.get("status")

    let sql = `
      SELECT 
        s.id,
        s.submission_number,
        s.submission_status,
        s.submitted_date,
        f.facility_name,
        f.fei_number,
        f.duns_number,
        f.country,
        p.product_name,
        p.product_code,
        p.regulatory_pathway
      FROM tbl_submissions s
      JOIN tbl_client_facilities f ON s.facility_id = f.id
      LEFT JOIN tbl_submission_products sp ON s.id = sp.submission_id
      LEFT JOIN tbl_products p ON sp.product_id = p.id
      WHERE s.submission_type = 'coe' AND s.client_id = ?
    `
    const params: any[] = [clientId]

    if (status) {
      sql += ` AND s.submission_status = ?`
      params.push(status)
    }

    sql += ` ORDER BY s.submitted_date DESC`

    const results = await query(sql, params)
    return NextResponse.json(results)
  } catch (error) {
    console.error("[v0] COE API error:", error)
    return NextResponse.json({ error: "Failed to fetch COE records" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, facilityId, productIds, exportingCountry, certificationStatement } = body

    const submissionResult = await query(
      `INSERT INTO tbl_submissions 
       (client_id, facility_id, submission_type, submission_status, comments)
       VALUES (?, ?, ?, ?, ?)`,
      [clientId, facilityId, "coe", "draft", certificationStatement],
    )

    const submissionId = (submissionResult as any).insertId

    // Link products to submission
    for (const productId of productIds) {
      await query(`INSERT INTO tbl_submission_products (submission_id, product_id) VALUES (?, ?)`, [
        submissionId,
        productId,
      ])
    }

    return NextResponse.json({ id: submissionId, type: "coe" }, { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating COE:", error)
    return NextResponse.json({ error: "Failed to create COE" }, { status: 500 })
  }
}
