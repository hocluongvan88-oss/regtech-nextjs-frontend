import { createRLSPostHandler, createRLSGetHandler } from "@/lib/api-rls-handler"
import { createRCMActionItem, listRCMActionItems } from "@/lib/rcm-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const actionItem = await createRCMActionItem(
      context.clientId,
      {
        regulatory_intelligence_id: body.regulatory_intelligence_id,
        action_title: body.action_title,
        action_description: body.action_description,
        action_type: body.action_type,
        assigned_to: body.assigned_to,
        department: body.department,
        due_date: body.due_date,
        priority: body.priority || "medium",
        status: "pending",
        risk_if_not_completed: body.risk_if_not_completed,
        estimated_hours: body.estimated_hours,
      },
      context.userId,
      request.headers.get("user-agent") || undefined,
    )

    return {
      success: true,
      data: actionItem,
      message: "RCM action item created successfully",
    }
  },
  { requiredRoles: ["rcm_officer", "compliance_officer"] },
)

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const intelligenceId = searchParams.get("regulatory_intelligence_id")

    const items = await listRCMActionItems(context.clientId, {
      status: status || undefined,
      priority: priority || undefined,
      regulatory_intelligence_id: intelligenceId || undefined,
    })

    return {
      success: true,
      data: items,
    }
  },
  { requiredRoles: ["rcm_officer", "compliance_officer"] },
)
