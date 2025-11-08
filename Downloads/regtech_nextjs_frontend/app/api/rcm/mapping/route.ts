import { createRLSPostHandler, createRLSGetHandler } from "@/lib/api-rls-handler"
import { query } from "@/lib/db"
import { logAuditAction } from "@/lib/audit"

// =========================================================
// 1. GET HANDLER - FETCH MAPPINGS WITH PROPER RESPONSE
// =========================================================

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    try {
      const { searchParams } = new URL(request.url)
      const productId = searchParams.get("productId")
      const status = searchParams.get("status")

      console.log("[v0] GET /api/rcm/mapping - Context:", {
        clientId: context.clientId,
        userId: context.userId,
        roles: context.roles,
      })

      if (!context.clientId) {
        console.error("[v0] Missing clientId in context - returning empty array")
        return []
      }

      let sql = `
        SELECT 
            m.id, 
            m.applicability_level, 
            m.requires_action, 
            p.product_code,
            p.product_name,
            r.title AS regulation_title,
            r.risk_level AS inherent_risk_level,
            r.id AS regulatory_intelligence_id
        FROM 
            tbl_product_regulation_mappings m
        JOIN 
            tbl_products p ON m.product_id = p.id
        JOIN 
            tbl_regulatory_intelligence r ON m.regulatory_intelligence_id = r.id
        WHERE 
            m.client_id = ?
      `
      const params: (string | number)[] = [context.clientId]

      if (productId) {
        sql += ` AND m.product_id = ?`
        params.push(productId)
      }

      if (status && status === "requires_action") {
        sql += ` AND m.requires_action = 1`
      } else if (status) {
        sql += ` AND m.applicability_level = ?`
        params.push(status)
      }

      sql += ` ORDER BY p.product_name, r.title`

      console.log("[v0] Executing query with params:", params)
      const mappings = await query(sql, params)

      const transformedMappings = (mappings || []).map((row: any) => ({
        productCode: row.product_code,
        productName: row.product_name,
        regulationId: row.regulatory_intelligence_id,
        regulationTitle: row.regulation_title,
        applicabilityLevel: row.applicability_level,
        requiresAction: Boolean(row.requires_action),
      }))

      console.log("[v0] GET /api/rcm/mapping - Returning:", transformedMappings.length, "mappings")

      return transformedMappings
    } catch (error: any) {
      console.error("[v0] Error in GET /api/rcm/mapping:", error)
      throw error
    }
  },
  { requiredRoles: [] },
)

// =========================================================
// 2. POST HANDLER - CREATE/UPDATE MAPPINGS
// =========================================================

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    // Get all products for this client
    const products = await query(
      `SELECT id, product_code, product_name FROM tbl_products WHERE client_id = ? AND status = 'active'`,
      [context.clientId],
    )

    // Get all active regulatory intelligence records
    const regulations = await query(
      `SELECT id, title, affected_areas, risk_level FROM tbl_regulatory_intelligence 
       WHERE client_id = ? AND status IN ('new', 'under_review', 'requires_action')`,
      [context.clientId],
    )

    console.log(
      "[v0] POST /api/rcm/mapping - products:",
      (products as any[]).length,
      "regulations:",
      (regulations as any[]).length,
    )

    let created = 0
    let updated = 0

    // For each product, map to relevant regulations
    for (const product of products as any[]) {
      for (const reg of regulations as any[]) {
        const affectedAreas =
          typeof reg.affected_areas === "string" ? JSON.parse(reg.affected_areas) : reg.affected_areas

        // Determine applicability based on risk level and affected areas
        let applicabilityLevel = "low"
        if (reg.risk_level === "critical") {
          applicabilityLevel = "critical"
        } else if (reg.risk_level === "high") {
          applicabilityLevel = "high"
        } else if (reg.risk_level === "medium") {
          applicabilityLevel = "medium"
        }

        const requiresAction = ["critical", "high"].includes(reg.risk_level)

        // Check if mapping already exists
        const existing = await query(
          `SELECT id FROM tbl_product_regulation_mappings 
           WHERE product_id = ? AND regulatory_intelligence_id = ?`,
          [product.id, reg.id],
        )

        if ((existing as any[]).length > 0) {
          // Update existing mapping
          await query(
            `UPDATE tbl_product_regulation_mappings 
             SET applicability_level = ?, requires_action = ?, updated_at = NOW()
             WHERE id = ?`,
            [applicabilityLevel, requiresAction ? 1 : 0, (existing as any[])[0].id],
          )
          updated++
        } else {
          // Create new mapping
          const mappingId = require("crypto").randomUUID()
          await query(
            `INSERT INTO tbl_product_regulation_mappings 
             (id, client_id, product_id, regulatory_intelligence_id, applicability_level, requires_action, mapped_by)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              mappingId,
              context.clientId,
              product.id,
              reg.id,
              applicabilityLevel,
              requiresAction ? 1 : 0,
              context.userId,
            ],
          )
          created++
        }
      }
    }

    await logAuditAction({
      clientId: context.clientId,
      userId: context.userId,
      action: "REFRESH",
      entityType: "product_regulation_mappings",
      entityId: context.clientId,
      newValues: { created, updated },
    })

    console.log("[v0] POST /api/rcm/mapping - created:", created, "updated:", updated)

    return {
      success: true,
      message: "Product-regulation mappings refreshed successfully",
      data: {
        created,
        updated,
        total: (products as any[]).length * (regulations as any[]).length,
      },
    }
  },
  { requiredRoles: ["rcm_officer", "compliance_officer"] },
)
