import { type NextRequest, NextResponse } from "next/server"
import { withRLSEnforcement } from "@/lib/api-rls-handler"
import { getServiceContract } from "@/lib/agent-contract-service"

export async function GET(request: NextRequest, { params }: { params: Promise<{ contractId: string }> }) {
  return withRLSEnforcement(async (req, context) => {
    try {
      const urlParts = req.url.split("/")
      const contractId = urlParts[urlParts.length - 1]

      console.log("[v0] GET /api/contracts/service/[contractId] - Fetching contract:", contractId)

      if (!contractId || contractId === "service") {
        return NextResponse.json({ error: "Contract ID is required" }, { status: 400 })
      }

      const contract = await getServiceContract(contractId, context.clientId)

      if (!contract) {
        return NextResponse.json({ error: "Contract not found" }, { status: 404 })
      }

      console.log("[v0] Contract found:", contract.id)
      return NextResponse.json({ data: contract })
    } catch (error) {
      console.error("[v0] Error fetching contract:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch contract",
          details: error instanceof Error ? error.message : String(error),
        },
        { status: 500 },
      )
    }
  })(request)
}
