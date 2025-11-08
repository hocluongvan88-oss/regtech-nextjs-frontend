import { fetchFDADeviceClassifications, logFDADataSync } from "@/lib/fda-public-data-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const productCode = searchParams.get("product_code") || undefined
    const deviceName = searchParams.get("device_name") || undefined
    const clientId = searchParams.get("client_id")

    if (!clientId) {
      return NextResponse.json({ error: "Missing client_id" }, { status: 400 })
    }

    const classifications = await fetchFDADeviceClassifications({
      product_code: productCode || undefined,
      device_name: deviceName || undefined,
      limit: 100,
    })

    await logFDADataSync(clientId, "device_classifications", classifications.length, "success")

    return NextResponse.json({
      success: true,
      count: classifications.length,
      data: classifications,
      lastSyncedAt: new Date().toISOString(),
    })
  } catch (error: any) {
    console.error("[v0] FDA device classification error:", error)

    const clientId = request.nextUrl.searchParams.get("client_id")
    if (clientId) {
      await logFDADataSync(clientId, "device_classifications", 0, "error", error.message)
    }

    return NextResponse.json({ error: "Failed to fetch device classifications" }, { status: 500 })
  }
}
