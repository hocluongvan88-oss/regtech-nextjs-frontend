import { getSubmissionStatus, getFacilityRegistrationStatus } from "@/lib/fda-api"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const submissionId = searchParams.get("submission_id")
    const fdaSubmissionId = searchParams.get("fda_submission_id")
    const clientId = searchParams.get("client_id")
    const feiNumber = searchParams.get("fei_number")

    if (feiNumber && clientId) {
      // Check facility registration status
      const result = await getFacilityRegistrationStatus(clientId, feiNumber)
      return NextResponse.json(result)
    }

    if (submissionId && fdaSubmissionId && clientId) {
      // Check submission status
      const result = await getSubmissionStatus(clientId, submissionId, fdaSubmissionId)
      return NextResponse.json(result)
    }

    return NextResponse.json({ error: "Missing required query parameters" }, { status: 400 })
  } catch (error: any) {
    console.error("[v0] FDA status error:", error)
    return NextResponse.json({ error: "Failed to check status" }, { status: 500 })
  }
}
