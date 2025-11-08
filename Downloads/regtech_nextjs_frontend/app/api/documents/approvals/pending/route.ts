import { createRLSGetHandler } from "@/lib/api-rls-handler"
import { getPendingApprovalsForUser } from "@/lib/document-approval-service"

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    console.log("[v0] Approvals pending route - userId:", context.userId, "roles:", context.roles)

    if (!context.userId) {
      throw new Error("User ID is required")
    }

    const approvals = await getPendingApprovalsForUser(context.userId)

    return {
      success: true,
      data: approvals,
      count: approvals.length,
    }
  },
  { requiredRoles: ["official_correspondent", "compliance_officer", "service_manager", "approver"] },
)
