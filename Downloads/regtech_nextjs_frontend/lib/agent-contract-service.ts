import { getDb } from "./mysql"
import { logAuditAction } from "./audit"

export type ServiceContract = {
  id: string
  client_id: string
  facility_id?: string
  contract_type: "US_AGENT_REP" | "QMS_SUPPORT" | "COMPLIANCE_SERVICES"
  contract_start_date: string
  contract_end_date: string
  contract_duration_months: number
  contract_status: "active" | "pending_renewal" | "expired" | "cancelled" | "suspended"
  billing_status: "paid" | "due" | "overdue" | "failed" | "cancelled"
  agent_user_id?: string
  assigned_by?: string
  assigned_date: string
  contract_notes?: string
  created_at: string
  updated_at: string
}

export type AgentConsentTracking = {
  id: string
  service_contract_id: string
  client_id: string
  facility_id?: string
  agent_user_id: string
  consent_status: "pending" | "acknowledged" | "declined" | "timeout"
  acknowledgment_deadline_date: string
  acknowledged_date?: string
  acknowledgment_overdue: boolean
  created_at: string
}

// ============================================
// CORE CONTRACT MANAGEMENT FUNCTIONS
// ============================================

/**
 * Creates a new multi-year U.S. Agent service contract
 * Separates contractual terms from annual regulatory obligations
 */
export async function createServiceContract(
  clientId: string,
  contractData: {
    facility_id?: string
    contract_type: "US_AGENT_REP" | "QMS_SUPPORT" | "COMPLIANCE_SERVICES"
    contract_start_date: string // YYYY-MM-DD
    contract_end_date: string // YYYY-MM-DD
    contract_duration_months: number
    billing_status?: "paid" | "due" | "overdue"
    agent_user_id?: string
    assigned_by?: string
    contract_notes?: string
  },
  userId: string,
  userAgent?: string,
): Promise<ServiceContract> {
  const db = await getDb()

  try {
    const contractId = require("crypto").randomUUID()

    const query = `
      INSERT INTO tbl_service_contracts (
        id, client_id, facility_id, contract_type, 
        contract_start_date, contract_end_date, contract_duration_months,
        contract_status, billing_status, agent_user_id, assigned_by,
        contract_notes, created_at, updated_at
      ) VALUES (
        ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW()
      )
    `

    await db.execute(query, [
      contractId,
      clientId,
      contractData.facility_id || null,
      contractData.contract_type,
      contractData.contract_start_date,
      contractData.contract_end_date,
      contractData.contract_duration_months,
      "active",
      contractData.billing_status || "paid",
      contractData.agent_user_id || null,
      contractData.assigned_by || userId,
      contractData.contract_notes || null,
    ])

    await logAuditAction({
      clientId,
      userId,
      action: "CREATE",
      entityType: "service_contract",
      entityId: contractId,
      newValues: { ...contractData, id: contractId },
      userAgent,
    })

    await updateClientServiceStatus(clientId)

    return getServiceContract(contractId, clientId)
  } catch (error) {
    console.error("Error creating service contract:", error)
    throw error
  }
}

/**
 * Retrieves a specific service contract using RLS view
 * Changed from tbl_service_contracts to v_service_contracts_rls
 */
export async function getServiceContract(contractId: string, clientId: string): Promise<ServiceContract> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_service_contracts
    WHERE id = ? AND client_id = ?
  `

  const [rows] = await db.execute(query, [contractId, clientId])

  if (!rows || rows.length === 0) {
    throw new Error("Contract not found")
  }

  return rows[0]
}

/**
 * Lists all service contracts for a client using RLS view
 * Changed from tbl_service_contracts to v_service_contracts_rls
 */
export async function listServiceContracts(
  clientId: string,
  filters?: {
    status?: string
    contract_type?: string
    billing_status?: string
  },
): Promise<ServiceContract[]> {
  const db = await getDb()

  let query = "SELECT * FROM tbl_service_contracts WHERE client_id = ?"
  const params: any[] = [clientId]

  if (filters?.status) {
    query += " AND contract_status = ?"
    params.push(filters.status)
  }

  if (filters?.contract_type) {
    query += " AND contract_type = ?"
    params.push(filters.contract_type)
  }

  if (filters?.billing_status) {
    query += " AND billing_status = ?"
    params.push(filters.billing_status)
  }

  query += " ORDER BY contract_end_date DESC"

  const [rows] = await db.execute(query, params)
  return rows as ServiceContract[]
}

/**
 * Checks if client has an active U.S. Agent contract using RLS view
 * Changed from tbl_service_contracts to v_service_contracts_rls
 */
export async function hasActiveUSAgentContract(clientId: string): Promise<boolean> {
  const db = await getDb()

  const query = `
    SELECT COUNT(*) as count FROM tbl_service_contracts
    WHERE client_id = ? 
      AND contract_status = 'active'
      AND contract_type = 'US_AGENT_REP'
      AND contract_end_date >= CURDATE()
  `

  const [rows] = await db.execute(query, [clientId])
  return rows[0].count > 0
}

/**
 * Gets all active contracts for a client using RLS view
 * Changed from tbl_service_contracts to v_service_contracts_rls
 */
export async function getActiveUSAgentContracts(clientId: string): Promise<ServiceContract[]> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_service_contracts
    WHERE client_id = ?
      AND contract_status = 'active'
      AND contract_type = 'US_AGENT_REP'
      AND contract_end_date >= CURDATE()
    ORDER BY contract_start_date DESC
  `

  const [rows] = await db.execute(query, [clientId])
  return rows as ServiceContract[]
}

/**
 * Marks contract for renewal using RLS view
 * Changed from tbl_service_contracts to v_service_contracts_rls
 */
export async function markContractForRenewal(
  contractId: string,
  clientId: string,
  userId: string,
  userAgent?: string,
): Promise<void> {
  const db = await getDb()

  const query = `
    UPDATE tbl_service_contracts
    SET contract_status = 'pending_renewal',
        renewal_reminder_sent = TRUE,
        renewal_reminder_sent_date = NOW(),
        updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await db.execute(query, [contractId, clientId])

  await logAuditAction({
    clientId,
    userId,
    action: "UPDATE",
    entityType: "service_contract",
    entityId: contractId,
    newValues: { contract_status: "pending_renewal" },
    userAgent,
  })
}

/**
 * Expires a contract when end_date is reached
 */
export async function expireServiceContract(contractId: string, clientId: string): Promise<void> {
  const db = await getDb()

  const query = `
    UPDATE tbl_service_contracts
    SET contract_status = 'expired', updated_at = NOW()
    WHERE id = ? AND client_id = ? AND contract_end_date < CURDATE()
  `

  await db.execute(query, [contractId, clientId])

  await updateClientServiceStatus(clientId)
}

// ============================================
// AGENT CONSENT TRACKING
// ============================================

/**
 * Creates an agent consent tracking record
 * Initiates 10 business day acknowledgment deadline for FDA notification
 */
export async function createAgentConsentTracking(
  serviceContractId: string,
  clientId: string,
  facilityId: string | undefined,
  agentUserId: string,
  agentEmail: string,
  requestedBy: string,
  userAgent?: string,
): Promise<AgentConsentTracking> {
  const db = await getDb()

  try {
    const consentId = require("crypto").randomUUID()

    const deadlineDate = calculateBusinessDays(new Date(), 10)

    const query = `
      INSERT INTO tbl_agent_consent_tracking (
        id, service_contract_id, client_id, facility_id, agent_user_id,
        agent_email, consent_requested_by, acknowledgment_deadline_date,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `

    await db.execute(query, [
      consentId,
      serviceContractId,
      clientId,
      facilityId || null,
      agentUserId,
      agentEmail,
      requestedBy,
      deadlineDate.toISOString().split("T")[0],
    ])

    await logAuditAction({
      clientId,
      userId: requestedBy,
      action: "CREATE",
      entityType: "agent_consent_tracking",
      entityId: consentId,
      newValues: { agentEmail, deadline: deadlineDate },
      userAgent,
    })

    return getAgentConsentTracking(consentId, clientId)
  } catch (error) {
    console.error("Error creating agent consent tracking:", error)
    throw error
  }
}

/**
 * Marks agent consent as acknowledged
 */
export async function acknowledgeAgentConsent(
  consentId: string,
  clientId: string,
  agentUserId: string,
  userAgent?: string,
): Promise<void> {
  const db = await getDb()

  const query = `
    UPDATE tbl_agent_consent_tracking
    SET consent_status = 'acknowledged',
        acknowledged_date = NOW(),
        updated_at = NOW()
    WHERE id = ? AND client_id = ? AND agent_user_id = ?
  `

  await db.execute(query, [consentId, clientId, agentUserId])

  await logAuditAction({
    clientId,
    userId: agentUserId,
    action: "UPDATE",
    entityType: "agent_consent_tracking",
    entityId: consentId,
    newValues: { consent_status: "acknowledged" },
    userAgent,
  })
}

/**
 * Retrieves pending agent consents nearing deadline using RLS view
 * Changed from tbl_agent_consent_tracking to v_agent_consent_tracking_rls
 */
export async function getPendingConsentTrackings(
  clientId?: string,
  daysUntilDeadline = 3,
): Promise<AgentConsentTracking[]> {
  const db = await getDb()

  let query = `
    SELECT * FROM tbl_agent_consent_tracking
    WHERE consent_status = 'pending'
      AND acknowledgment_deadline_date <= DATE_ADD(CURDATE(), INTERVAL ? DAY)
      AND acknowledgment_deadline_date >= CURDATE()
  `

  const params: any[] = [daysUntilDeadline]

  if (clientId) {
    query += " AND client_id = ?"
    params.push(clientId)
  }

  query += " ORDER BY acknowledgment_deadline_date ASC"

  const [rows] = await db.execute(query, params)
  return rows as AgentConsentTracking[]
}

/**
 * Gets overdue consents (not acknowledged by deadline) using RLS view
 * Changed from tbl_agent_consent_tracking to v_agent_consent_tracking_rls
 */
export async function getOverdueConsentTrackings(): Promise<AgentConsentTracking[]> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_agent_consent_tracking
    WHERE consent_status = 'pending'
      AND acknowledgment_deadline_date < CURDATE()
  `

  const [rows] = await db.execute(query)
  return rows as AgentConsentTracking[]
}

/**
 * Gets a specific consent tracking record using RLS view
 * Changed from tbl_agent_consent_tracking to v_agent_consent_tracking_rls
 */
export async function getAgentConsentTracking(consentId: string, clientId: string): Promise<AgentConsentTracking> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_agent_consent_tracking
    WHERE id = ? AND client_id = ?
  `

  const [rows] = await db.execute(query, [consentId, clientId])

  if (!rows || rows.length === 0) {
    throw new Error("Consent tracking not found")
  }

  return rows[0]
}

// ============================================
// CLIENT SERVICE STATUS MANAGEMENT
// ============================================

/**
 * Updates client service status based on active contracts
 * Determines if services should be blocked due to no active contract
 */
export async function updateClientServiceStatus(clientId: string): Promise<void> {
  const db = await getDb()

  try {
    const hasActive = await hasActiveUSAgentContract(clientId)

    const query = `
      SELECT MAX(contract_end_date) as last_end_date
      FROM tbl_service_contracts
      WHERE client_id = ? AND contract_type = 'US_AGENT_REP'
    `

    const [rows] = await db.execute(query, [clientId])
    const lastEndDate = rows[0]?.last_end_date

    const updateQuery = `
      INSERT INTO tbl_client_service_status (
        id, client_id, has_active_us_agent_contract, 
        last_active_contract_end_date, services_suspended,
        suspension_reason, compliance_status, last_checked
      ) VALUES (UUID(), ?, ?, ?, ?, ?, ?, NOW())
      ON DUPLICATE KEY UPDATE
        has_active_us_agent_contract = VALUES(has_active_us_agent_contract),
        last_active_contract_end_date = VALUES(last_active_contract_end_date),
        services_suspended = IF(VALUES(has_active_us_agent_contract) = FALSE, TRUE, FALSE),
        suspension_reason = IF(VALUES(has_active_us_agent_contract) = FALSE, 'No active U.S. Agent contract', NULL),
        compliance_status = IF(VALUES(has_active_us_agent_contract) = FALSE, 'non_compliant', 'compliant'),
        last_checked = NOW()
    `

    await db.execute(updateQuery, [
      clientId,
      hasActive ? 1 : 0,
      lastEndDate || null,
      hasActive ? 0 : 1,
      hasActive ? null : "No active U.S. Agent contract",
      hasActive ? "compliant" : "non_compliant",
    ])
  } catch (error) {
    console.error("Error updating client service status:", error)
    throw error
  }
}

/**
 * Checks if client is allowed to perform regulated operations using RLS view
 * Changed from tbl_client_service_status to v_client_service_status_rls
 */
export async function canClientPerformOperations(clientId: string): Promise<{
  allowed: boolean
  reason?: string
  lastContractEnd?: string
}> {
  const db = await getDb()

  const query = `
    SELECT has_active_us_agent_contract, services_suspended, 
           suspension_reason, last_active_contract_end_date
    FROM tbl_client_service_status
    WHERE client_id = ?
  `

  const [rows] = await db.execute(query, [clientId])

  if (!rows.length) {
    return { allowed: false, reason: "Client service status not found" }
  }

  const status = rows[0]

  if (status.services_suspended) {
    return {
      allowed: false,
      reason: status.suspension_reason || "Services suspended",
      lastContractEnd: status.last_active_contract_end_date,
    }
  }

  return { allowed: true }
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Calculates business days (excluding weekends)
 */
function calculateBusinessDays(startDate: Date, businessDays: number): Date {
  const date = new Date(startDate)
  let count = 0

  while (count < businessDays) {
    date.setDate(date.getDate() + 1)
    if (date.getDay() !== 0 && date.getDay() !== 6) {
      count++
    }
  }

  return date
}

/**
 * Gets contracts expiring in N days using RLS view
 * Changed from tbl_service_contracts to v_contracts_expired_rls
 */
export async function getContractsExpiringIn(days: number, contractType?: string): Promise<ServiceContract[]> {
  const db = await getDb()

  let query = `
    SELECT * FROM tbl_service_contracts
    WHERE contract_status = 'active'
      AND contract_end_date = DATE_ADD(CURDATE(), INTERVAL ? DAY)
  `

  const params: any[] = [days]

  if (contractType) {
    query += " AND contract_type = ?"
    params.push(contractType)
  }

  const [rows] = await db.execute(query, params)
  return rows as ServiceContract[]
}
