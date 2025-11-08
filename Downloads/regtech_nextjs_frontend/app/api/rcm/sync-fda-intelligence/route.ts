import {
  syncFDAEnforcementToRCM,
  syncFDAAverseEventsToRCM,
  syncFDARecallsToRCM,
  logFDASyncEvent,
} from "@/lib/fda-rcm-sync-service"
import { testFDAConnection } from "@/lib/fda-public-data-api"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const contentType = request.headers.get("content-type")
    if (!contentType || !contentType.includes("application/json")) {
      return NextResponse.json({ success: false, error: "Content-Type must be application/json" }, { status: 400 })
    }

    const body = await request.json()
    const { clientId, userId } = body

    if (!clientId || !userId) {
      return NextResponse.json({ success: false, error: "Missing clientId or userId" }, { status: 400 })
    }

    console.log(`[v0] Starting FDA intelligence sync for client ${clientId} by user ${userId}`)

    // Sync all FDA data types with individual error handling
    let enforcementCount = 0
    let recallCount = 0
    let adverseEventCount = 0
    const errors: string[] = []

    try {
      enforcementCount = await syncFDAEnforcementToRCM(clientId, userId)
    } catch (error) {
      const errorMsg = `Enforcement sync failed: ${error}`
      console.error("[v0]", errorMsg)
      errors.push(errorMsg)
    }

    try {
      recallCount = await syncFDARecallsToRCM(clientId, userId)
    } catch (error) {
      const errorMsg = `Recalls sync failed: ${error}`
      console.error("[v0]", errorMsg)
      errors.push(errorMsg)
    }

    try {
      adverseEventCount = await syncFDAAverseEventsToRCM(clientId, userId)
    } catch (error) {
      const errorMsg = `Adverse events sync failed: ${error}`
      console.error("[v0]", errorMsg)
      errors.push(errorMsg)
    }

    const totalSynced = enforcementCount + recallCount + adverseEventCount

    await logFDASyncEvent(
      clientId,
      "manual_sync",
      `Synced ${enforcementCount} enforcement actions, ${recallCount} recalls, ${adverseEventCount} adverse events`,
    )

    if (totalSynced === 0 && errors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "FDA sync failed to retrieve any records",
          errors,
          synced: {
            enforcementActions: 0,
            recalls: 0,
            adverseEvents: 0,
          },
          total: 0,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({
      success: true,
      synced: {
        enforcementActions: enforcementCount,
        recalls: recallCount,
        adverseEvents: adverseEventCount,
      },
      total: totalSynced,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error: any) {
    console.error("[v0] FDA RCM sync error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Sync failed",
        message: error.message || String(error),
      },
      { status: 500 },
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log("[v0] Testing FDA API connection...")

    const result = await testFDAConnection()

    console.log("[v0] FDA connection test result:", result)

    return NextResponse.json(result)
  } catch (error: any) {
    console.error("[v0] Error testing FDA connection:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Failed to test FDA connection",
        message: error.message || String(error),
      },
      { status: 500 },
    )
  }
}
