import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userClientId = request.headers.get("x-client-id")
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"

    if (!userClientId && !isSystemAdmin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("client_id")

    try {
      let q = `SELECT 
        f.*,
        cf.facility_name,
        c.company_name as client_name
      FROM tbl_fees f
      LEFT JOIN tbl_client_facilities cf ON f.facility_id = cf.id
      LEFT JOIN tbl_clients c ON f.client_id = c.id
      WHERE f.deleted_at IS NULL`

      const params: any[] = []

      // Enforce tenant isolation
      if (!isSystemAdmin) {
        q += ` AND f.client_id = ?`
        params.push(userClientId)
      } else if (clientId) {
        q += ` AND f.client_id = ?`
        params.push(clientId)
      }

      q += ` ORDER BY f.due_date DESC, f.created_at DESC`

      const fees = await query(q, params)
      return NextResponse.json(fees || [])
    } catch (dbError: any) {
      // If table doesn't exist, return empty array instead of error
      if (dbError.message?.includes("doesn't exist") || dbError.code === "ER_NO_SUCH_TABLE") {
        console.log("[v0] Fees table not found, returning empty array")
        return NextResponse.json([])
      }
      throw dbError
    }
  } catch (error) {
    console.error("[v0] Error fetching fees:", error)
    return NextResponse.json({ error: "Failed to fetch fees" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userClientId = request.headers.get("x-client-id")
    if (!userClientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      facility_id,
      fee_type,
      fiscal_year,
      amount,
      due_date,
      payment_status = "pending",
      pin_number,
      pcn_number,
    } = body

    if (!facility_id || !fee_type || !amount || !due_date) {
      return NextResponse.json({ error: "Facility ID, fee type, amount, and due date are required" }, { status: 400 })
    }

    try {
      const result = await query(
        `INSERT INTO tbl_fees 
         (client_id, facility_id, fee_type, fiscal_year, amount, due_date, 
          payment_status, pin_number, pcn_number, pin_validated)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          userClientId,
          facility_id,
          fee_type,
          fiscal_year,
          amount,
          due_date,
          payment_status,
          pin_number,
          pcn_number,
          false,
        ],
      )

      const inserted: any = await query(`SELECT * FROM tbl_fees WHERE id = LAST_INSERT_ID()`)
      return NextResponse.json(inserted[0], { status: 201 })
    } catch (dbError: any) {
      if (dbError.message?.includes("doesn't exist") || dbError.code === "ER_NO_SUCH_TABLE") {
        return NextResponse.json(
          { error: "Fees feature not yet configured. Please contact system administrator." },
          { status: 503 },
        )
      }
      throw dbError
    }
  } catch (error) {
    console.error("[v0] Error creating fee:", error)
    return NextResponse.json({ error: "Failed to create fee" }, { status: 500 })
  }
}
