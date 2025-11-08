import { createRLSPostHandler, createRLSGetHandler } from "@/lib/api-rls-handler"
import { createRegulatoryIntelligence, listRegulatoryIntelligence } from "@/lib/rcm-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    const intelligence = await createRegulatoryIntelligence(
      context.clientId,
      {
        regulatory_body: body.regulatory_body,
        change_type: body.change_type,
        title: body.title,
        description: body.description,
        source_url: body.source_url,
        regulatory_reference_id: body.regulatory_reference_id,
        content_summary: body.content_summary,
        preliminary_impact_assessment: body.preliminary_impact_assessment,
        affected_areas: body.affected_areas || [],
        risk_level: body.risk_level || "medium",
        announcement_date: body.announcement_date,
        effective_date: body.effective_date,
        comment_deadline_date: body.comment_deadline_date,
        status: "new",
        rcm_officer_id: body.rcm_officer_id,
        action_required: body.action_required || false,
        action_items_count: 0,
      },
      context.userId,
      request.headers.get("user-agent") || undefined,
    )

    return {
      success: true,
      data: intelligence,
      message: "Regulatory intelligence created successfully",
    }
  },
  { requiredRoles: ["rcm_officer", "compliance_officer", "official_correspondent"] },
)

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const riskLevel = searchParams.get("risk_level")
    const body = searchParams.get("regulatory_body")

    const items = await listRegulatoryIntelligence(context.clientId, {
      status: status || undefined,
      risk_level: riskLevel || undefined,
      regulatory_body: body || undefined,
    })

    return {
      success: true,
      data: items,
    }
  },
  { requiredRoles: ["rcm_officer", "compliance_officer", "official_correspondent"] },
)
