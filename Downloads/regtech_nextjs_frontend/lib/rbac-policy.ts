import { query } from "./db"
import { createAuditLog } from "./audit"

// Two-tier RBAC enforcement: System Provider Admin & Tenant Admin
export interface RBACContext {
  userId: string
  clientId: string
  roles: string[]
  isSystemAdmin: boolean
  isServiceManager: boolean
  isTenantAdmin: boolean
}

export async function enforceZeroAccess(
  context: RBACContext,
  targetClientId: string,
  action: string,
  entityType: string,
): Promise<boolean> {
  // System Admins need explicit OC approval to access tenant data
  if (context.isSystemAdmin || context.isServiceManager) {
    // Check if there's an explicit approval record in audit log
    const approvals = await query(
      `SELECT * FROM tbl_audit_log 
       WHERE client_id = ? 
       AND action = 'SYSTEM_ADMIN_DATA_ACCESS_APPROVED'
       AND entity_type = 'ZERO_ACCESS_APPROVAL'
       AND new_values LIKE ?
       AND timestamp > DATE_SUB(NOW(), INTERVAL 30 DAY)`,
      [targetClientId, `%"user_id":"${context.userId}"%`],
    )

    if ((approvals as any[]).length === 0) {
      // Log unauthorized access attempt
      await createAuditLog({
        clientId: targetClientId,
        userId: context.userId,
        action: "VIEW",
        entityType,
        status: "failure",
        errorMessage: "Zero Access Policy: System Admin access denied without explicit OC approval",
      })
      return false
    }
  }

  return true
}

export interface UserApprovalRequest {
  id: string
  userId: string
  requestedRoles: string[]
  requestedBy: string
  approvedBy?: string
  status: "pending" | "approved" | "rejected"
  createdAt: Date
}

export async function requestUserRoleApproval(
  clientId: string,
  userId: string,
  requestedRoles: string[],
  requestedBy: string,
): Promise<UserApprovalRequest> {
  const approvalId = require("uuid").v4()

  // Check if Compliance Specialist role is being assigned - requires OC approval
  const requiresOCApproval = requestedRoles.includes("compliance_specialist")

  await query(
    `INSERT INTO tbl_user_approval_requests 
     (id, client_id, user_id, requested_roles, requested_by, requires_oc_approval, status, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 'pending', NOW())`,
    [approvalId, clientId, userId, JSON.stringify(requestedRoles), requestedBy, requiresOCApproval],
  )

  // Audit log the request
  await createAuditLog({
    clientId,
    userId: requestedBy,
    action: "CREATE",
    entityType: "USER_APPROVAL_REQUEST",
    entityId: approvalId,
    newValues: { userId, requestedRoles, requiresOCApproval },
  })

  return {
    id: approvalId,
    userId,
    requestedRoles,
    requestedBy,
    status: "pending",
    createdAt: new Date(),
  }
}

export async function approveUserRoleRequest(
  clientId: string,
  approvalId: string,
  approvedBy: string,
  approvedRoles: string[],
): Promise<void> {
  // Verify the approver is OC or Tenant Admin
  const approver = await query(
    `SELECT ur.role_id, r.role_name FROM tbl_user_roles ur
     JOIN tbl_roles r ON ur.role_id = r.id
     WHERE ur.user_id = ?`,
    [approvedBy],
  )

  const approverRoles = (approver as any[]).map((r) => r.role_name)
  if (!approverRoles.includes("official_correspondent") && !approverRoles.includes("tenant_administrator")) {
    throw new Error("Only Official Correspondent or Tenant Administrator can approve role assignments")
  }

  // Update approval request
  await query(
    `UPDATE tbl_user_approval_requests 
     SET status = 'approved', approved_by = ?, approved_at = NOW()
     WHERE id = ?`,
    [approvedBy, approvalId],
  )

  // Get the user and assign approved roles
  const approvalRecord = (await query(`SELECT user_id, requested_roles FROM tbl_user_approval_requests WHERE id = ?`, [
    approvalId,
  ])) as any[]

  if (approvalRecord.length === 0) throw new Error("Approval request not found")

  const userId = approvalRecord[0].user_id
  const requestedRoles = JSON.parse(approvalRecord[0].requested_roles)

  // Assign only approved roles
  for (const roleId of approvedRoles) {
    await query(`INSERT IGNORE INTO tbl_user_roles (user_id, role_id, assigned_by) VALUES (?, ?, ?)`, [
      userId,
      roleId,
      approvedBy,
    ])
  }

  // Audit log the approval
  await createAuditLog({
    clientId,
    userId: approvedBy,
    action: "APPROVE",
    entityType: "USER_APPROVAL_REQUEST",
    entityId: approvalId,
    newValues: { userId, approvedRoles, approvedBy },
  })
}

export async function checkSeparationOfDuties(clientId: string, userId: string, newRole: string): Promise<boolean> {
  // Admin cannot also be OC (cannot submit and approve own submissions)
  if (newRole === "admin") {
    const existingRoles = await query(
      `SELECT r.role_name FROM tbl_user_roles ur
       JOIN tbl_roles r ON ur.role_id = r.id
       WHERE ur.user_id = ?`,
      [userId],
    )

    const roleNames = (existingRoles as any[]).map((r) => r.role_name)
    if (roleNames.includes("official_correspondent")) {
      throw new Error("SoD Violation: Admin cannot also be Official Correspondent")
    }
  }

  return true
}
