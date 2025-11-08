import { query } from "@/lib/db"
import { logAuditTrail } from "@/lib/audit"

export interface RiskRegister {
  id: string
  client_id: string
  facility_id?: string
  risk_category: string
  risk_title: string
  risk_description?: string
  probability: "low" | "medium" | "high" | "critical"
  impact: "low" | "medium" | "high" | "critical"
  risk_score: number
  risk_status: string
  identified_date: Date
}

export interface RiskMitigation {
  id: string
  risk_register_id: string
  mitigation_title: string
  mitigation_description?: string
  mitigation_strategy?: string
  assigned_to?: string
  target_completion_date?: Date
  mitigation_status: string
  effectiveness_rating?: string
}

export interface RiskAssessment {
  id: string
  client_id: string
  facility_id?: string
  assessment_date: Date
  assessment_type: string
  overall_risk_score: number
  risk_level: string
  compliance_risk_score?: number
  operational_risk_score?: number
  financial_risk_score?: number
}

// Risk scoring matrix
const PROBABILITY_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

const IMPACT_SCORES = {
  low: 1,
  medium: 2,
  high: 3,
  critical: 4,
}

export async function calculateRiskScore(probability: string, impact: string): Promise<number> {
  const probabilityValue = PROBABILITY_SCORES[probability as keyof typeof PROBABILITY_SCORES] || 1
  const impactValue = IMPACT_SCORES[impact as keyof typeof IMPACT_SCORES] || 1
  return probabilityValue * impactValue * 4 // Scale to 1-64
}

export async function createRiskRegister(
  clientId: string,
  data: Omit<RiskRegister, "id" | "risk_score">,
  userId: string,
): Promise<RiskRegister> {
  const riskScore = await calculateRiskScore(data.probability, data.impact)

  const result = await query(
    `INSERT INTO tbl_risk_registers 
    (client_id, facility_id, risk_category, risk_title, risk_description, probability, impact, risk_score, risk_status, identified_date, created_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clientId,
      data.facility_id || null,
      data.risk_category,
      data.risk_title,
      data.risk_description || null,
      data.probability,
      data.impact,
      riskScore,
      data.risk_status || "open",
      data.identified_date,
      userId,
    ],
  )

  await logAuditTrail("RISK_REGISTER_CREATED", `Created risk: ${data.risk_title}`, userId, clientId)

  return {
    ...data,
    id: (result as any).insertId || "",
    risk_score: riskScore,
  }
}

export async function getRiskRegisters(clientId: string, facilityId?: string): Promise<RiskRegister[]> {
  try {
    const params: any[] = [clientId]
    let sql = `SELECT * FROM tbl_risk_registers WHERE client_id = ?`

    if (facilityId) {
      sql += ` AND facility_id = ?`
      params.push(facilityId)
    }

    sql += ` ORDER BY risk_score DESC, identified_date DESC`

    const results = await query(sql, params)
    return Array.isArray(results) ? results : results ? [results] : []
  } catch (error) {
    console.error("[v0] getRiskRegisters error:", error)
    // Return empty array if table doesn't exist
    return []
  }
}

export async function updateRiskRegister(
  riskId: string,
  updates: Partial<RiskRegister>,
  userId: string,
): Promise<void> {
  let riskScore = updates.risk_score

  if (updates.probability && updates.impact) {
    riskScore = await calculateRiskScore(updates.probability, updates.impact)
  }

  const fields: string[] = []
  const values: any[] = []

  Object.entries(updates).forEach(([key, value]) => {
    if (key !== "id" && key !== "risk_score" && value !== undefined) {
      fields.push(`${key} = ?`)
      values.push(value)
    }
  })

  if (riskScore !== undefined) {
    fields.push(`risk_score = ?`)
    values.push(riskScore)
  }

  fields.push(`updated_by = ?`)
  values.push(userId)

  if (fields.length > 1) {
    await query(`UPDATE tbl_risk_registers SET ${fields.join(", ")} WHERE id = ?`, [...values, riskId])

    await logAuditTrail("RISK_REGISTER_UPDATED", `Updated risk: ${riskId}`, userId)
  }
}

export async function createRiskMitigation(
  riskRegisterId: string,
  data: Omit<RiskMitigation, "id">,
  userId: string,
): Promise<RiskMitigation> {
  const result = await query(
    `INSERT INTO tbl_risk_mitigations 
    (risk_register_id, mitigation_title, mitigation_description, mitigation_strategy, assigned_to, target_completion_date, mitigation_status)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      riskRegisterId,
      data.mitigation_title,
      data.mitigation_description || null,
      data.mitigation_strategy || null,
      data.assigned_to || null,
      data.target_completion_date || null,
      data.mitigation_status || "pending",
    ],
  )

  await logAuditTrail("RISK_MITIGATION_CREATED", `Created mitigation: ${data.mitigation_title}`, userId)

  return {
    ...data,
    id: (result as any).insertId || "",
  }
}

export async function getRiskMitigations(riskRegisterId: string): Promise<RiskMitigation[]> {
  const results = await query(
    `SELECT * FROM tbl_risk_mitigations WHERE risk_register_id = ? ORDER BY target_completion_date ASC`,
    [riskRegisterId],
  )
  return Array.isArray(results) ? results : [results]
}

export async function createRiskAssessment(
  clientId: string,
  data: Omit<RiskAssessment, "id">,
  userId: string,
): Promise<RiskAssessment> {
  // Calculate overall risk score from category scores
  const scores = [
    data.compliance_risk_score || 0,
    data.operational_risk_score || 0,
    data.financial_risk_score || 0,
  ].filter((s) => s > 0)

  const overallScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b) / scores.length) : 50

  const result = await query(
    `INSERT INTO tbl_risk_assessments 
    (client_id, facility_id, assessment_date, assessment_type, overall_risk_score, risk_level, 
     compliance_risk_score, operational_risk_score, financial_risk_score, assessed_by)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      clientId,
      data.facility_id || null,
      data.assessment_date,
      data.assessment_type,
      overallScore,
      overallScore >= 75 ? "critical" : overallScore >= 50 ? "high" : overallScore >= 25 ? "medium" : "low",
      data.compliance_risk_score || null,
      data.operational_risk_score || null,
      data.financial_risk_score || null,
      userId,
    ],
  )

  await logAuditTrail("RISK_ASSESSMENT_CREATED", `Risk assessment completed: ${data.assessment_type}`, userId, clientId)

  return {
    ...data,
    id: (result as any).insertId || "",
    overall_risk_score: overallScore,
  }
}

export async function getRiskAssessments(clientId: string, limit = 12): Promise<RiskAssessment[]> {
  const results = await query(
    `SELECT * FROM tbl_risk_assessments 
     WHERE client_id = ? 
     ORDER BY assessment_date DESC 
     LIMIT ?`,
    [clientId, limit],
  )
  return Array.isArray(results) ? results : [results]
}
