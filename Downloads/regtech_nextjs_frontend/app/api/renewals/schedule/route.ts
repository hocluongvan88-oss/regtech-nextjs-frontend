import { createRLSGetHandler } from "@/lib/api-rls-handler"
import { getUpcomingRenewals, getOverdueRenewals } from "@/lib/renewal-service"

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get("filter") || "upcoming" // upcoming, overdue, all

    let renewals = []

    if (filter === "upcoming") {
      renewals = await getUpcomingRenewals(context.clientId, 90)
    } else if (filter === "overdue") {
      renewals = await getOverdueRenewals(context.clientId)
    } else {
      // Get both
      const upcoming = await getUpcomingRenewals(context.clientId, 90)
      const overdue = await getOverdueRenewals(context.clientId)
      renewals = [...overdue, ...upcoming]
    }

    return {
      success: true,
      data: renewals,
      count: renewals.length,
    }
  },
  { requiredRoles: ["official_correspondent", "compliance_officer", "compliance_specialist"] },
)
