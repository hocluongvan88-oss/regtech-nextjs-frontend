import { type NextRequest, NextResponse } from "next/server"
import { withRLSEnforcement } from "@/lib/api-rls-handler"
import { acknowledgeAgentConsent } from "@/lib/agent-contract-service"

export async function PUT(request: NextRequest, { params }: { params: { consentId: string } }) {
  return withRLSEnforcement(async (req, context) => {
    try {
      const body = await req.json()

      await acknowledgeAgentConsent(
        params.consentId,
        context.clientId,
        body.agent_user_id || context.userId,
        req.headers.get("user-agent") || undefined,
      )

      return NextResponse.json({
        data: { message: "Agent consent acknowledged successfully" },
      })
    } catch (error) {
      console.error("Error acknowledging consent:", error)
      return NextResponse.json({ error: "Failed to acknowledge consent" }, { status: 500 })
    }
  })(request)
}

export async function POST(request: NextRequest, { params }: { params: { consentId: string } }) {
  return withRLSEnforcement(async (req, context) => {
    try {
      const body = await req.json()
      const db = await import("@/lib/mysql").then((m) => m.getDb())

      // Update consent to escalated status
      const query = `
        UPDATE tbl_agent_consent_tracking
        SET consent_status = 'escalated',
            response_message = ?,
            updated_at = NOW()
        WHERE id = ? AND client_id = ?
      `

      await db.execute(query, [
        body.escalation_reason || "Escalated by compliance team",
        params.consentId,
        context.clientId,
      ])

      // Log audit action
      const { logAuditAction } = await import("@/lib/audit")
      await logAuditAction({
        clientId: context.clientId,
        userId: context.userId,
        action: "UPDATE",
        entityType: "agent_consent_tracking",
        entityId: params.consentId,
        newValues: { consent_status: "escalated", escalation_reason: body.escalation_reason },
        userAgent: req.headers.get("user-agent") || undefined,
      })

      return NextResponse.json({
        data: { message: "Consent escalated successfully" },
      })
    } catch (error) {
      console.error("Error escalating consent:", error)
      return NextResponse.json({ error: "Failed to escalate consent" }, { status: 500 })
    }
  })(request)
}
