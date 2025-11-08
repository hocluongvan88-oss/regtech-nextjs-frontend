import { trackKPI, getKPIsByCategory } from "@/lib/analytics-service"
import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const clientId = searchParams.get("clientId")
    const category = searchParams.get("category") || "compliance"

    const finalClientId = clientId || request.headers.get("x-client-id")

    if (!finalClientId || finalClientId.trim() === "") {
      return NextResponse.json({ error: "clientId parameter is required and cannot be empty" }, { status: 400 })
    }

    try {
      const kpis = await getKPIsByCategory(finalClientId, category)
      return NextResponse.json(kpis)
    } catch (serviceError) {
      console.error("[v0] Service error in KPI:", serviceError)
      // Return empty data structure instead of 500
      return NextResponse.json({
        facilities_total: 0,
        facilities_registered: 0,
        facilities_action_needed: 0,
        submissions_total: 0,
        submissions_approved: 0,
        submissions_pending: 0,
        compliance_on_track: 0,
        compliance_at_risk: 0,
        compliance_critical: 0,
      })
    }
  } catch (error) {
    console.error("[v0] KPI GET error:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch KPIs"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, kpi_name, current_value, target_value, category } = body

    if (!clientId || clientId.trim() === "") {
      return NextResponse.json({ error: "clientId is required and cannot be empty" }, { status: 400 })
    }

    if (!kpi_name || kpi_name.trim() === "") {
      return NextResponse.json({ error: "kpi_name is required and cannot be empty" }, { status: 400 })
    }

    if (typeof current_value !== "number" || typeof target_value !== "number") {
      return NextResponse.json({ error: "current_value and target_value must be numbers" }, { status: 400 })
    }

    const kpi = await trackKPI(
      clientId,
      kpi_name,
      current_value,
      target_value,
      category || "general",
      authResult.user.id,
    )

    return NextResponse.json(kpi, { status: 201 })
  } catch (error) {
    console.error("[v0] KPI POST error:", error)
    const message = error instanceof Error ? error.message : "Failed to track KPI"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
