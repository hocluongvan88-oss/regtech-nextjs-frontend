import { type NextRequest, NextResponse } from "next/server"
import { createAuditLog } from "@/lib/audit"
import { requestUserRoleApproval, approveUserRoleRequest } from "@/lib/rbac-policy"

// Get pending user approval requests
export async function GET(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-client-id")
    const userId = request.headers.get("x-user-id")
    const userRoles = JSON.parse(request.headers.get("x-user-roles") || "[]")

    if (!clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Tenant Admin and Official Correspondent can view approvals
    const canViewApprovals = userRoles.includes("tenant_administrator") || userRoles.includes("official_correspondent")
    if (!canViewApprovals) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Get pending approval requests
    const result = await fetch("database", {
      query: `SELECT * FROM tbl_user_approval_requests WHERE client_id = ? AND status = 'pending' ORDER BY created_at DESC`,
      params: [clientId],
    })

    return NextResponse.json(result)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch approval requests" }, { status: 500 })
  }
}

// Request user role approval (Tenant Admin creates approval request)
export async function POST(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-client-id")
    const userId = request.headers.get("x-user-id")
    const userRoles = JSON.parse(request.headers.get("x-user-roles") || "[]")

    if (!clientId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Tenant Admin can request role assignments
    if (!userRoles.includes("tenant_administrator")) {
      return NextResponse.json({ error: "Only Tenant Administrator can request user roles" }, { status: 403 })
    }

    const { targetUserId, requestedRoles } = await request.json()

    const approval = await requestUserRoleApproval(clientId, targetUserId, requestedRoles, userId)

    await createAuditLog({
      clientId,
      userId,
      action: "CREATE",
      entityType: "USER_ROLE_APPROVAL_REQUEST",
      entityId: approval.id,
      newValues: { targetUserId, requestedRoles },
    })

    return NextResponse.json(approval)
  } catch (error) {
    console.error("[v0] User approval request error:", error)
    return NextResponse.json({ error: "Failed to request user role approval" }, { status: 500 })
  }
}

// Approve user role assignment
export async function PUT(request: NextRequest) {
  try {
    const clientId = request.headers.get("x-client-id")
    const userId = request.headers.get("x-user-id")
    const userRoles = JSON.parse(request.headers.get("x-user-roles") || "[]")

    if (!clientId || !userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Only Official Correspondent can approve
    if (!userRoles.includes("official_correspondent")) {
      return NextResponse.json({ error: "Only Official Correspondent can approve role assignments" }, { status: 403 })
    }

    const { approvalId, approvedRoles } = await request.json()

    await approveUserRoleRequest(clientId, approvalId, userId, approvedRoles)

    await createAuditLog({
      clientId,
      userId,
      action: "APPROVE",
      entityType: "USER_ROLE_APPROVAL_REQUEST",
      entityId: approvalId,
      newValues: { approvedRoles },
    })

    return NextResponse.json({ message: "User role approved successfully" })
  } catch (error) {
    console.error("[v0] User approval error:", error)
    return NextResponse.json({ error: "Failed to approve user role" }, { status: 500 })
  }
}
