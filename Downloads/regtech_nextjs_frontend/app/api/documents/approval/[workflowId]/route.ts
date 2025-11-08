import { createRLSGetHandler } from "@/lib/api-rls-handler"
import { getApprovalWorkflowStatus } from "@/lib/document-approval-service"

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { pathname } = new URL(request.url)
    const workflowId = pathname.split("/").pop()

    if (!workflowId) {
      return {
        success: false,
        error: "Workflow ID is required",
      }
    }

    const workflow = await getApprovalWorkflowStatus(workflowId)

    return {
      success: true,
      data: workflow,
    }
  },
  { requiredRoles: ["official_correspondent", "compliance_officer", "service_manager"] },
)
