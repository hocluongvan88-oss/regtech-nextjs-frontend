import { type NextRequest, NextResponse } from "next/server"
import { withRLSEnforcement } from "@/lib/api-rls-handler"
import { createAgentConsentTracking, getPendingConsentTrackings } from "@/lib/agent-contract-service"

export async function POST(request: NextRequest) {
  return withRLSEnforcement(async (req, context) => {
    try {
      const body = await req.json()

      const consent = await createAgentConsentTracking(
        body.service_contract_id,
        context.clientId,
        body.facility_id,
        body.agent_user_id,
        body.agent_email,
        context.userId,
        req.headers.get("user-agent") || undefined,
      )

      return NextResponse.json(
        { data: consent, message: "Agent consent tracking initiated (10 business day deadline)" },
        { status: 201 },
      )
    } catch (error) {
      console.error("Error creating consent tracking:", error)
      return NextResponse.json({ error: "Failed to create consent tracking" }, { status: 500 })
    }
  })(request)
}

export async function GET(request: NextRequest) {
  return withRLSEnforcement(async (req, context) => {
    try {
      const { searchParams } = new URL(req.url)
      const daysUntilDeadline = Number.parseInt(searchParams.get("days_until_deadline") || "3")

      const consents = await getPendingConsentTrackings(context.clientId, daysUntilDeadline)

      const transformedConsents = consents.map((consent: any) => ({
        id: consent.id,
        facility_name: consent.facility_name,
        agent_email: consent.agent_email,
        acknowledgment_status: consent.consent_status, // Map consent_status to acknowledgment_status
        fda_deadline: consent.acknowledgment_deadline_date, // Map acknowledgment_deadline_date to fda_deadline
        business_days_remaining: consent.days_remaining || 0, // Use computed days_remaining
        acknowledgment_overdue: consent.acknowledgment_overdue === 1 || consent.acknowledgment_overdue === true,
        ...consent, // Include all other fields
      }))

      return NextResponse.json(transformedConsents)
    } catch (error) {
      console.error("Error retrieving consent trackings:", error)
      return NextResponse.json({ error: "Failed to retrieve consent trackings" }, { status: 500 })
    }
  })(request)
}
