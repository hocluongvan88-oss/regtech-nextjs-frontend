import { type NextRequest, NextResponse } from "next/server"
import { withRLSEnforcement } from "@/lib/api-rls-handler"
import { createServiceContract, listServiceContracts } from "@/lib/agent-contract-service"

export async function POST(request: NextRequest) {
  return withRLSEnforcement(async (req, context) => {
    try {
      console.log("[v0] POST /api/contracts/service - Creating contract")
      const body = await req.json()
      console.log("[v0] Request body:", body)

      const contract = await createServiceContract(
        context.clientId,
        {
          facility_id: body.facility_id || null,
          contract_type: body.contract_type || "US_AGENT_REP",
          contract_start_date: body.contract_start_date,
          contract_end_date: body.contract_end_date,
          contract_duration_months: body.contract_duration_months,
          billing_status: body.billing_status || "paid",
          agent_user_id: body.agent_user_id || null,
          contract_notes: body.contract_notes || null,
        },
        context.userId,
        req.headers.get("user-agent") || undefined,
      )

      console.log("[v0] Contract created successfully:", contract.id)
      return NextResponse.json({ data: contract, message: "Service contract created successfully" }, { status: 201 })
    } catch (error) {
      console.error("[v0] Error creating service contract:", error)
      return NextResponse.json(
        { error: "Failed to create service contract", details: error instanceof Error ? error.message : String(error) },
        { status: 500 },
      )
    }
  })(request)
}

export async function GET(request: NextRequest) {
  return withRLSEnforcement(async (req, context) => {
    try {
      console.log("[v0] GET /api/contracts/service - Listing contracts for client:", context.clientId)
      const { searchParams } = new URL(req.url)
      const status = searchParams.get("status")
      const contractType = searchParams.get("contract_type")
      const billingStatus = searchParams.get("billing_status")

      const contracts = await listServiceContracts(context.clientId, {
        status: status || undefined,
        contract_type: contractType || undefined,
        billing_status: billingStatus || undefined,
      })

      console.log("[v0] Found contracts:", contracts.length)
      return NextResponse.json({ data: contracts })
    } catch (error) {
      console.error("[v0] Error retrieving service contracts:", error)
      return NextResponse.json(
        {
          error: "Failed to retrieve service contracts",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  })(request)
}
