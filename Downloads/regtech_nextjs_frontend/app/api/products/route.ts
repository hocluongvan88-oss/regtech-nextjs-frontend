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

    let q = `SELECT * FROM tbl_products WHERE deleted_at IS NULL`
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

    q += ` ORDER BY created_at DESC`
    const products = await query(q, params)

    return NextResponse.json(products)
  } catch (error) {
    console.error("[v0] Error fetching products:", error)
    return NextResponse.json({ error: "Failed to fetch products" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      client_id,
      facility_id,
      product_name,
      product_code,
      product_type,
      product_classification,
      intended_use,
      regulatory_pathway,
      ndc_number,
    } = body

    if (!client_id || !product_name) {
      return NextResponse.json({ error: "Client ID and product name are required" }, { status: 400 })
    }

    const result = await query(
      `INSERT INTO tbl_products 
       (client_id, facility_id, product_name, product_code, product_type, 
        product_classification, intended_use, regulatory_pathway, ndc_number)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        client_id,
        facility_id,
        product_name,
        product_code,
        product_type,
        product_classification,
        intended_use,
        regulatory_pathway,
        ndc_number,
      ],
    )

    const inserted: any = await query(`SELECT * FROM tbl_products WHERE id = LAST_INSERT_ID()`)
    return NextResponse.json(inserted[0], { status: 201 })
  } catch (error) {
    console.error("[v0] Error creating product:", error)
    return NextResponse.json({ error: "Failed to create product" }, { status: 500 })
  }
}
