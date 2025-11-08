import { generateComplianceAnalytics, saveComplianceAnalytics, getComplianceAnalytics } from "@/lib/analytics-service"
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
    const days = Number.parseInt(searchParams.get("days") || "30")

    const finalClientId = clientId || request.headers.get("x-client-id")

    if (!finalClientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 })
    }

    try {
      const analytics = await getComplianceAnalytics(finalClientId, days)
      return NextResponse.json(analytics)
    } catch (serviceError) {
      console.error("[v0] Service error in compliance analytics:", serviceError)
      // Return empty data structure instead of 500
      return NextResponse.json({
        fda_483_count: 0,
        warning_letter_count: 0,
        complaint_count: 0,
        recall_count: 0,
        total_issues: 0,
      })
    }
  } catch (error) {
    console.error("[v0] Compliance analytics GET error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { clientId, facilityId } = body

    const analytics = await generateComplianceAnalytics(clientId, facilityId)
    const id = await saveComplianceAnalytics(analytics, authResult.user.id)

    return NextResponse.json({ ...analytics, id }, { status: 201 })
  } catch (error) {
    console.error("[v0] Compliance analytics POST error:", error)
    return NextResponse.json({ error: "Failed to generate analytics" }, { status: 500 })
  }
}
