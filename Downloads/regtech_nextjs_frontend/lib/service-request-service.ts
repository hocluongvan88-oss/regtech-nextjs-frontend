import { getDb } from "./mysql"
import { logAuditAction } from "./audit"

export type ServiceRequest = {
  id: string
  client_id: string
  request_type: string
  request_category?: string
  priority: "low" | "medium" | "high" | "critical" | "urgent"
  title: string
  description?: string
  regulatory_source?: string
  reference_number?: string
  assigned_to: string
  secondary_assignee?: string
  created_by: string
  received_date?: string
  required_response_date?: string
  estimated_completion_date?: string
  status: "open" | "in_progress" | "pending_info" | "escalated" | "on_hold" | "resolved" | "closed" | "cancelled"
  status_reason?: string
  attachment_count: number
  resolution_summary?: string
  resolved_date?: string
  resolved_by?: string
  created_at: string
  updated_at: string
}

export type ServiceRequestActivity = {
  id: string
  service_request_id: string
  client_id: string
  activity_type: string
  title?: string
  description?: string
  created_by: string
  metadata?: any
  created_at: string
}

export type ServiceRequestEscalation = {
  id: string
  service_request_id: string
  client_id: string
  escalation_reason: string
  escalated_from_user?: string
  escalated_to_user: string
  escalation_date: string
  required_resolution_date?: string
  status: "pending" | "acknowledged" | "resolved" | "cancelled"
  resolution_notes?: string
  created_at: string
  updated_at: string
}

// ============================================
// SERVICE REQUEST MANAGEMENT
// ============================================

export async function createServiceRequest(
  clientId: string,
  data: Omit<ServiceRequest, "id" | "created_at" | "updated_at" | "attachment_count">,
  userId: string,
  userAgent?: string,
): Promise<ServiceRequest> {
  const db = await getDb()
  const id = require("crypto").randomUUID()

  const query = `
    INSERT INTO tbl_service_requests (
      id, client_id, request_type, request_category, priority,
      title, description, regulatory_source, reference_number,
      assigned_to, secondary_assignee, created_by,
      received_date, required_response_date, estimated_completion_date,
      status, status_reason
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  await db.execute(query, [
    id,
    clientId,
    data.request_type,
    data.request_category || null,
    data.priority,
    data.title,
    data.description || null,
    data.regulatory_source || null,
    data.reference_number || null,
    data.assigned_to,
    data.secondary_assignee || null,
    userId,
    data.received_date || null,
    data.required_response_date || null,
    data.estimated_completion_date || null,
    data.status,
    data.status_reason || null,
  ])

  // Create SLA record
  const slaQuery = `
    INSERT INTO tbl_service_request_sla (
      id, service_request_id, client_id,
      response_time_hours, resolution_time_hours
    ) VALUES (?, ?, ?, ?, ?)
  `

  const slaId = require("crypto").randomUUID()
  const responseHours = data.priority === "critical" ? 4 : data.priority === "high" ? 24 : 72
  const resolutionHours = data.priority === "critical" ? 24 : data.priority === "high" ? 72 : 168

  await db.execute(slaQuery, [slaId, id, clientId, responseHours, resolutionHours])

  await logAuditAction({
    clientId,
    userId,
    action: "CREATE",
    entityType: "service_request",
    entityId: id,
    newValues: { ...data, id },
    userAgent,
  })

  return getServiceRequest(id, clientId)
}

export async function getServiceRequest(id: string, clientId: string): Promise<ServiceRequest> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_service_requests
    WHERE id = ? AND client_id = ?
  `

  const [rows] = await db.execute(query, [id, clientId])
  if (!rows.length) throw new Error("Service request not found")

  return rows[0]
}

export async function listServiceRequests(
  clientId: string,
  filters?: {
    status?: string
    priority?: string
    request_type?: string
    assigned_to?: string
  },
): Promise<ServiceRequest[]> {
  const db = await getDb()

  let query = "SELECT * FROM tbl_service_requests WHERE client_id = ?"
  const params: any[] = [clientId]

  if (filters?.status) {
    query += " AND status = ?"
    params.push(filters.status)
  }

  if (filters?.priority) {
    query += " AND priority = ?"
    params.push(filters.priority)
  }

  if (filters?.request_type) {
    query += " AND request_type = ?"
    params.push(filters.request_type)
  }

  if (filters?.assigned_to) {
    query += " AND assigned_to = ?"
    params.push(filters.assigned_to)
  }

  query += " ORDER BY priority DESC, required_response_date ASC"

  const [rows] = await db.execute(query, params)
  return rows
}

export async function updateServiceRequestStatus(
  id: string,
  clientId: string,
  status: string,
  statusReason?: string,
  userId?: string,
  userAgent?: string,
): Promise<void> {
  const db = await getDb()

  const query = `
    UPDATE tbl_service_requests
    SET status = ?, status_reason = ?, updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await db.execute(query, [status, statusReason || null, id, clientId])

  if (userId) {
    await logAuditAction({
      clientId,
      userId,
      action: "UPDATE",
      entityType: "service_request",
      entityId: id,
      newValues: { status, status_reason: statusReason },
      userAgent,
    })

    // Create activity log
    await addServiceRequestActivity(id, clientId, "status_change", `Status changed to ${status}`, userId)
  }
}

export async function resolveServiceRequest(
  id: string,
  clientId: string,
  resolutionSummary: string,
  resolvedBy: string,
  userAgent?: string,
): Promise<void> {
  const db = await getDb()

  const query = `
    UPDATE tbl_service_requests
    SET status = 'resolved',
        resolution_summary = ?,
        resolved_date = NOW(),
        resolved_by = ?,
        updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await db.execute(query, [resolutionSummary, resolvedBy, id, clientId])

  await logAuditAction({
    clientId,
    userId: resolvedBy,
    action: "RESOLVE",
    entityType: "service_request",
    entityId: id,
    newValues: { status: "resolved", resolution_summary: resolutionSummary },
    userAgent,
  })
}

// ============================================
// SERVICE REQUEST ACTIVITIES
// ============================================

export async function addServiceRequestActivity(
  serviceRequestId: string,
  clientId: string,
  activityType: string,
  description: string,
  createdBy: string,
  metadata?: any,
): Promise<ServiceRequestActivity> {
  const db = await getDb()
  const id = require("crypto").randomUUID()

  const query = `
    INSERT INTO tbl_service_request_activities (
      id, service_request_id, client_id,
      activity_type, description, created_by, metadata
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `

  await db.execute(query, [
    id,
    serviceRequestId,
    clientId,
    activityType,
    description,
    createdBy,
    metadata ? JSON.stringify(metadata) : null,
  ])

  return {
    id,
    service_request_id: serviceRequestId,
    client_id: clientId,
    activity_type: activityType,
    description,
    created_by: createdBy,
    metadata,
    created_at: new Date().toISOString(),
  }
}

export async function listServiceRequestActivities(
  serviceRequestId: string,
  clientId: string,
): Promise<ServiceRequestActivity[]> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_service_request_activities
    WHERE service_request_id = ? AND client_id = ?
    ORDER BY created_at DESC
  `

  const [rows] = await db.execute(query, [serviceRequestId, clientId])
  return rows.map((row: any) => ({
    ...row,
    metadata: row.metadata ? JSON.parse(row.metadata) : null,
  }))
}

// ============================================
// SERVICE REQUEST ESCALATIONS
// ============================================

export async function escalateServiceRequest(
  serviceRequestId: string,
  clientId: string,
  escalationReason: string,
  escalatedToUser: string,
  escalatedFromUser?: string,
  requiredResolutionDate?: string,
  userId?: string,
  userAgent?: string,
): Promise<ServiceRequestEscalation> {
  const db = await getDb()
  const id = require("crypto").randomUUID()

  const query = `
    INSERT INTO tbl_service_request_escalations (
      id, service_request_id, client_id,
      escalation_reason, escalated_from_user, escalated_to_user,
      required_resolution_date, status
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `

  await db.execute(query, [
    id,
    serviceRequestId,
    clientId,
    escalationReason,
    escalatedFromUser || null,
    escalatedToUser,
    requiredResolutionDate || null,
    "pending",
  ])

  if (userId) {
    await updateServiceRequestStatus(
      serviceRequestId,
      clientId,
      "escalated",
      "Escalated to management",
      userId,
      userAgent,
    )
  }

  return getServiceRequestEscalation(id, clientId)
}

export async function getServiceRequestEscalation(id: string, clientId: string): Promise<ServiceRequestEscalation> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_service_request_escalations
    WHERE id = ? AND client_id = ?
  `

  const [rows] = await db.execute(query, [id, clientId])
  if (!rows.length) throw new Error("Service request escalation not found")

  return rows[0]
}

export async function listPendingEscalations(clientId: string): Promise<ServiceRequestEscalation[]> {
  const db = await getDb()

  const query = `
    SELECT * FROM tbl_service_request_escalations
    WHERE client_id = ? AND status = 'pending'
    ORDER BY escalation_date DESC
  `

  const [rows] = await db.execute(query, [clientId])
  return rows
}

export async function resolveEscalation(
  escalationId: string,
  clientId: string,
  resolutionNotes: string,
  userId?: string,
  userAgent?: string,
): Promise<void> {
  const db = await getDb()

  const query = `
    UPDATE tbl_service_request_escalations
    SET status = 'resolved',
        resolved_date = NOW(),
        resolution_notes = ?,
        updated_at = NOW()
    WHERE id = ? AND client_id = ?
  `

  await db.execute(query, [resolutionNotes, escalationId, clientId])

  if (userId) {
    await logAuditAction({
      clientId,
      userId,
      action: "RESOLVE",
      entityType: "service_request_escalation",
      entityId: escalationId,
      newValues: { status: "resolved" },
      userAgent,
    })
  }
}
