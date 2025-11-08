import { createRLSGetHandler, createRLSPostHandler } from "@/lib/api-rls-handler"
import { listServiceRequestActivities, addServiceRequestActivity } from "@/lib/service-request-service"

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { requestId } = await request.nextUrl

    const activities = await listServiceRequestActivities(requestId, context.clientId)

    return {
      success: true,
      data: activities,
    }
  },
  { requiredRoles: ["service_manager", "compliance_officer"] },
)

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const { requestId } = await request.nextUrl

    const activity = await addServiceRequestActivity(
      requestId,
      context.clientId,
      body.activity_type || "comment",
      body.description,
      context.userId,
      body.metadata,
    )

    return {
      success: true,
      data: activity,
      message: "Activity added to service request",
    }
  },
  { requiredRoles: ["service_manager", "compliance_officer", "official_correspondent"] },
)
