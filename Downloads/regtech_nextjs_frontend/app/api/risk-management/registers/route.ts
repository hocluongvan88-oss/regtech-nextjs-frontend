import { createRiskRegister, getRiskRegisters } from "@/lib/risk-management-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const clientId = request.headers.get("x-client-id")

    const { searchParams } = new URL(request.url)
    const paramClientId = searchParams.get("clientId")
    const facilityId = searchParams.get("facilityId")

    console.log("[v0] Risk registers GET - userId:", userId, "clientId:", clientId, "paramClientId:", paramClientId)

    if (!userId || !clientId) {
      console.log("[v0] Missing headers - userId:", userId, "clientId:", clientId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const finalClientId = paramClientId || clientId

    if (!finalClientId) {
      console.log("[v0] Missing clientId parameter")
      return NextResponse.json({ error: "clientId required" }, { status: 400 })
    }

    try {
      const registers = await getRiskRegisters(finalClientId, facilityId || undefined)
      return NextResponse.json(registers)
    } catch (serviceError) {
      console.error("[v0] Service error in risk registers:", serviceError)
      // Return empty array instead of 500
      return NextResponse.json([])
    }
  } catch (error) {
    console.error("[v0] Risk registers GET error:", error)
    return NextResponse.json({ error: "Failed to fetch risk registers" }, { status: 500 })
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
      clientId: bodyClientId,
      facilityId,
      risk_category,
      risk_title,
      risk_description,
      probability,
      impact,
      identified_date,
    } = body

    const register = await createRiskRegister(
      bodyClientId,
      {
        client_id: bodyClientId,
        facility_id: facilityId,
        risk_category,
        risk_title,
        risk_description,
        probability,
        impact,
        identified_date: new Date(identified_date),
        risk_status: "open",
      },
      userId,
    )

    return NextResponse.json(register, { status: 201 })
  } catch (error) {
    console.error("[v0] Risk register creation error:", error)
    return NextResponse.json({ error: "Failed to create risk register" }, { status: 500 })
  }
}
