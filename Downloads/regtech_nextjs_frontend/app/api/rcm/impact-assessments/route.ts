import { createRLSPostHandler, createRLSGetHandler } from "@/lib/api-rls-handler"
import { createImpactAssessment, listImpactAssessments, approveImpactAssessment } from "@/lib/rcm-service"

export const POST = createRLSPostHandler(
  async (request, body, { context }) => {
    if (body.action === "create") {
      const assessment = await createImpactAssessment(
        context.clientId,
        {
          regulatory_intelligence_id: body.regulatory_intelligence_id,
          assessment_date: body.assessment_date,
          assessed_by: context.userId,
          labeling_impact_required: body.labeling_impact_required,
          labeling_update_hours: body.labeling_update_hours,
          quality_impact_required: body.quality_impact_required,
          qms_update_hours: body.qms_update_hours,
          manufacturing_impact_required: body.manufacturing_impact_required,
          manufacturing_change_hours: body.manufacturing_change_hours,
          training_required: body.training_required,
          training_estimated_hours: body.training_estimated_hours,
          total_estimated_hours: body.total_estimated_hours,
          estimated_cost_usd: body.estimated_cost_usd,
          implementation_risk: body.implementation_risk,
          compliance_risk_if_not_implemented: body.compliance_risk_if_not_implemented,
          status: "pending_approval",
        },
        context.userId,
        request.headers.get("user-agent") || undefined,
      )

      return {
        success: true,
        data: assessment,
        message: "Impact assessment created successfully",
      }
    }

    if (body.action === "approve") {
      await approveImpactAssessment(
        body.assessment_id,
        context.clientId,
        context.userId,
        context.userId,
        request.headers.get("user-agent") || undefined,
      )

      return {
        success: true,
        message: "Impact assessment approved",
      }
    }

    return { success: false, error: "Invalid action" }
  },
  { requiredRoles: ["compliance_officer", "official_correspondent"] },
)

export const GET = createRLSGetHandler(
  async (request, { context }) => {
    const { searchParams } = new URL(request.url)
    const intelligenceId = searchParams.get("regulatory_intelligence_id")
    const status = searchParams.get("status")

    const assessments = await listImpactAssessments(context.clientId, {
      regulatory_intelligence_id: intelligenceId || undefined,
      status: status || undefined,
    })

    return {
      success: true,
      data: assessments,
    }
  },
  { requiredRoles: ["compliance_officer", "rcm_officer"] },
)
