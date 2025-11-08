import { createRLSGetHandler } from "@/lib/api-rls-handler"
import { listPendingEscalations } from "@/lib/service-request-service"

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const escalations = await listPendingEscalations(context.clientId)

    return {
      success: true,
      data: escalations,
    }
  },
  { requiredRoles: ["service_manager", "compliance_officer", "official_correspondent"] },
)
