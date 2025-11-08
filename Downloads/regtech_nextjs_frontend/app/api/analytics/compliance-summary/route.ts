import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const clientId = searchParams.get("clientId")

    if (!clientId) {
      return NextResponse.json({ error: "clientId required" }, { status: 400 })
    }

    const results = await Promise.all([
      // Facility stats
      query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN registration_status = 'registered' THEN 1 ELSE 0 END) as registered,
          SUM(CASE WHEN registration_status = 'draft' THEN 1 ELSE 0 END) as draft
         FROM tbl_client_facilities WHERE client_id = ? AND deleted_at IS NULL`,
        [clientId],
      ),

      // Product stats
      query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN status = 'active' THEN 1 ELSE 0 END) as active,
          COUNT(DISTINCT product_type) as types
         FROM tbl_products WHERE client_id = ? AND deleted_at IS NULL`,
        [clientId],
      ),

      // Submission stats
      query(
        `SELECT 
          COUNT(*) as total,
          SUM(CASE WHEN submission_status = 'approved' THEN 1 ELSE 0 END) as approved,
          SUM(CASE WHEN submission_status = 'draft' THEN 1 ELSE 0 END) as draft,
          SUM(CASE WHEN submission_status = 'rejected' THEN 1 ELSE 0 END) as rejected
         FROM tbl_submissions WHERE client_id = ?`,
        [clientId],
      ),

      // Compliance status
      query(
        `SELECT 
          SUM(CASE WHEN compliance_status = 'compliant' THEN 1 ELSE 0 END) as compliant,
          SUM(CASE WHEN compliance_status = 'non_compliant' THEN 1 ELSE 0 END) as non_compliant,
          SUM(CASE WHEN compliance_status = 'action_required' THEN 1 ELSE 0 END) as action_required
         FROM tbl_compliance_status WHERE client_id = ?`,
        [clientId],
      ),

      // Deadline urgency
      query(
        `SELECT 
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) <= 30 AND is_completed = FALSE THEN 1 ELSE 0 END) as critical,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) BETWEEN 31 AND 60 AND is_completed = FALSE THEN 1 ELSE 0 END) as high,
          SUM(CASE WHEN DATEDIFF(due_date, CURDATE()) > 60 AND is_completed = FALSE THEN 1 ELSE 0 END) as medium,
          SUM(CASE WHEN is_completed = TRUE THEN 1 ELSE 0 END) as completed
         FROM tbl_reminders WHERE client_id = ?`,
        [clientId],
      ),

      // Recent activity (last 30 days)
      query(
        `SELECT COUNT(*) as audit_events FROM tbl_audit_log 
         WHERE client_id = ? AND timestamp >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)`,
        [clientId],
      ),
    ])

    const [facilities, products, submissions, compliance, deadlines, activity] = results.map((r) =>
      Array.isArray(r) ? r[0] : r,
    )

    return NextResponse.json({
      facilities,
      products,
      submissions,
      compliance,
      deadlines,
      activity,
    })
  } catch (error) {
    console.error("[v0] Compliance summary error:", error)
    return NextResponse.json({ error: "Failed to fetch analytics" }, { status: 500 })
  }
}
