import { type NextRequest, NextResponse } from "next/server"
import { withRLSEnforcement } from "@/lib/api-rls-handler"
import { hasActiveUSAgentContract, canClientPerformOperations } from "@/lib/agent-contract-service"

export async function GET(request: NextRequest) {
  return withRLSEnforcement(request, async (clientId) => {
    try {
      const hasActive = await hasActiveUSAgentContract(clientId)
      const operationStatus = await canClientPerformOperations(clientId)

      return NextResponse.json({
        data: {
          has_active_contract: hasActive,
          can_perform_operations: operationStatus.allowed,
          reason: operationStatus.reason,
          last_contract_end: operationStatus.lastContractEnd,
        },
      })
    } catch (error) {
      console.error("Error verifying agent contract:", error)
      return NextResponse.json({ error: "Failed to verify agent contract" }, { status: 500 })
    }
  })
}
