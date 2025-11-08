import { createRLSPostHandler } from "@/lib/api-rls-handler"
import { updateServiceRequestStatus, resolveServiceRequest } from "@/lib/service-request-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const { requestId } = await request.nextUrl

    if (body.action === "update_status") {
      await updateServiceRequestStatus(
        requestId,
        context.clientId,
        body.status,
        body.status_reason,
        context.userId,
        request.headers.get("user-agent") || undefined,
      )

      return {
        success: true,
        message: `Service request status updated to ${body.status}`,
      }
    }

    if (body.action === "resolve") {
      await resolveServiceRequest(
        requestId,
        context.clientId,
        body.resolution_summary,
        context.userId,
        request.headers.get("user-agent") || undefined,
      )

      return {
        success: true,
        message: "Service request resolved",
      }
    }

    return { success: false, error: "Invalid action" }
  },
  { requiredRoles: ["service_manager", "compliance_officer", "official_correspondent"] },
)
