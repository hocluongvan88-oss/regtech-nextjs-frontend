import { query } from "./db"
import { logAuditAction } from "./audit"

export type RegulatoryIntelligence = {
  id: string
  client_id: string
  regulatory_body: string
  change_type: string
  title: string
  description?: string
  source_url?: string
  regulatory_reference_id?: string
  content_summary?: string
  preliminary_impact_assessment?: string
  affected_areas: string[]
  risk_level: "low" | "medium" | "high" | "critical"
  announcement_date?: string
  effective_date?: string
  comment_deadline_date?: string
  status: "new" | "under_review" | "requires_action" | "implemented" | "archived"
  rcm_officer_id?: string
  action_required: boolean
  action_items_count: number
  created_at: string
  updated_at: string
}

export type RCMActionItem = {
  id: string
  client_id: string
  regulatory_intelligence_id: string
  action_title: string
  action_description?: string
  action_type: string
  assigned_to: string
  department?: string
  due_date: string
  priority: "low" | "medium" | "high" | "critical"
  status: "pending" | "in_progress" | "completed" | "blocked" | "cancelled"
  completion_date?: string
  risk_if_not_completed?: string
  estimated_hours?: number
  created_at: string
  updated_at: string
}

export type RCMImpactAssessment = {
  id: string
  client_id: string
  regulatory_intelligence_id: string
  assessment_date: string
  assessed_by: string
  labeling_impact_required: boolean
  labeling_update_hours?: number
  quality_impact_required: boolean
  qms_update_hours?: number
  manufacturing_impact_required: boolean
  manufacturing_change_hours?: number
  training_required: boolean
  training_estimated_hours?: number
  total_estimated_hours: number
  estimated_cost_usd?: number
  implementation_risk: "low" | "medium" | "high"
  compliance_risk_if_not_implemented: "low" | "medium" | "high"
  status: "pending_approval" | "approved" | "rejected" | "in_progress"
  approved_by?: string
  created_at: string
  updated_at: string
}

export type ProductRegulationMapping = {
  id: string
  client_id: string
  product_id: string
  product_code?: string
  product_name?: string
  regulatory_intelligence_id: string
  regulation_id?: string
  regulation_title?: string
  applicability_level: "critical" | "high" | "medium" | "low"
  requires_action: boolean
  notes?: string
  mapped_by?: string
  mapped_date?: string
  created_at: string
  updated_at: string
}

// ============================================
// REGULATORY INTELLIGENCE MANAGEMENT
// ============================================

export async function createRegulatoryIntelligence(
  clientId: string,
  data: Omit<RegulatoryIntelligence, "id" | "created_at" | "updated_at">,
  userId: string,
  userAgent?: string,
): Promise<RegulatoryIntelligence> {
  const id = require("crypto").randomUUID()

  const queryStr = `
    INSERT INTO tbl_regulatory_intelligence (
      id, client_id, regulatory_body, change_type, title,
      description, source_url, regulatory_reference_id, content_summary,
      preliminary_impact_assessment, affected_areas, risk_level,
      announcement_date, effective_date, comment_deadline_date,
      status, rcm_officer_id, action_required, action_items_count
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  await query(queryStr, [
    id,
    clientId,
    data.regulatory_body,
    data.change_type,
    data.title,
    data.description || null,
    data.source_url || null,
    data.regulatory_reference_id || null,
    data.content_summary || null,
    data.preliminary_impact_assessment || null,
    JSON.stringify(data.affected_areas || []),
    data.risk_level,
    data.announcement_date || null,
    data.effective_date || null,
    data.comment_deadline_date || null,
    data.status,
    data.rcm_officer_id || null,
    data.action_required ? 1 : 0,
    data.action_items_count || 0,
  ])

  await logAuditAction({
    clientId,
    userId,
    action: "CREATE",
    entityType: "regulatory_intelligence",
    entityId: id,
    newValues: { ...data, id },
    userAgent,
  })

  return getRegulatoryIntelligence(id, clientId)
}

export async function getRegulatoryIntelligence(id: string, clientId: string): Promise<RegulatoryIntelligence> {
  const queryStr = `
    SELECT * FROM tbl_regulatory_intelligence
    WHERE id = ? AND client_id = ?
  `

  const rows = await query(queryStr, [id, clientId])
  if (!rows.length) throw new Error("Regulatory intelligence not found")

  const row = rows[0]
  return {
    ...row,
    affected_areas: typeof row.affected_areas === "string" ? JSON.parse(row.affected_areas) : row.affected_areas,
  }
}

export async function listRegulatoryIntelligence(
  clientId: string,
  filters?: {
    status?: string
    risk_level?: string
    regulatory_body?: string
  },
): Promise<RegulatoryIntelligence[]> {
  let queryStr = "SELECT * FROM tbl_regulatory_intelligence WHERE client_id = ?"
  const params: any[] = [clientId]

  if (filters?.status) {
    queryStr += " AND status = ?"
    params.push(filters.status)
  }

  if (filters?.risk_level) {
    queryStr += " AND risk_level = ?"
    params.push(filters.risk_level)
  }

  if (filters?.regulatory_body) {
    queryStr += " AND regulatory_body = ?"
    params.push(filters.regulatory_body)
  }

  queryStr += " ORDER BY created_at DESC"

  const rows = await query(queryStr, params)
  return (rows as any[]).map((row: any) => ({
    ...row,
    affected_areas: typeof row.affected_areas === "string" ? JSON.parse(row.affected_areas) : row.affected_areas,
  }))
}

export async function updateRegulatoryIntelligenceStatus(
  id: string,
  clientId: string,
  status: string,
  userId: string,
  userAgent?: string,
): Promise<void> {
  const queryStr = `
    UPDATE tbl_regulatory_intelligence
    SET status = ?, updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await query(queryStr, [status, id, clientId])

  await logAuditAction({
    clientId,
    userId,
    action: "UPDATE",
    entityType: "regulatory_intelligence",
    entityId: id,
    newValues: { status },
    userAgent,
  })
}

// ============================================
// RCM ACTION ITEMS MANAGEMENT
// ============================================

export async function createRCMActionItem(
  clientId: string,
  data: Omit<RCMActionItem, "id" | "created_at" | "updated_at">,
  userId: string,
  userAgent?: string,
): Promise<RCMActionItem> {
  const id = require("crypto").randomUUID()

  const queryStr = `
    INSERT INTO tbl_rcm_action_items (
      id, client_id, regulatory_intelligence_id, action_title,
      action_description, action_type, assigned_to, department,
      due_date, priority, status, risk_if_not_completed, estimated_hours
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  await query(queryStr, [
    id,
    clientId,
    data.regulatory_intelligence_id,
    data.action_title,
    data.action_description || null,
    data.action_type,
    data.assigned_to,
    data.department || null,
    data.due_date,
    data.priority,
    data.status,
    data.risk_if_not_completed || null,
    data.estimated_hours || null,
  ])

  // Update action items count on regulatory intelligence
  await query(`UPDATE tbl_regulatory_intelligence SET action_items_count = action_items_count + 1 WHERE id = ?`, [
    data.regulatory_intelligence_id,
  ])

  await logAuditAction({
    clientId,
    userId,
    action: "CREATE",
    entityType: "rcm_action_item",
    entityId: id,
    newValues: { ...data, id },
    userAgent,
  })

  return getRCMActionItem(id, clientId)
}

export async function getRCMActionItem(id: string, clientId: string): Promise<RCMActionItem> {
  const queryStr = `
    SELECT * FROM tbl_rcm_action_items
    WHERE id = ? AND client_id = ?
  `

  const rows = await query(queryStr, [id, clientId])
  if (!rows.length) throw new Error("RCM action item not found")

  return rows[0]
}

export async function listRCMActionItems(
  clientId: string,
  filters?: {
    status?: string
    priority?: string
    regulatory_intelligence_id?: string
  },
): Promise<RCMActionItem[]> {
  let queryStr = "SELECT * FROM tbl_rcm_action_items WHERE client_id = ?"
  const params: any[] = [clientId]

  if (filters?.status) {
    queryStr += " AND status = ?"
    params.push(filters.status)
  }

  if (filters?.priority) {
    queryStr += " AND priority = ?"
    params.push(filters.priority)
  }

  if (filters?.regulatory_intelligence_id) {
    queryStr += " AND regulatory_intelligence_id = ?"
    params.push(filters.regulatory_intelligence_id)
  }

  queryStr += " ORDER BY due_date ASC, priority DESC"

  const rows = await query(queryStr, params)
  return rows
}

export async function updateRCMActionItemStatus(
  id: string,
  clientId: string,
  status: string,
  userId: string,
  completionDate?: string,
  userAgent?: string,
): Promise<void> {
  const queryStr = `
    UPDATE tbl_rcm_action_items
    SET status = ?, completion_date = ?, updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await query(queryStr, [status, completionDate || null, id, clientId])

  await logAuditAction({
    clientId,
    userId,
    action: "UPDATE",
    entityType: "rcm_action_item",
    entityId: id,
    newValues: { status, completion_date: completionDate },
    userAgent,
  })
}

// ============================================
// IMPACT ASSESSMENT MANAGEMENT
// ============================================

export async function createImpactAssessment(
  clientId: string,
  data: Omit<RCMImpactAssessment, "id" | "created_at" | "updated_at">,
  userId: string,
  userAgent?: string,
): Promise<RCMImpactAssessment> {
  const id = require("crypto").randomUUID()

  const queryStr = `
    INSERT INTO tbl_rcm_impact_assessments (
      id, client_id, regulatory_intelligence_id, assessment_date,
      assessed_by, labeling_impact_required, labeling_update_hours,
      quality_impact_required, qms_update_hours, manufacturing_impact_required,
      manufacturing_change_hours, training_required, training_estimated_hours,
      total_estimated_hours, estimated_cost_usd, implementation_risk,
      compliance_risk_if_not_implemented, status, approved_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  await query(queryStr, [
    id,
    clientId,
    data.regulatory_intelligence_id,
    data.assessment_date,
    data.assessed_by,
    data.labeling_impact_required ? 1 : 0,
    data.labeling_update_hours || null,
    data.quality_impact_required ? 1 : 0,
    data.qms_update_hours || null,
    data.manufacturing_impact_required ? 1 : 0,
    data.manufacturing_change_hours || null,
    data.training_required ? 1 : 0,
    data.training_estimated_hours || null,
    data.total_estimated_hours,
    data.estimated_cost_usd || null,
    data.implementation_risk,
    data.compliance_risk_if_not_implemented,
    data.status,
    data.approved_by || null,
  ])

  await logAuditAction({
    clientId,
    userId,
    action: "CREATE",
    entityType: "impact_assessment",
    entityId: id,
    newValues: { ...data, id },
    userAgent,
  })

  return getImpactAssessment(id, clientId)
}

export async function getImpactAssessment(id: string, clientId: string): Promise<RCMImpactAssessment> {
  const queryStr = `
    SELECT * FROM tbl_rcm_impact_assessments
    WHERE id = ? AND client_id = ?
  `

  const rows = await query(queryStr, [id, clientId])
  if (!rows.length) throw new Error("Impact assessment not found")

  return rows[0]
}

export async function listImpactAssessments(
  clientId: string,
  filters?: {
    regulatory_intelligence_id?: string
    status?: string
  },
): Promise<RCMImpactAssessment[]> {
  let queryStr = "SELECT * FROM tbl_rcm_impact_assessments WHERE client_id = ?"
  const params: any[] = [clientId]

  if (filters?.regulatory_intelligence_id) {
    queryStr += " AND regulatory_intelligence_id = ?"
    params.push(filters.regulatory_intelligence_id)
  }

  if (filters?.status) {
    queryStr += " AND status = ?"
    params.push(filters.status)
  }

  queryStr += " ORDER BY created_at DESC"

  const rows = await query(queryStr, params)
  return rows
}

export async function approveImpactAssessment(
  id: string,
  clientId: string,
  approvedBy: string,
  userId: string,
  userAgent?: string,
): Promise<void> {
  const queryStr = `
    UPDATE tbl_rcm_impact_assessments
    SET status = 'approved', approved_by = ?, updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await query(queryStr, [approvedBy, id, clientId])

  await logAuditAction({
    clientId,
    userId,
    action: "APPROVE",
    entityType: "impact_assessment",
    entityId: id,
    newValues: { status: "approved" },
    userAgent,
  })
}

// ============================================
// PRODUCT REGULATION MAPPING MANAGEMENT
// ============================================

export async function listProductRegulatoryMappings(
  clientId: string,
  filters?: {
    product_id?: string
    regulatory_intelligence_id?: string
    applicability_level?: string
    requires_action?: boolean
  },
): Promise<ProductRegulationMapping[]> {
  let queryStr = `
    SELECT 
      prm.id,
      prm.client_id,
      prm.product_id,
      p.product_code,
      p.product_name,
      prm.regulatory_intelligence_id,
      ri.regulatory_reference_id as regulation_id,
      ri.title as regulation_title,
      prm.applicability_level,
      prm.requires_action,
      prm.notes,
      prm.mapped_by,
      prm.mapped_date,
      prm.created_at,
      prm.updated_at
    FROM tbl_product_regulation_mappings prm
    LEFT JOIN tbl_products p ON prm.product_id = p.id
    LEFT JOIN tbl_regulatory_intelligence ri ON prm.regulatory_intelligence_id = ri.id
    WHERE prm.client_id = ?
  `
  const params: any[] = [clientId]

  if (filters?.product_id) {
    queryStr += " AND prm.product_id = ?"
    params.push(filters.product_id)
  }

  if (filters?.regulatory_intelligence_id) {
    queryStr += " AND prm.regulatory_intelligence_id = ?"
    params.push(filters.regulatory_intelligence_id)
  }

  if (filters?.applicability_level) {
    queryStr += " AND prm.applicability_level = ?"
    params.push(filters.applicability_level)
  }

  if (filters?.requires_action !== undefined) {
    queryStr += " AND prm.requires_action = ?"
    params.push(filters.requires_action ? 1 : 0)
  }

  queryStr += " ORDER BY prm.created_at DESC"

  const rows = await query(queryStr, params)
  return (rows as any[]) || []
}

export async function createProductRegulationMapping(
  clientId: string,
  data: Omit<ProductRegulationMapping, "id" | "created_at" | "updated_at">,
  userId: string,
  userAgent?: string,
): Promise<ProductRegulationMapping> {
  const id = require("crypto").randomUUID()

  const queryStr = `
    INSERT INTO tbl_product_regulation_mappings (
      id, client_id, product_id, regulatory_intelligence_id,
      applicability_level, requires_action, notes, mapped_by
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `

  await query(queryStr, [
    id,
    clientId,
    data.product_id,
    data.regulatory_intelligence_id,
    data.applicability_level,
    data.requires_action ? 1 : 0,
    data.notes || null,
    userId,
  ])

  await logAuditAction({
    clientId,
    userId,
    action: "CREATE",
    entityType: "product_regulation_mapping",
    entityId: id,
    newValues: { ...data, id },
    userAgent,
  })

  const mappings = await listProductRegulatoryMappings(clientId, { product_id: data.product_id })
  return mappings[0]
}

export async function updateProductRegulationMapping(
  id: string,
  clientId: string,
  data: Partial<Omit<ProductRegulationMapping, "id" | "client_id" | "created_at" | "updated_at">>,
  userId: string,
  userAgent?: string,
): Promise<void> {
  const updateFields: string[] = []
  const updateValues: any[] = []

  if (data.applicability_level) {
    updateFields.push("applicability_level = ?")
    updateValues.push(data.applicability_level)
  }

  if (data.requires_action !== undefined) {
    updateFields.push("requires_action = ?")
    updateValues.push(data.requires_action ? 1 : 0)
  }

  if (data.notes !== undefined) {
    updateFields.push("notes = ?")
    updateValues.push(data.notes)
  }

  if (updateFields.length === 0) return

  updateValues.push(id)
  updateValues.push(clientId)

  const queryStr = `
    UPDATE tbl_product_regulation_mappings
    SET ${updateFields.join(", ")}, updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await query(queryStr, updateValues)

  await logAuditAction({
    clientId,
    userId,
    action: "UPDATE",
    entityType: "product_regulation_mapping",
    entityId: id,
    newValues: data,
    userAgent,
  })
}
