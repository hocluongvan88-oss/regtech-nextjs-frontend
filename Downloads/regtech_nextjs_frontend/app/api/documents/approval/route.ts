import { createRLSPostHandler } from "@/lib/api-rls-handler"
import { createApprovalWorkflow } from "@/lib/document-approval-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const {
      action,
      documentId,
      workflowType,
      requiredApprovers,
      stepId,
      approvalComment,
      documentContent,
      intentToSign,
      rejectionReason,
    } = body

    if (action === "create_workflow") {
      const workflow = await createApprovalWorkflow({
        clientId: context.clientId,
        documentId,
        workflowType,
        requiredApprovers,
        createdBy: context.userId,
      })

      return {
        success: true,
        data: workflow,
        message: "Approval workflow created successfully",
      }
    }

    if (action === "approve_step") {
      const { approveDocumentStep } = await import("@/lib/document-approval-service")

      const result = await approveDocumentStep({
        clientId: context.clientId,
        stepId,
        approvedBy: context.userId,
        approvalComment,
        documentContent,
        intentToSign,
      })

      return {
        success: true,
        data: result,
        message: "Document step approved with e-signature",
      }
    }

    if (action === "reject_step") {
      const { rejectDocumentStep } = await import("@/lib/document-approval-service")

      const result = await rejectDocumentStep({
        clientId: context.clientId,
        stepId,
        rejectedBy: context.userId,
        rejectionReason,
      })

      return {
        success: true,
        data: result,
      }
    }

    return {
      success: false,
      error: "Unknown action",
    }
  },
  { requiredRoles: ["official_correspondent", "compliance_officer", "service_manager"] },
)
