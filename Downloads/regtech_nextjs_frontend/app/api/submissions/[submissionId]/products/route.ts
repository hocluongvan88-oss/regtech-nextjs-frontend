import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ submissionId: string }> }) {
  try {
    const { submissionId } = await params
    const result = await query(
      `SELECT p.* FROM tbl_products p
       JOIN tbl_submission_products sp ON p.id = sp.product_id
       WHERE sp.submission_id = ? AND p.deleted_at IS NULL`,
      [submissionId],
    )

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Error fetching submission products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}
