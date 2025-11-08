import { createRLSPostHandler } from "@/lib/api-rls-handler"
import { initializeRenewalSchedule, createRenewalAlerts } from "@/lib/renewal-service"
import { createAuditLog } from "@/lib/audit"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const { facilityId, facilityType, lastRenewalDate } = body

    if (!facilityId || !facilityType) {
      return {
        success: false,
        error: "Missing required fields: facilityId, facilityType",
      }
    }

    const schedule = await initializeRenewalSchedule({
      clientId: context.clientId,
      facilityId,
      facilityType,
      lastRenewalDate: new Date(lastRenewalDate),
    })

    const alerts = await createRenewalAlerts({
      clientId: context.clientId,
      facilityId,
      renewalScheduleId: schedule.id,
      nextRenewalDate: schedule.nextRenewalDate,
    })

    await createAuditLog({
      clientId: context.clientId,
      userId: context.userId,
      action: "CREATE",
      entityType: "RENEWAL_SCHEDULE",
      entityId: schedule.id,
      reasonForChange: "Renewal schedule created via API",
    })

    return {
      success: true,
      data: {
        scheduleId: schedule.id,
        nextRenewalDate: schedule.nextRenewalDate,
        renewalCycle: schedule.renewalCycle,
        alertsCreated: alerts.length,
        alerts,
      },
    }
  },
  { requiredRoles: ["official_correspondent", "compliance_officer"] },
)
