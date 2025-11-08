import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const userClientId = request.headers.get("x-client-id")
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"

    if (!userClientId && !isSystemAdmin) {
      console.log("[v0] No auth headers, returning empty invoices array")
      return NextResponse.json([])
    }

    try {
      let q = `SELECT 
        f.id,
        f.id as invoiceNumber,
        f.due_date as invoiceDate,
        f.amount,
        f.payment_status as status,
        cf.facility_name,
        c.company_name as client_name
      FROM tbl_fees f
      LEFT JOIN tbl_client_facilities cf ON f.facility_id = cf.id
      LEFT JOIN tbl_clients c ON f.client_id = c.id
      WHERE f.deleted_at IS NULL`

      const params: any[] = []

      // Enforce tenant isolation
      if (!isSystemAdmin && userClientId) {
        q += ` AND f.client_id = ?`
        params.push(userClientId)
      }

      q += ` ORDER BY f.due_date DESC, f.created_at DESC`

      const invoices = await query(q, params)

      // Transform to match invoice format
      const transformedInvoices = (invoices || []).map((inv: any) => ({
        id: inv.id,
        invoiceNumber: `INV-${String(inv.id).padStart(6, "0")}`,
        invoiceDate: inv.invoiceDate,
        amount: Number.parseFloat(inv.amount),
        status: inv.status === "paid" ? "paid" : "pending",
        downloadUrl: `/api/fees/invoices/${inv.id}/download`,
      }))

      return NextResponse.json(transformedInvoices || [])
    } catch (dbError: any) {
      if (dbError.message?.includes("doesn't exist") || dbError.code === "ER_NO_SUCH_TABLE") {
        console.log("[v0] Fees table not found, returning empty array")
        return NextResponse.json([])
      }
      throw dbError
    }
  } catch (error) {
    console.error("[v0] Error fetching invoices:", error)
    return NextResponse.json([])
  }
}
