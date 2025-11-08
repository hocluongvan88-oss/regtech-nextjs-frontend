import { query } from "@/lib/db"

const FDA_API_BASE = "https://api.fda.gov"
const FDA_DEVICE_ENFORCEMENT_URL = `${FDA_API_BASE}/device/enforcement.json`
const FDA_DEVICE_EVENT_URL = `${FDA_API_BASE}/device/event.json`
const FDA_DEVICE_510K_URL = `${FDA_API_BASE}/device/510k.json`
const FDA_DEVICE_CLASSIFICATION_URL = `${FDA_API_BASE}/device/classification.json`

// Types for FDA data
export interface FDAEnforcementAction {
  event_id?: string
  recall_number?: string
  status?: string
  recalling_firm?: string
  product_description?: string
  reason_for_recall?: string
  product_code?: string
  code_info?: string
  recall_initiation_date?: string
  report_date?: string
  classification?: string
  termination_date?: string
  city?: string
  state?: string
  country?: string
  distribution_pattern?: string
  product_quantity?: string
}

export interface FDARecall {
  recall_number: string
  recall_status: string
  product_quantity: string
  reason_for_recall: string
  recall_initiation_date: string
  classification: string
  product_description: string
  center_classification_date: string
}

export interface FDAAdverseEvent {
  report_number?: string
  event_key?: string
  date_received?: string
  device?: Array<{
    brand_name?: string
    generic_name?: string
    manufacturer_d_name?: string
    device_class?: string
    device_report_product_code?: string
  }>
  patient?: Array<{
    patient_sequence_number?: string
  }>
  mdr_text?: Array<{
    text?: string
    text_type_code?: string
  }>
}

export interface FDADeviceClassification {
  product_code: string
  device_name: string
  medical_specialty?: string
  medical_specialty_description?: string
  panel?: string
  device_class?: string
  regulation_number?: string
  definition?: string
}

function formatDateForFDA(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, "0")
  const day = String(date.getDate()).padStart(2, "0")
  return `${year}${month}${day}`
}

function getCurrentDate(): string {
  return formatDateForFDA(new Date())
}

function getDate90DaysAgo(): string {
  const date = new Date()
  date.setDate(date.getDate() - 90)
  return formatDateForFDA(date)
}

function getDate6MonthsAgo(): string {
  const date = new Date()
  date.setMonth(date.getMonth() - 6)
  return formatDateForFDA(date)
}

// ============================================
// DEVICE ENFORCEMENT / RECALLS
// ============================================

export async function fetchFDAEnforcementActions(params?: {
  search?: string
  classification?: string
  limit?: number
  skip?: number
}): Promise<FDAEnforcementAction[]> {
  try {
    const url = new URL(FDA_DEVICE_ENFORCEMENT_URL)

    // Build search query with proper FDA syntax: search=field:value+AND+field:value
    const searchParts: string[] = []

    if (params?.search) {
      searchParts.push(`product_description:"${params.search}"`)
    }

    if (params?.classification) {
      searchParts.push(`classification:"${params.classification}"`)
    }

    // Recent enforcement actions using date range syntax [YYYYMMDD TO YYYYMMDD]
    searchParts.push(`report_date:[${getDate90DaysAgo()}+TO+${getCurrentDate()}]`)

    if (searchParts.length > 0) {
      url.searchParams.set("search", searchParts.join("+AND+"))
    }

    url.searchParams.set("limit", String(params?.limit || 100))

    if (params?.skip) {
      url.searchParams.set("skip", String(params.skip))
    }

    console.log("[v0] FDA Enforcement API URL:", url.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] FDA API Error:", response.status, errorText)
      throw new Error(`FDA API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    console.log(`[v0] FDA Enforcement Actions fetched: ${data.results?.length || 0} records`)

    return data.results || []
  } catch (error) {
    console.error("[v0] Error fetching FDA enforcement actions:", error)
    throw error
  }
}

export async function fetchFDARecalls(params?: {
  product?: string
  status?: string
  limit?: number
}): Promise<FDARecall[]> {
  try {
    const url = new URL(FDA_DEVICE_ENFORCEMENT_URL)

    const searchParts: string[] = []

    if (params?.product) {
      searchParts.push(`product_description:"${params.product}"`)
    }

    if (params?.status) {
      searchParts.push(`status:"${params.status}"`)
    }

    // Recent recalls
    searchParts.push(`report_date:[${getDate90DaysAgo()}+TO+${getCurrentDate()}]`)

    if (searchParts.length > 0) {
      url.searchParams.set("search", searchParts.join("+AND+"))
    }

    url.searchParams.set("limit", String(params?.limit || 100))

    console.log("[v0] FDA Recalls API URL:", url.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] FDA API Error:", response.status, errorText)
      throw new Error(`FDA API returned ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] FDA Recalls fetched: ${data.results?.length || 0} records`)

    return data.results || []
  } catch (error) {
    console.error("[v0] Error fetching FDA recalls:", error)
    throw error
  }
}

// ============================================
// DEVICE ADVERSE EVENTS
// ============================================

export async function fetchFDAAverseEvents(params?: {
  product?: string
  product_code?: string
  serious_only?: boolean
  limit?: number
}): Promise<FDAAdverseEvent[]> {
  try {
    const url = new URL(FDA_DEVICE_EVENT_URL)

    const searchParts: string[] = []

    if (params?.product) {
      searchParts.push(`device.brand_name:"${params.product}"`)
    }

    if (params?.product_code) {
      searchParts.push(`device.device_report_product_code:"${params.product_code}"`)
    }

    // Last 6 months using date_received field
    searchParts.push(`date_received:[${getDate6MonthsAgo()}+TO+${getCurrentDate()}]`)

    if (searchParts.length > 0) {
      url.searchParams.set("search", searchParts.join("+AND+"))
    }

    url.searchParams.set("limit", String(params?.limit || 100))

    console.log("[v0] FDA Adverse Events API URL:", url.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] FDA API Error:", response.status, errorText)
      throw new Error(`FDA API returned ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] FDA Adverse Events fetched: ${data.results?.length || 0} records`)

    return data.results || []
  } catch (error) {
    console.error("[v0] Error fetching FDA adverse events:", error)
    throw error
  }
}

// ============================================
// DEVICE CLASSIFICATION
// ============================================

export async function fetchFDADeviceClassifications(params?: {
  product_code?: string
  device_name?: string
  limit?: number
}): Promise<FDADeviceClassification[]> {
  try {
    const url = new URL(FDA_DEVICE_CLASSIFICATION_URL)

    const searchParts: string[] = []

    if (params?.product_code) {
      searchParts.push(`product_code:"${params.product_code}"`)
    }

    if (params?.device_name) {
      searchParts.push(`device_name:"${params.device_name}"`)
    }

    if (searchParts.length > 0) {
      url.searchParams.set("search", searchParts.join("+AND+"))
    }

    url.searchParams.set("limit", String(params?.limit || 100))

    console.log("[v0] FDA Classifications API URL:", url.toString())

    const response = await fetch(url.toString())

    if (!response.ok) {
      const errorText = await response.text()
      console.error("[v0] FDA API Error:", response.status, errorText)
      throw new Error(`FDA API returned ${response.status}`)
    }

    const data = await response.json()
    console.log(`[v0] FDA Classifications fetched: ${data.results?.length || 0} records`)

    return data.results || []
  } catch (error) {
    console.error("[v0] Error fetching FDA device classifications:", error)
    throw error
  }
}

export async function testFDAConnection(): Promise<{
  success: boolean
  endpoints: Record<string, boolean>
  error?: string
}> {
  const results: Record<string, boolean> = {}

  try {
    // Test each endpoint with a simple query
    const tests = [
      { name: "enforcement", fn: () => fetchFDAEnforcementActions({ limit: 1 }) },
      { name: "adverse_events", fn: () => fetchFDAAverseEvents({ limit: 1 }) },
      { name: "classifications", fn: () => fetchFDADeviceClassifications({ limit: 1 }) },
    ]

    for (const test of tests) {
      try {
        await test.fn()
        results[test.name] = true
      } catch (error) {
        console.error(`[v0] FDA ${test.name} test failed:`, error)
        results[test.name] = false
      }
    }

    const allSuccess = Object.values(results).every((v) => v)

    return {
      success: allSuccess,
      endpoints: results,
    }
  } catch (error) {
    return {
      success: false,
      endpoints: results,
      error: error instanceof Error ? error.message : String(error),
    }
  }
}

// ============================================
// DATABASE LOGGING
// ============================================

export async function logFDADataSync(
  clientId: string,
  dataType: string,
  recordsCount: number,
  status: "success" | "error",
  errorMessage?: string,
): Promise<void> {
  try {
    await query(
      `INSERT INTO tbl_fda_data_sync_log 
       (client_id, data_type, records_synced, sync_status, error_message)
       VALUES (?, ?, ?, ?, ?)`,
      [clientId, dataType, recordsCount, status, errorMessage || null],
    )
  } catch (error) {
    console.error("[v0] Error logging FDA data sync:", error)
  }
}
