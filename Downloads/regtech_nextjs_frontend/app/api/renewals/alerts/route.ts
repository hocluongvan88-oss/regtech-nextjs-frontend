import { createRLSGetHandler, createRLSPostHandler } from "@/lib/api-rls-handler"
import { getPendingRenewalAlerts, markAlertAsSent } from "@/lib/renewal-service"

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const alerts = await getPendingRenewalAlerts(context.clientId)

    return {
      success: true,
      data: alerts,
      count: alerts.length,
    }
  },
  { requiredRoles: ["official_correspondent", "service_manager"] },
)

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const { alertId, action } = body

    if (action === "mark_sent") {
      await markAlertAsSent(alertId)

      return {
        success: true,
        message: "Alert marked as sent",
      }
    }

    return {
      success: false,
      error: "Unknown action",
    }
  },
  { requiredRoles: ["service_manager"] },
)
