import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { clientId, facilityId } = body

    // Base score
    let riskScore = 50

    // Compliance history (0-30 points)
    const complianceResult: any = await query(
      `SELECT 
        COUNT(DISTINCT CASE WHEN compliance_status = 'compliant' THEN id END) as compliant,
        COUNT(DISTINCT CASE WHEN compliance_status = 'non_compliant' THEN id END) as non_compliant,
        COUNT(DISTINCT CASE WHEN compliance_status = 'action_required' THEN id END) as action_required
       FROM tbl_compliance_status 
       WHERE client_id = ? ${facilityId ? "AND facility_id = ?" : ""}`,
      facilityId ? [clientId, facilityId] : [clientId],
    )

    const compliance = Array.isArray(complianceResult) ? complianceResult[0] : complianceResult

    const complianceScore =
      30 * (compliance.compliant / (compliance.compliant + compliance.non_compliant + compliance.action_required || 1))
    riskScore -= Math.round(complianceScore)

    // Deadline adherence (0-20 points)
    const deadlineResult: any = await query(
      `SELECT 
        COUNT(DISTINCT CASE WHEN is_completed = TRUE THEN id END) as completed,
        COUNT(DISTINCT CASE WHEN is_completed = FALSE AND due_date < CURDATE() THEN id END) as overdue
       FROM tbl_reminders
       WHERE client_id = ? ${facilityId ? "AND facility_id = ?" : ""}`,
      facilityId ? [clientId, facilityId] : [clientId],
    )

    const deadlines = Array.isArray(deadlineResult) ? deadlineResult[0] : deadlineResult
    const overdueCount = deadlines.overdue || 0
    const deadlineScore = Math.min(20, overdueCount * 5)
    riskScore += deadlineScore

    // Recent submissions (0-15 points)
    const submissionResult: any = await query(
      `SELECT COUNT(*) as count FROM tbl_submissions 
       WHERE client_id = ? ${facilityId ? "AND facility_id = ?" : ""} 
       AND submitted_date >= DATE_SUB(CURDATE(), INTERVAL 90 DAY)`,
      facilityId ? [clientId, facilityId] : [clientId],
    )

    const recentSubmissions = Array.isArray(submissionResult) ? submissionResult[0]?.count : submissionResult?.count
    const submissionScore = Math.max(0, 15 - recentSubmissions * 2)
    riskScore += submissionScore

    // Outstanding issues (0-25 points)
    const issueResult: any = await query(
      `SELECT COUNT(*) as count FROM tbl_compliance_status 
       WHERE client_id = ? ${facilityId ? "AND facility_id = ?" : ""} 
       AND compliance_status = 'action_required'`,
      facilityId ? [clientId, facilityId] : [clientId],
    )

    const outstandingIssues = Array.isArray(issueResult) ? issueResult[0]?.count : issueResult?.count
    const issueScore = Math.min(25, outstandingIssues * 5)
    riskScore += issueScore

    // Normalize to 0-100
    riskScore = Math.max(0, Math.min(100, riskScore))

    // Determine risk level
    let riskLevel = "low"
    if (riskScore >= 75) riskLevel = "critical"
    else if (riskScore >= 50) riskLevel = "high"
    else if (riskScore >= 25) riskLevel = "medium"

    return NextResponse.json({
      riskScore,
      riskLevel,
      breakdown: {
        compliance: Math.round(complianceScore),
        deadlines: deadlineScore,
        submissions: submissionScore,
        issues: issueScore,
      },
    })
  } catch (error) {
    console.error("[v0] Risk score calculation error:", error)
    return NextResponse.json({ error: "Failed to calculate risk score" }, { status: 500 })
  }
}
