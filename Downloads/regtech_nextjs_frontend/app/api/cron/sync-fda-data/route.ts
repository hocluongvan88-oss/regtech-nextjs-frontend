import {
  syncFDAEnforcementToRCM,
  syncFDARecallsToRCM,
  syncFDAAverseEventsToRCM,
  logFDASyncEvent,
} from "@/lib/fda-rcm-sync-service"
import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all active clients
    const clients: any = await query("SELECT id FROM tbl_clients WHERE deleted_at IS NULL LIMIT 100")

    let totalSynced = 0
    const syncResults: Record<string, any> = {}

    for (const client of clients) {
      try {
        console.log(`[v0] Starting FDA sync for client: ${client.id}`)

        const enforcementCount = await syncFDAEnforcementToRCM(client.id, "cron-system")
        const recallCount = await syncFDARecallsToRCM(client.id, "cron-system")
        const adverseEventCount = await syncFDAAverseEventsToRCM(client.id, "cron-system")

        const clientTotal = enforcementCount + recallCount + adverseEventCount

        syncResults[client.id] = {
          enforcement: enforcementCount,
          recalls: recallCount,
          adverseEvents: adverseEventCount,
          total: clientTotal,
        }

        totalSynced += clientTotal

        await logFDASyncEvent(
          client.id,
          "cron_sync",
          `Hourly sync: ${enforcementCount} enforcement, ${recallCount} recalls, ${adverseEventCount} events`,
        )

        console.log(`[v0] FDA sync completed for client ${client.id}: ${clientTotal} items synced`)
      } catch (error) {
        console.error(`[v0] Error syncing FDA data for client ${client.id}:`, error)

        await logFDASyncEvent(
          client.id,
          "cron_sync_error",
          `Sync failed: ${error instanceof Error ? error.message : "Unknown error"}`,
        )
      }
    }

    console.log(`[v0] FDA hourly sync completed. Total synced: ${totalSynced} items`)

    return NextResponse.json({
      success: true,
      message: `FDA sync completed for ${clients.length} clients`,
      totalSynced,
      clientResults: syncResults,
    })
  } catch (error: any) {
    console.error("[v0] FDA cron sync error:", error)
    return NextResponse.json({ error: "Cron job failed" }, { status: 500 })
  }
}
