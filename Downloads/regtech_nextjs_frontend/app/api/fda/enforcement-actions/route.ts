import { fetchFDAEnforcementActions, logFDADataSync } from "@/lib/fda-public-data-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || undefined
    const classification = searchParams.get("classification") || undefined
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 })
    }

    const actions = await fetchFDAEnforcementActions({
      search: search || undefined,
      classification: classification || undefined,
      limit: 100,
    })

    await logFDADataSync(clientId, "enforcement_actions", actions.length, "success")

    return NextResponse.json({
      success: true,
      count: actions.length,
      data: actions,
      lastSyncedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] FDA enforcement actions error:", error)

    const clientId = request.nextUrl.searchParams.get("client_id")
    if (clientId) {
      await logFDADataSync(clientId, "enforcement_actions", 0, "error", error.message)
    }

    return NextResponse.json({ error: "Failed to fetch enforcement actions" }, { status: 500 })
  }
}
