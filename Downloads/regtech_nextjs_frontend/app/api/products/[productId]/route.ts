import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params
    const result = await query(`SELECT * FROM tbl_products WHERE id = ? AND deleted_at IS NULL`, [productId])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error fetching product:", error)
    return NextResponse.json({ error: "Failed to fetch product" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params
    const body = await request.json()

    await query(
      `UPDATE tbl_products 
       SET product_name = IFNULL(?, product_name),
           product_type = IFNULL(?, product_type),
           product_classification = IFNULL(?, product_classification),
           intended_use = IFNULL(?, intended_use),
           regulatory_pathway = IFNULL(?, regulatory_pathway),
           status = IFNULL(?, status)
       WHERE id = ?`,
      [
        body.product_name || null,
        body.product_type || null,
        body.product_classification || null,
        body.intended_use || null,
        body.regulatory_pathway || null,
        body.status || null,
        productId,
      ],
    )

    const result: any = await query(`SELECT * FROM tbl_products WHERE id = ?`, [productId])
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating product:", error)
    return NextResponse.json({ error: "Failed to update product" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params
    await query(`UPDATE tbl_products SET deleted_at = NOW() WHERE id = ?`, [productId])

    const result: any = await query(`SELECT id FROM tbl_products WHERE id = ?`, [productId])
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Product deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting product:", error)
    return NextResponse.json({ error: "Failed to delete product" }, { status: 500 })
  }
}
