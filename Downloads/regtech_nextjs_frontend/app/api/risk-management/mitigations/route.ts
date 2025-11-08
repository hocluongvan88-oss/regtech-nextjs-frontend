import { createRiskMitigation, getRiskMitigations } from "@/lib/risk-management-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const clientId = request.headers.get("x-client-id")

    const { searchParams } = new URL(request.url)
    const riskRegisterId = searchParams.get("riskRegisterId")

    console.log("[v0] Risk mitigations GET - userId:", userId, "clientId:", clientId, "riskRegisterId:", riskRegisterId)

    if (!userId || !clientId) {
      console.log("[v0] Missing headers - userId:", userId, "clientId:", clientId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!riskRegisterId) {
      console.log("[v0] Missing riskRegisterId parameter")
      return NextResponse.json({ error: "riskRegisterId required" }, { status: 400 })
    }

    const mitigations = await getRiskMitigations(riskRegisterId)
    return NextResponse.json(mitigations)
  } catch (error) {
    console.error("[v0] Risk mitigations GET error:", error)
    return NextResponse.json({ error: "Failed to fetch mitigations" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const clientId = request.headers.get("x-client-id")

    if (!userId || !clientId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const {
      riskRegisterId,
      mitigation_title,
      mitigation_description,
      mitigation_strategy,
      assigned_to,
      target_completion_date,
    } = body

    const mitigation = await createRiskMitigation(
      riskRegisterId,
      {
        id: "",
        risk_register_id: riskRegisterId,
        mitigation_title,
        mitigation_description,
        mitigation_strategy,
        assigned_to,
        target_completion_date: target_completion_date ? new Date(target_completion_date) : undefined,
        mitigation_status: "pending",
      },
      userId,
    )

    return NextResponse.json(mitigation, { status: 201 })
  } catch (error) {
    console.error("[v0] Risk mitigation creation error:", error)
    return NextResponse.json({ error: "Failed to create mitigation" }, { status: 500 })
  }
}
