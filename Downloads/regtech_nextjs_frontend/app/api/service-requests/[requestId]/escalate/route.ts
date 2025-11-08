import { createRLSPostHandler } from "@/lib/api-rls-handler"
import { escalateServiceRequest } from "@/lib/service-request-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const { requestId } = await request.nextUrl

    const escalation = await escalateServiceRequest(
      requestId,
      context.clientId,
      body.escalation_reason,
      body.escalated_to_user,
      context.userId,
      body.required_resolution_date,
      context.userId,
      request.headers.get("user-agent") || undefined,
    )

    return {
      success: true,
      data: escalation,
      message: "Service request escalated successfully",
    }
  },
  { requiredRoles: ["service_manager", "compliance_officer"] },
)
