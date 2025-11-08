import { query } from "@/lib/db"

const FDA_ESG_BASE_URL = process.env.FDA_ESG_BASE_URL || "https://esg.fda.gov/api/v1"
const FDA_USP_BASE_URL = process.env.FDA_USP_BASE_URL || "https://submissions.fda.gov/api/v1"
const FDA_API_KEY = process.env.FDA_API_KEY
const FDA_CLIENT_ID = process.env.FDA_CLIENT_ID

export interface FDASubmissionPayload {
  submissionType: "registration" | "amendment" | "renewal"
  facilityInfo: {
    feiNumber: string
    facilityName: string
    address: string
    city: string
    state: string
    zip: string
    country: string
  }
  products: Array<{
    productName: string
    productCode: string
    classification: string
    intendedUse: string
  }>
  documents: Array<{
    fileName: string
    fileType: string
    base64Content: string
  }>
}

async function logFDAApiCall(
  clientId: string,
  submissionId: string | null,
  endpoint: string,
  method: string,
  requestPayload: any,
  responseStatus: number,
  responsePayload: any,
  errorMessage?: string,
) {
  try {
    await query(
      `INSERT INTO tbl_fda_api_log 
       (client_id, submission_id, api_endpoint, request_method, request_payload, response_status, response_payload, error_message)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        clientId,
        submissionId,
        endpoint,
        method,
        JSON.stringify(requestPayload),
        responseStatus,
        JSON.stringify(responsePayload),
        errorMessage,
      ],
    )
  } catch (error) {
    console.error("[v0] Error logging FDA API call:", error)
  }
}

export async function submitToFDAESG(
  clientId: string,
  submissionId: string,
  payload: FDASubmissionPayload,
): Promise<{ success: boolean; fdaSubmissionId?: string; error?: string }> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
    }

    if (FDA_API_KEY) {
      headers["Authorization"] = `Bearer ${FDA_API_KEY}`
    }

    if (FDA_CLIENT_ID) {
      headers["X-Client-ID"] = FDA_CLIENT_ID
    }

    const response = await fetch(`${FDA_ESG_BASE_URL}/submissions`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    await logFDAApiCall(
      clientId,
      submissionId,
      `${FDA_ESG_BASE_URL}/submissions`,
      "POST",
      payload,
      response.status,
      responseData,
      response.ok ? undefined : responseData.error?.message,
    )

    if (!response.ok) {
      throw new Error(responseData.error?.message || "FDA ESG submission failed")
    }

    if (responseData.submissionId) {
      await query(
        `UPDATE tbl_submissions SET fda_submission_id = ?, submission_status = 'submitted' 
         WHERE id = ?`,
        [responseData.submissionId, submissionId],
      )
    }

    return {
      success: true,
      fdaSubmissionId: responseData.submissionId,
    }
  } catch (error: any) {
    console.error("[v0] FDA ESG submission error:", error)

    await logFDAApiCall(
      clientId,
      submissionId,
      `${FDA_ESG_BASE_URL}/submissions`,
      "POST",
      payload,
      500,
      {},
      error.message,
    )

    return {
      success: false,
      error: error.message,
    }
  }
}

export async function getSubmissionStatus(
  clientId: string,
  submissionId: string,
  fdaSubmissionId: string,
): Promise<{ status?: string; details?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    }

    if (FDA_API_KEY) {
      headers["Authorization"] = `Bearer ${FDA_API_KEY}`
    }

    const response = await fetch(`${FDA_ESG_BASE_URL}/submissions/${fdaSubmissionId}`, {
      method: "GET",
      headers,
    })

    const responseData = await response.json()

    await logFDAApiCall(
      clientId,
      submissionId,
      `${FDA_ESG_BASE_URL}/submissions/${fdaSubmissionId}`,
      "GET",
      {},
      response.status,
      responseData,
      response.ok ? undefined : responseData.error?.message,
    )

    if (!response.ok) {
      throw new Error(responseData.error?.message || "Failed to retrieve status")
    }

    // Map FDA status to internal status
    const statusMap: Record<string, string> = {
      DRAFT: "draft",
      SUBMITTED: "submitted",
      UNDER_REVIEW: "pending_review",
      APPROVED: "approved",
      REJECTED: "rejected",
      WITHDRAWN: "draft",
    }

    const internalStatus = statusMap[responseData.status] || "pending_review"

    await query(`UPDATE tbl_submissions SET submission_status = ? WHERE id = ?`, [internalStatus, submissionId])

    return {
      status: internalStatus,
      details: responseData,
    }
  } catch (error: any) {
    console.error("[v0] Error fetching FDA status:", error)
    return {
      error: error.message,
    }
  }
}

export async function uploadDocumentToFDA(
  clientId: string,
  submissionId: string,
  fdaSubmissionId: string,
  fileName: string,
  fileContent: Buffer,
  documentType: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const base64Content = fileContent.toString("base64")

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    }

    if (FDA_API_KEY) {
      headers["Authorization"] = `Bearer ${FDA_API_KEY}`
    }

    const payload = {
      fileName,
      fileType: documentType,
      base64Content,
    }

    const response = await fetch(`${FDA_ESG_BASE_URL}/submissions/${fdaSubmissionId}/documents`, {
      method: "POST",
      headers,
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    await logFDAApiCall(
      clientId,
      submissionId,
      `${FDA_ESG_BASE_URL}/submissions/${fdaSubmissionId}/documents`,
      "POST",
      { fileName, fileType: documentType },
      response.status,
      responseData,
      response.ok ? undefined : responseData.error?.message,
    )

    if (!response.ok) {
      throw new Error(responseData.error?.message || "Document upload failed")
    }

    return { success: true }
  } catch (error: any) {
    console.error("[v0] FDA document upload error:", error)
    return {
      success: false,
      error: error.message,
    }
  }
}

export async function getFacilityRegistrationStatus(
  clientId: string,
  feiNumber: string,
): Promise<{ registered?: boolean; details?: any; error?: string }> {
  try {
    const headers: Record<string, string> = {
      Accept: "application/json",
    }

    if (FDA_API_KEY) {
      headers["Authorization"] = `Bearer ${FDA_API_KEY}`
    }

    const response = await fetch(`${FDA_ESG_BASE_URL}/facilities/${feiNumber}`, {
      method: "GET",
      headers,
    })

    const responseData = await response.json()

    await logFDAApiCall(
      clientId,
      null,
      `${FDA_ESG_BASE_URL}/facilities/${feiNumber}`,
      "GET",
      {},
      response.status,
      responseData,
      response.ok ? undefined : responseData.error?.message,
    )

    if (response.status === 404) {
      return { registered: false }
    }

    if (!response.ok) {
      throw new Error(responseData.error?.message || "Failed to check facility status")
    }

    return {
      registered: true,
      details: responseData,
    }
  } catch (error: any) {
    console.error("[v0] Error checking facility status:", error)
    return {
      error: error.message,
    }
  }
}
