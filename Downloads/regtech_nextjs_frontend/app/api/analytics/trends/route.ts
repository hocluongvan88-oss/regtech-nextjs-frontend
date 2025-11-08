import { saveTrendData, getTrendData } from "@/lib/analytics-service"
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
    const metricName = searchParams.get("metricName")
    const days = Number.parseInt(searchParams.get("days") || "90")

    const finalClientId = clientId || request.headers.get("x-client-id")

    if (!finalClientId || finalClientId.trim() === "") {
      return NextResponse.json({ error: "clientId parameter is required and cannot be empty" }, { status: 400 })
    }

    if (!metricName || metricName.trim() === "") {
      return NextResponse.json({ improving_count: 0, stable_count: 0, declining_count: 0 })
    }

    if (Number.isNaN(days) || days < 1 || days > 3650) {
      return NextResponse.json({ error: "days must be a number between 1 and 3650" }, { status: 400 })
    }

    try {
      const trends = await getTrendData(finalClientId, metricName, days)
      return NextResponse.json(trends)
    } catch (serviceError) {
      console.error("[v0] Service error in trends:", serviceError)
      // Return empty data structure instead of 500
      return NextResponse.json({
        improving_count: 0,
        stable_count: 0,
        declining_count: 0,
      })
    }
  } catch (error) {
    console.error("[v0] Trend data GET error:", error)
    const message = error instanceof Error ? error.message : "Failed to fetch trends"
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
    const { clientId, metric_name, metric_value, category } = body

    if (!clientId || clientId.trim() === "") {
      return NextResponse.json({ error: "clientId is required and cannot be empty" }, { status: 400 })
    }

    if (!metric_name || metric_name.trim() === "") {
      return NextResponse.json({ error: "metric_name is required and cannot be empty" }, { status: 400 })
    }

    if (typeof metric_value !== "number") {
      return NextResponse.json({ error: "metric_value must be a number" }, { status: 400 })
    }

    await saveTrendData(clientId, metric_name, metric_value, category || "general")

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error("[v0] Trend data POST error:", error)
    const message = error instanceof Error ? error.message : "Failed to save trend data"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
