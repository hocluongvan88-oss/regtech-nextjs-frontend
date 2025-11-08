import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const q = searchParams.get("q")

    if (!q || q.length < 2) {
      return NextResponse.json({ results: [] })
    }

    const searchTerm = `%${q}%`

    // Search across multiple tables with UNION
    const results = await query(
      `
      SELECT id, organization_name as title, 'client' as type, CONCAT('/dashboard/clients/', id) as link, NULL as description
      FROM organizations
      WHERE organization_name LIKE ? AND deleted_at IS NULL
      LIMIT 5
      
      UNION ALL
      
      SELECT id, facility_name as title, 'facility' as type, CONCAT('/dashboard/facilities/', id) as link, registration_status as description
      FROM facilities
      WHERE facility_name LIKE ? AND deleted_at IS NULL
      LIMIT 5
      
      UNION ALL
      
      SELECT id, product_name as title, 'product' as type, CONCAT('/dashboard/products/', id) as link, NULL as description
      FROM products
      WHERE product_name LIKE ? AND deleted_at IS NULL
      LIMIT 5
      
      UNION ALL
      
      SELECT id, CONCAT('Submission #', id) as title, 'submission' as type, CONCAT('/dashboard/submissions/', id) as link, submission_type as description
      FROM submissions
      WHERE submission_type LIKE ? AND deleted_at IS NULL
      LIMIT 5
      
      UNION ALL
      
      SELECT id, document_name as title, 'document' as type, CONCAT('/dashboard/documents/', id) as link, document_type as description
      FROM documents
      WHERE document_name LIKE ? AND deleted_at IS NULL
      LIMIT 5
      `,
      [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm],
    )

    return NextResponse.json({
      results: Array.isArray(results) ? results.slice(0, 10) : [],
    })
  } catch (error) {
    console.error("[v0] Search error:", error)
    return NextResponse.json({ error: "Search failed" }, { status: 500 })
  }
}
