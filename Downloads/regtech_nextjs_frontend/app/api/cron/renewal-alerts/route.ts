/**
 * Cron Endpoint: /api/cron/renewal-alerts
 * Triggers renewal alert processing
 * Should be called daily by external cron service (e.g., EasyCron, AWS Lambda)
 *
 * Security: Include CRON_SECRET in query parameter to prevent unauthorized calls
 */

import { type NextRequest, NextResponse } from "next/server"
import { handleRenewalSchedulerCron } from "@/lib/renewal-scheduler"

export async function GET(request: NextRequest) {
  try {
    const secret = request.headers.get("x-cron-secret") || request.nextUrl.searchParams.get("secret")

    if (secret !== process.env.CRON_SECRET) {
      console.warn("[v0] Unauthorized cron call attempt")
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await handleRenewalSchedulerCron()

    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Cron handler error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
