import { fetchFDAAverseEvents, logFDADataSync } from "@/lib/fda-public-data-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const product = searchParams.get("product") || undefined
    const reaction = searchParams.get("reaction") || undefined
    const seriousOnly = searchParams.get("serious_only") === "true"
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 })
    }

    const events = await fetchFDAAverseEvents({
      product: product || undefined,
      reaction: reaction || undefined,
      serious_only: seriousOnly,
      limit: 100,
    })

    await logFDADataSync(clientId, "adverse_events", events.length, "success")

    return NextResponse.json({
      success: true,
      count: events.length,
      data: events,
      lastSyncedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] FDA adverse events error:", error)

    const clientId = request.nextUrl.searchParams.get("client_id")
    if (clientId) {
      await logFDADataSync(clientId, "adverse_events", 0, "error", error.message)
    }

    return NextResponse.json({ error: "Failed to fetch adverse events" }, { status: 500 })
  }
}
