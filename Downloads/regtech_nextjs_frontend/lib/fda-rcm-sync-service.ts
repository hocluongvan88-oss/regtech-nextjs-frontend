import { fetchFDAEnforcementActions, fetchFDARecalls, fetchFDAAverseEvents } from "@/lib/fda-public-data-api"
import { createRegulatoryIntelligence } from "@/lib/rcm-service"
import { query } from "@/lib/db"

export async function syncFDAEnforcementToRCM(clientId: string, userId: string): Promise<number> {
  try {
    console.log("[v0] Starting FDA enforcement sync for client:", clientId)

    const actions = await fetchFDAEnforcementActions({ limit: 50 })
    console.log(`[v0] Fetched ${actions.length} enforcement actions from FDA`)

    let synced = 0

    for (const action of actions) {
      try {
        // Check if already exists
        const existing = await query(
          `SELECT id FROM tbl_regulatory_intelligence 
           WHERE client_id = ? AND regulatory_reference_id = ?`,
          [clientId, action.recall_number || action.event_id || ""],
        )

        if ((existing as any[]).length > 0) {
          console.log(`[v0] Skipping duplicate: ${action.recall_number}`)
          continue
        }

        // Create as regulatory intelligence
        await createRegulatoryIntelligence(
          clientId,
          {
            regulatory_body: "FDA",
            change_type: "enforcement_action",
            title: `${action.classification || "Class Unknown"}: ${action.product_description?.substring(0, 200) || "FDA Device Recall"}`,
            description: action.reason_for_recall || action.product_description || "No description available",
            source_url: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`,
            regulatory_reference_id: action.recall_number || action.event_id || `enforcement_${Date.now()}`,
            affected_areas: ["labeling", "quality", "manufacturing"],
            risk_level: mapClassificationToRiskLevel(action.classification || ""),
            announcement_date: formatDate(action.recall_initiation_date || action.report_date),
            effective_date: formatDate(action.report_date),
            status: "new",
            action_required: true,
            action_items_count: 0,
          },
          userId,
        )

        synced++
      } catch (itemError) {
        console.error(`[v0] Error processing enforcement action ${action.recall_number}:`, itemError)
      }
    }

    console.log(`[v0] Successfully synced ${synced} enforcement actions`)
    return synced
  } catch (error) {
    console.error("[v0] Error syncing FDA enforcement to RCM:", error)
    throw error
  }
}

export async function syncFDARecallsToRCM(clientId: string, userId: string): Promise<number> {
  try {
    console.log("[v0] Starting FDA recalls sync for client:", clientId)

    const recalls = await fetchFDARecalls({ limit: 50 })
    console.log(`[v0] Fetched ${recalls.length} recalls from FDA`)

    let synced = 0

    for (const recall of recalls) {
      try {
        const existing = await query(
          `SELECT id FROM tbl_regulatory_intelligence 
           WHERE client_id = ? AND regulatory_reference_id = ?`,
          [clientId, recall.recall_number],
        )

        if ((existing as any[]).length > 0) {
          console.log(`[v0] Skipping duplicate: ${recall.recall_number}`)
          continue
        }

        await createRegulatoryIntelligence(
          clientId,
          {
            regulatory_body: "FDA",
            change_type: "product_recall",
            title: `Recall ${recall.recall_number}: ${recall.product_description?.substring(0, 200)}`,
            description: recall.reason_for_recall,
            source_url: `https://www.fda.gov/safety/recalls-market-withdrawals-safety-alerts`,
            regulatory_reference_id: recall.recall_number,
            content_summary: `Quantity: ${recall.product_quantity}. Status: ${recall.recall_status}`,
            affected_areas: ["distribution", "quality", "customer_communication"],
            risk_level: mapClassificationToRiskLevel(recall.classification),
            announcement_date: formatDate(recall.recall_initiation_date),
            effective_date: formatDate(recall.center_classification_date),
            status: "new",
            action_required: true,
            action_items_count: 0,
          },
          userId,
        )

        synced++
      } catch (itemError) {
        console.error(`[v0] Error processing recall ${recall.recall_number}:`, itemError)
      }
    }

    console.log(`[v0] Successfully synced ${synced} recalls`)
    return synced
  } catch (error) {
    console.error("[v0] Error syncing FDA recalls to RCM:", error)
    throw error
  }
}

export async function syncFDAAverseEventsToRCM(
  clientId: string,
  userId: string,
  productName?: string,
): Promise<number> {
  try {
    console.log("[v0] Starting FDA adverse events sync for client:", clientId)

    const events = await fetchFDAAverseEvents({
      product: productName,
      serious_only: true,
      limit: 50,
    })
    console.log(`[v0] Fetched ${events.length} adverse events from FDA`)

    let synced = 0

    for (const event of events) {
      try {
        const reportId = event.report_number || event.event_key || ""

        const existing = await query(
          `SELECT id FROM tbl_regulatory_intelligence 
           WHERE client_id = ? AND regulatory_reference_id = ?`,
          [clientId, reportId],
        )

        if ((existing as any[]).length > 0) {
          console.log(`[v0] Skipping duplicate: ${reportId}`)
          continue
        }

        const device = event.device?.[0]
        const mdrText = event.mdr_text?.[0]?.text || ""
        const deviceName = device?.brand_name || device?.generic_name || "Unknown Device"

        await createRegulatoryIntelligence(
          clientId,
          {
            regulatory_body: "FDA",
            change_type: "adverse_event_alert",
            title: `Adverse Event: ${deviceName}`,
            description: mdrText.substring(0, 500) || "Medical device adverse event reported",
            source_url: "https://open.fda.gov/",
            regulatory_reference_id: reportId,
            content_summary: `Device: ${deviceName}. Manufacturer: ${device?.manufacturer_d_name || "Unknown"}`,
            affected_areas: ["quality", "safety", "risk_management"],
            risk_level: "high",
            announcement_date: formatDate(event.date_received),
            status: "new",
            action_required: true,
            action_items_count: 0,
          },
          userId,
        )

        synced++
      } catch (itemError) {
        console.error(`[v0] Error processing adverse event ${event.report_number}:`, itemError)
      }
    }

    console.log(`[v0] Successfully synced ${synced} adverse events`)
    return synced
  } catch (error) {
    console.error("[v0] Error syncing FDA adverse events to RCM:", error)
    throw error
  }
}

function mapClassificationToRiskLevel(classification: string): "low" | "medium" | "high" | "critical" {
  const classificationMap: Record<string, "low" | "medium" | "high" | "critical"> = {
    "Class I": "critical",
    "Class 1": "critical",
    "1": "critical",
    "Class II": "high",
    "Class 2": "high",
    "2": "high",
    "Class III": "medium",
    "Class 3": "medium",
    "3": "medium",
  }

  for (const [key, value] of Object.entries(classificationMap)) {
    if (classification?.includes(key)) return value
  }

  return "medium"
}

function formatDate(dateString: string | undefined): string {
  if (!dateString) return new Date().toISOString().split("T")[0]

  // Handle YYYYMMDD format
  if (dateString.length === 8 && /^\d{8}$/.test(dateString)) {
    return `${dateString.substring(0, 4)}-${dateString.substring(4, 6)}-${dateString.substring(6, 8)}`
  }

  // Handle YYYY-MM-DD format
  if (dateString.includes("-")) {
    return dateString.split("T")[0]
  }

  return dateString
}

export async function logFDASyncEvent(clientId: string, eventType: string, summary: string): Promise<void> {
  try {
    await query(
      `INSERT INTO tbl_fda_sync_events (client_id, event_type, summary, sync_timestamp)
       VALUES (?, ?, ?, NOW())`,
      [clientId, eventType, summary],
    )
  } catch (error) {
    console.error("[v0] Error logging FDA sync event:", error)
  }
}
