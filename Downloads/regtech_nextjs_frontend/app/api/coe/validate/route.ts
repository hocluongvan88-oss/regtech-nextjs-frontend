import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { facilityId, productId, clientId } = body

    const errors: string[] = []
    const warnings: string[] = []

    // Check 1: Facility must be registered
    const facilityResult: any = await query(
      `SELECT registration_status FROM tbl_client_facilities WHERE id = ? AND client_id = ?`,
      [facilityId, clientId],
    )

    const facility = Array.isArray(facilityResult) ? facilityResult[0] : facilityResult

    if (!facility) {
      errors.push("Facility not found")
    } else if (facility.registration_status !== "registered") {
      errors.push("Facility must be registered with FDA before COE can be issued")
    }

    // Check 2: Product must be listed
    const productResult: any = await query(
      `SELECT p.* FROM tbl_products p
       WHERE p.id = ? AND p.client_id = ? AND p.status = 'active'`,
      [productId, clientId],
    )

    const product = Array.isArray(productResult) ? productResult[0] : productResult

    if (!product) {
      errors.push("Product not found or not active")
    }

    // Check 3: Product must not be under open recall
    if (product) {
      const recallCheck: any = await query(
        `SELECT id FROM tbl_reminders 
         WHERE reminder_type = 'recall' AND reminder_description LIKE ? AND is_completed = FALSE`,
        [`%${productId}%`],
      )

      if (recallCheck && (Array.isArray(recallCheck) ? recallCheck.length > 0 : recallCheck)) {
        errors.push("Product is currently under an open recall - COE cannot be issued")
      }
    }

    // Check 4: No pending compliance issues
    const complianceCheck: any = await query(
      `SELECT COUNT(*) as count FROM tbl_compliance_status 
       WHERE facility_id = ? AND compliance_status = 'action_required'`,
      [facilityId],
    )

    const complianceCount = Array.isArray(complianceCheck) ? complianceCheck[0]?.count : complianceCheck?.count

    if (complianceCount > 0) {
      warnings.push("Facility has pending compliance actions that should be resolved")
    }

    return NextResponse.json({
      valid: errors.length === 0,
      errors,
      warnings,
      readyForSubmission: errors.length === 0,
    })
  } catch (error) {
    console.error("[v0] COE validation error:", error)
    return NextResponse.json({ error: "Failed to validate COE requirements" }, { status: 500 })
  }
}
