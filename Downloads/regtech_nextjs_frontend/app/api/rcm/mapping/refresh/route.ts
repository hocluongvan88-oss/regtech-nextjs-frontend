import { createRLSPostHandler } from "@/lib/api-rls-handler"
import { getDb } from "@/lib/mysql"
import { logAuditAction } from "@/lib/audit"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const db = await getDb()

    // Get all products for this client
    const [products] = await db.execute(
      `SELECT id, product_code, product_name FROM tbl_products WHERE client_id = ? AND status = 'active'`,
      [context.clientId],
    )

    // Get all active regulatory intelligence records
    const [regulations] = await db.execute(
      `SELECT id, title, affected_areas, risk_level FROM tbl_regulatory_intelligence 
       WHERE client_id = ? AND status IN ('new', 'under_review', 'requires_action')`,
      [context.clientId],
    )

    let created = 0
    let updated = 0

    // For each product, map to relevant regulations
    for (const product of products) {
      for (const reg of regulations) {
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
        const [existing] = await db.execute(
          `SELECT id FROM tbl_product_regulation_mappings 
           WHERE product_id = ? AND regulatory_intelligence_id = ?`,
          [product.id, reg.id],
        )

        if (existing && existing.length > 0) {
          // Update existing mapping
          await db.execute(
            `UPDATE tbl_product_regulation_mappings 
             SET applicability_level = ?, requires_action = ?, updated_at = NOW()
             WHERE id = ?`,
            [applicabilityLevel, requiresAction ? 1 : 0, existing[0].id],
          )
          updated++
        } else {
          // Create new mapping
          const mappingId = require("crypto").randomUUID()
          await db.execute(
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

    return {
      success: true,
      message: "Product-regulation mappings refreshed successfully",
      data: {
        created,
        updated,
        total: products.length * regulations.length,
      },
    }
  },
  { requiredRoles: ["system_administrator", "admin", "rcm_officer", "compliance_officer", "official_correspondent"] },
)
