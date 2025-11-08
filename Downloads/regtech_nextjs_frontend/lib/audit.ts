import { query } from "./db"
import { encryptField, decryptField } from "./encryption"

export interface AuditLogPayload {
  clientId: string
  userId?: string
  action: "CREATE" | "UPDATE" | "DELETE" | "VIEW" | "SUBMIT" | "APPROVE" | "REJECT"
  entityType: string
  entityId?: string
  oldValues?: Record<string, any>
  newValues?: Record<string, any>
  reasonForChange?: string // Add reason for change field (21 CFR Part 11)
  ipAddress?: string
  userAgent?: string
  status?: "success" | "failure"
  errorMessage?: string
}

export async function createAuditLog(payload: AuditLogPayload): Promise<any> {
  try {
    const encryptedOldValues = payload.oldValues ? encryptField(JSON.stringify(payload.oldValues)) : null
    const encryptedNewValues = payload.newValues ? encryptField(JSON.stringify(payload.newValues)) : null

    const result = await query(
      `INSERT INTO tbl_audit_log 
       (client_id, user_id, action, entity_type, entity_id, old_values, new_values, 
        reason_for_change, ip_address, user_agent, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        payload.clientId,
        payload.userId || null,
        payload.action,
        payload.entityType,
        payload.entityId || null,
        encryptedOldValues,
        encryptedNewValues,
        payload.reasonForChange || null,
        payload.ipAddress || null,
        payload.userAgent || null,
        payload.status || "success",
        payload.errorMessage || null,
      ],
    )

    return result
  } catch (error) {
    console.error("[v0] Error creating audit log:", error)
    throw error
  }
}

export async function logAuditAction(
  payload: AuditLogPayload & {
    userAgent?: string
  },
): Promise<any> {
  return createAuditLog(payload)
}

export async function logAuditTrail(
  action: string,
  description: string,
  userId: string,
  clientId?: string,
  entityId?: string,
  oldValues?: Record<string, any>,
  newValues?: Record<string, any>,
): Promise<any> {
  return createAuditLog({
    clientId: clientId || "",
    userId,
    action: action as any,
    entityType: description,
    entityId,
    oldValues,
    newValues,
    status: "success",
  })
}

export async function getAuditLogs(
  clientId: string,
  filters?: {
    userId?: string
    action?: string
    entityType?: string
    startDate?: Date
    endDate?: Date
    limit?: number
    offset?: number
  },
): Promise<any[]> {
  try {
    let query_str = "SELECT * FROM tbl_audit_log WHERE client_id = ?"
    const params: any[] = [clientId]

    if (filters?.userId) {
      query_str += ` AND user_id = ?`
      params.push(filters.userId)
    }

    if (filters?.action) {
      query_str += ` AND action = ?`
      params.push(filters.action)
    }

    if (filters?.entityType) {
      query_str += ` AND entity_type = ?`
      params.push(filters.entityType)
    }

    if (filters?.startDate) {
      query_str += ` AND timestamp >= ?`
      params.push(filters.startDate)
    }

    if (filters?.endDate) {
      query_str += ` AND timestamp <= ?`
      params.push(filters.endDate)
    }

    query_str += " ORDER BY timestamp DESC"

    if (filters?.limit) {
      query_str += ` LIMIT ?`
      params.push(filters.limit)
    }

    if (filters?.offset) {
      query_str += ` OFFSET ?`
      params.push(filters.offset)
    }

    return (await query(query_str, params)) as any[]
  } catch (error) {
    console.error("[v0] Error fetching audit logs:", error)
    throw error
  }
}

export async function getAuditLogStats(clientId: string, days = 30): Promise<any> {
  try {
    const result = await query(
      `SELECT 
        COUNT(*) as total_logs,
        SUM(CASE WHEN status = 'success' THEN 1 ELSE 0 END) as successful_actions,
        SUM(CASE WHEN status = 'failure' THEN 1 ELSE 0 END) as failed_actions,
        COUNT(DISTINCT user_id) as unique_users,
        COUNT(DISTINCT entity_type) as entity_types_affected
       FROM tbl_audit_log
       WHERE client_id = ? 
       AND timestamp >= DATE_SUB(NOW(), INTERVAL ? DAY)`,
      [clientId, days],
    )

    return (result as any[])[0] || {}
  } catch (error) {
    console.error("[v0] Error fetching audit stats:", error)
    throw error
  }
}

export async function getAuditLogsByEntity(clientId: string, entityType: string, entityId: string): Promise<any[]> {
  try {
    const logs = await query(
      `SELECT * FROM tbl_audit_log 
       WHERE client_id = ? AND entity_type = ? AND entity_id = ?
       ORDER BY timestamp DESC
       LIMIT 100`,
      [clientId, entityType, entityId],
    )

    return (logs as any[]).map((log) => ({
      ...log,
      old_values: log.old_values ? decryptField(log.old_values) : null,
      new_values: log.new_values ? decryptField(log.new_values) : null,
    }))
  } catch (error) {
    console.error("[v0] Error fetching entity audit logs:", error)
    throw error
  }
}

export async function generateAuditReport(clientId: string, startDate: Date, endDate: Date): Promise<any> {
  try {
    const logs = await query(
      `SELECT * FROM tbl_audit_log 
       WHERE client_id = ? 
       AND timestamp >= ? 
       AND timestamp <= ?
       ORDER BY timestamp`,
      [clientId, startDate, endDate],
    )

    const summary = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total_records: (logs as any[]).length,
      by_action: {} as Record<string, number>,
      by_entity: {} as Record<string, number>,
      by_status: {} as Record<string, number>,
    }

    for (const log of logs as any[]) {
      summary.by_action[log.action] = (summary.by_action[log.action] || 0) + 1
      summary.by_entity[log.entity_type] = (summary.by_entity[log.entity_type] || 0) + 1
      summary.by_status[log.status] = (summary.by_status[log.status] || 0) + 1
    }

    return {
      summary,
      logs,
    }
  } catch (error) {
    console.error("[v0] Error generating audit report:", error)
    throw error
  }
}

export async function logUnauthorizedAccess(params: {
  userId: string
  clientId: string
  attemptedResource: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await createAuditLog({
      clientId: params.clientId,
      userId: params.userId,
      action: "VIEW",
      entityType: "SECURITY_VIOLATION",
      entityId: params.attemptedResource,
      status: "failure",
      errorMessage: "Unauthorized access attempt - Multi-tenant isolation violation",
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  } catch (error) {
    console.error("[v0] Unauthorized access logging error:", error)
  }
}

export async function logSystemAdminAccess(params: {
  userId: string
  clientId: string
  targetClientId: string
  action: string
  entityType: string
  entityId?: string
  ipAddress?: string
  userAgent?: string
}) {
  try {
    await createAuditLog({
      clientId: params.targetClientId,
      userId: params.userId,
      action: params.action as any,
      entityType: params.entityType,
      entityId: params.entityId,
      newValues: {
        system_admin_access: true,
        admin_client_id: params.clientId,
        note: "System Administrator accessed tenant data",
      },
      ipAddress: params.ipAddress,
      userAgent: params.userAgent,
    })
  } catch (error) {
    console.error("[v0] System admin access logging error:", error)
  }
}
