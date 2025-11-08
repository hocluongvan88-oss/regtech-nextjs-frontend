import { createRLSPostHandler, createRLSGetHandler } from "@/lib/api-rls-handler"
import { createServiceRequest, listServiceRequests } from "@/lib/service-request-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const serviceRequest = await createServiceRequest(
      context.clientId,
      {
        request_type: body.request_type,
        request_category: body.request_category,
        priority: body.priority || "medium",
        title: body.title,
        description: body.description,
        regulatory_source: body.regulatory_source,
        reference_number: body.reference_number,
        assigned_to: body.assigned_to || context.userId,
        secondary_assignee: body.secondary_assignee,
        created_by: context.userId,
        received_date: body.received_date,
        required_response_date: body.required_response_date,
        estimated_completion_date: body.estimated_completion_date,
        status: "open",
      },
      context.userId,
      request.headers.get("user-agent") || undefined,
    )

    return {
      success: true,
      data: serviceRequest,
      message: "Service request created successfully",
    }
  },
  { requiredRoles: ["service_manager", "compliance_officer", "official_correspondent"] },
)

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const priority = searchParams.get("priority")
    const requestType = searchParams.get("request_type")
    const assignedTo = searchParams.get("assigned_to")

    const requests = await listServiceRequests(context.clientId, {
      status: status || undefined,
      priority: priority || undefined,
      request_type: requestType || undefined,
      assigned_to: assignedTo || undefined,
    })

    return {
      success: true,
      data: requests,
    }
  },
  { requiredRoles: ["service_manager", "compliance_officer"] },
)
