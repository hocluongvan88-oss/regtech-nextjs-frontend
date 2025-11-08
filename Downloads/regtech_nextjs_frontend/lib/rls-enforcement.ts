/**
 * Row-Level Security (RLS) Enforcement at Database Layer
 * Ensures tenant isolation and compliance with multi-tenant security requirements
 * Implements application-level RLS with database enforcement
 */

import { query } from "./db"

/**
 * RLS Context - represents the current user's data access scope
 */
export interface RLSContext {
  clientId: string
  userId: string
  isSystemAdmin: boolean
  isServiceManager: boolean
}

/**
 * Set the RLS context for the current database session
 * All subsequent queries should respect this context
 */
export async function setRLSContext(context: RLSContext): Promise<void> {
  try {
    await query(`SET @current_client_id = ?`, [context.clientId])

    await query(`SET @current_user_id = ?`, [context.userId])

    await query(`SET @is_system_admin = ?`, [context.isSystemAdmin ? 1 : 0])

    console.log(`[v0] RLS context set for client: ${context.clientId}`)
  } catch (error) {
    console.error("[v0] Error setting RLS context:", error)
    throw new Error("Failed to set RLS context")
  }
}

/**
 * Clear the RLS context when session ends
 */
export async function clearRLSContext(): Promise<void> {
  try {
    await query(`SET @current_client_id = NULL`)
    await query(`SET @current_user_id = NULL`)
    await query(`SET @is_system_admin = 0`)
  } catch (error) {
    console.error("[v0] Error clearing RLS context:", error)
  }
}

/**
 * Check if client isolation is enforced for a query
 * This validates that the query includes client_id filter
 */
export function validateRLSQuery(sql: string, table: string): boolean {
  const requiresClientFilter = [
    "tbl_clients",
    "tbl_client_facilities",
    "tbl_products",
    "tbl_documents",
    "tbl_submissions",
    "tbl_audit_log",
    "tbl_compliance_status",
    "tbl_users",
    "tbl_renewal_schedule",
    "tbl_renewal_alerts",
  ]

  if (!requiresClientFilter.includes(table)) {
    return true // Table doesn't require RLS filter
  }

  // Check if query includes client_id or client_id filter
  const hasClientFilter = sql.includes("client_id") || sql.includes("@current_client_id")

  if (!hasClientFilter) {
    console.warn(`[v0] WARNING: Query missing RLS filter for table: ${table}`)
    console.warn(`[v0] SQL: ${sql.substring(0, 100)}...`)
  }

  return hasClientFilter
}

/**
 * Wrap a query with RLS enforcement
 * Automatically adds client_id filter to WHERE clause
 */
export function enforceRLSQuery(sql: string, clientId: string, params?: any[]): { sql: string; params: any[] } {
  // For SELECT queries, add client_id filter
  if (sql.trim().toUpperCase().startsWith("SELECT")) {
    if (!sql.includes("WHERE")) {
      return {
        sql: `${sql} WHERE client_id = ?`,
        params: [...(params || []), clientId],
      }
    } else if (!sql.includes("client_id")) {
      return {
        sql: `${sql} AND client_id = ?`,
        params: [...(params || []), clientId],
      }
    }
  }

  // For UPDATE queries, add client_id verification
  if (sql.trim().toUpperCase().startsWith("UPDATE")) {
    if (!sql.includes("client_id")) {
      return {
        sql: `${sql} AND client_id = ?`,
        params: [...(params || []), clientId],
      }
    }
  }

  // For DELETE queries, add client_id verification
  if (sql.trim().toUpperCase().startsWith("DELETE")) {
    if (!sql.includes("client_id")) {
      return {
        sql: `${sql} AND client_id = ?`,
        params: [...(params || []), clientId],
      }
    }
  }

  return { sql, params: params || [] }
}

/**
 * Get only the client's facilities with RLS applied
 */
export async function getFacilitiesWithRLS(clientId: string, filters?: Record<string, any>): Promise<any[]> {
  try {
    let sql = `SELECT * FROM tbl_client_facilities WHERE client_id = ?`
    const params: any[] = [clientId]

    if (filters?.status) {
      sql += ` AND status = ?`
      params.push(filters.status)
    }

    if (filters?.facilityType) {
      sql += ` AND facility_type = ?`
      params.push(filters.facilityType)
    }

    sql += ` ORDER BY created_at DESC`

    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching facilities with RLS:", error)
    throw error
  }
}

/**
 * Get only the client's products with RLS applied
 */
export async function getProductsWithRLS(clientId: string, filters?: Record<string, any>): Promise<any[]> {
  try {
    let sql = `SELECT * FROM tbl_products WHERE client_id = ?`
    const params: any[] = [clientId]

    if (filters?.facilityId) {
      sql += ` AND facility_id = ?`
      params.push(filters.facilityId)
    }

    if (filters?.status) {
      sql += ` AND status = ?`
      params.push(filters.status)
    }

    sql += ` ORDER BY created_at DESC`

    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching products with RLS:", error)
    throw error
  }
}

/**
 * Get only the client's documents with RLS applied
 */
export async function getDocumentsWithRLS(clientId: string, filters?: Record<string, any>): Promise<any[]> {
  try {
    let sql = `SELECT * FROM tbl_documents WHERE client_id = ?`
    const params: any[] = [clientId]

    if (filters?.submissionId) {
      sql += ` AND submission_id = ?`
      params.push(filters.submissionId)
    }

    if (filters?.documentType) {
      sql += ` AND document_type = ?`
      params.push(filters.documentType)
    }

    if (filters?.status) {
      sql += ` AND status = ?`
      params.push(filters.status)
    }

    sql += ` ORDER BY created_at DESC`

    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching documents with RLS:", error)
    throw error
  }
}

/**
 * Get only the client's audit logs with RLS applied
 */
export async function getAuditLogsWithRLS(clientId: string, filters?: Record<string, any>): Promise<any[]> {
  try {
    let sql = `SELECT * FROM tbl_audit_log WHERE client_id = ?`
    const params: any[] = [clientId]

    if (filters?.userId) {
      sql += ` AND user_id = ?`
      params.push(filters.userId)
    }

    if (filters?.action) {
      sql += ` AND action = ?`
      params.push(filters.action)
    }

    if (filters?.entityType) {
      sql += ` AND entity_type = ?`
      params.push(filters.entityType)
    }

    if (filters?.startDate) {
      sql += ` AND timestamp >= ?`
      params.push(filters.startDate)
    }

    if (filters?.endDate) {
      sql += ` AND timestamp <= ?`
      params.push(filters.endDate)
    }

    sql += ` ORDER BY timestamp DESC`

    if (filters?.limit) {
      sql += ` LIMIT ?`
      params.push(filters.limit)
    }

    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching audit logs with RLS:", error)
    throw error
  }
}

/**
 * Verify that a specific record belongs to the client (tenant isolation check)
 */
export async function verifyRecordOwnership(table: string, recordId: string, clientId: string): Promise<boolean> {
  try {
    const result = await query(`SELECT id FROM ${table} WHERE id = ? AND client_id = ? LIMIT 1`, [recordId, clientId])

    return Array.isArray(result) && result.length > 0
  } catch (error) {
    console.error("[v0] Error verifying record ownership:", error)
    return false
  }
}

/**
 * Log RLS violation attempts
 */
export async function logRLSViolation(params: {
  clientId: string
  userId: string
  attemptedClientId: string
  table: string
  recordId: string
  action: string
}): Promise<void> {
  try {
    await query(
      `INSERT INTO tbl_audit_log 
       (client_id, user_id, action, entity_type, entity_id, status, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        params.clientId,
        params.userId,
        "VIEW",
        "SECURITY_VIOLATION",
        params.recordId,
        "failure",
        `Attempted ${params.action} on ${params.table} belonging to different client: ${params.attemptedClientId}`,
      ],
    )
  } catch (error) {
    console.error("[v0] Error logging RLS violation:", error)
  }
}
