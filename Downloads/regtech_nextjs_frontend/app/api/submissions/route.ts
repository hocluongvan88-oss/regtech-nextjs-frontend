import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userClientId = request.headers.get("x-client-id")
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"
    const isServiceManager = request.headers.get("x-is-service-manager") === "true"

    if (!userClientId && !isSystemAdmin && !isServiceManager) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")
    const facilityId = searchParams.get("facility_id")
    const status = searchParams.get("status")

    let q = `SELECT * FROM tbl_submissions WHERE deleted_at IS NULL`
    const params: any[] = []

    if (!isSystemAdmin && !isServiceManager) {
      q += ` AND client_id = ?`
      params.push(userClientId)
    } else if (clientId) {
      q += ` AND client_id = ?`
      params.push(clientId)
    }

    if (facilityId) {
      q += ` AND facility_id = ?`
      params.push(facilityId)
    }

    if (status) {
      q += ` AND submission_status = ?`
      params.push(status)
    }

    q += ` ORDER BY created_at DESC`
    const submissions = await query(q, params)

    return NextResponse.json(submissions)
  } catch (error) {
    console.error("[v0] Error fetching submissions:", error)
    return NextResponse.json({ error: "Failed to fetch submissions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { client_id, facility_id, submission_type, product_ids } = body

    if (!client_id || !facility_id || !submission_type) {
      return NextResponse.json({ error: "Client ID, facility ID, and submission type are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO tbl_submissions 
       (client_id, facility_id, submission_type, submission_status)
       VALUES (?, ?, ?, 'draft')`,
      [client_id, facility_id, submission_type],
    )

    const submissionId = (result as any).insertId

    // Link products if provided
    if (product_ids && Array.isArray(product_ids)) {
      for (const productId of product_ids) {
        await query(
          `INSERT INTO tbl_submission_products (submission_id, product_id)
           VALUES (?, ?)`,
          [submissionId, productId],
        )
      }
    }

    const inserted: any = await query(`SELECT * FROM tbl_submissions WHERE id = ?`, [submissionId])
    return NextResponse.json(inserted[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating submission:", error)
    return NextResponse.json({ error: "Failed to create submission" }, { status: 500 })
  }
}
