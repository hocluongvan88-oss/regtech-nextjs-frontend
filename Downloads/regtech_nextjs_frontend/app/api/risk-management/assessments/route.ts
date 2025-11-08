import { createRiskAssessment, getRiskAssessments } from "@/lib/risk-management-service"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get("x-user-id")
    const clientId = request.headers.get("x-client-id")

    const { searchParams } = new URL(request.url)
    const paramClientId = searchParams.get("clientId")

    console.log("[v0] Risk assessments GET - userId:", userId, "clientId:", clientId, "paramClientId:", paramClientId)

    if (!userId || !clientId) {
      console.log("[v0] Missing headers - userId:", userId, "clientId:", clientId)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!paramClientId) {
      console.log("[v0] Missing clientId parameter")
      return NextResponse.json({ error: "clientId required" }, { status: 400 })
    }

    const assessments = await getRiskAssessments(paramClientId)
    return NextResponse.json(assessments)
  } catch (error) {
    console.error("[v0] Risk assessments GET error:", error)
    return NextResponse.json({ error: "Failed to fetch assessments" }, { status: 500 })
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
      assessment_type,
      compliance_risk_score,
      operational_risk_score,
      financial_risk_score,
    } = body

    const assessment = await createRiskAssessment(
      bodyClientId,
      {
        id: "",
        client_id: bodyClientId,
        facility_id: facilityId,
        assessment_date: new Date(),
        assessment_type,
        overall_risk_score: 0,
        risk_level: "medium",
        compliance_risk_score,
        operational_risk_score,
        financial_risk_score,
      },
      userId,
    )

    return NextResponse.json(assessment, { status: 201 })
  } catch (error) {
    console.error("[v0] Risk assessment creation error:", error)
    return NextResponse.json({ error: "Failed to create assessment" }, { status: 500 })
  }
}
