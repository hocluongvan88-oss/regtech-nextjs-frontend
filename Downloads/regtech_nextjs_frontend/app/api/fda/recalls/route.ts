import { fetchFDARecalls, logFDADataSync } from "@/lib/fda-public-data-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const product = searchParams.get("product") || undefined
    const status = searchParams.get("status") || undefined
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 })
    }

    const recalls = await fetchFDARecalls({
      product: product || undefined,
      status: status || undefined,
      limit: 100,
    })

    await logFDADataSync(clientId, "recalls", recalls.length, "success")

    return NextResponse.json({
      success: true,
      count: recalls.length,
      data: recalls,
      lastSyncedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] FDA recalls error:", error)

    const clientId = request.nextUrl.searchParams.get("client_id")
    if (clientId) {
      await logFDADataSync(clientId, "recalls", 0, "error", error.message)
    }

    return NextResponse.json({ error: "Failed to fetch recalls" }, { status: 500 })
  }
}
