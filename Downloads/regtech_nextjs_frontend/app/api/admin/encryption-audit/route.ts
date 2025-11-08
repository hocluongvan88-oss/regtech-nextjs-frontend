import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

/**
 * Application-layer encryption audit endpoint
 * Handles audit logging that SQL parser couldn't handle due to #1054 errors
 */
export async function POST(request: NextRequest) {
  try {
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"

    if (!isSystemAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    console.log("[v0] Starting encryption audit...")

    // Step 1: Ensure encryption flags exist
    try {
      await query(`
        ALTER TABLE tbl_users 
        ADD COLUMN IF NOT EXISTS first_name_encrypted BOOLEAN DEFAULT TRUE,
        ADD COLUMN IF NOT EXISTS last_name_encrypted BOOLEAN DEFAULT TRUE
      `)
    } catch (alterError) {
      console.log("[v0] Encryption flags may already exist, continuing...")
    }

    // Step 2: Get all users with potentially corrupted data
    const users = (await query(`
      SELECT id, first_name, last_name, first_name_encrypted, last_name_encrypted
      FROM tbl_users
      WHERE deleted_at IS NULL
    `)) as any[]

    const auditResults = {
      totalUsers: users.length,
      corruptedFirstName: 0,
      corruptedLastName: 0,
      flagsUpdated: 0,
      errors: [] as string[],
    }

    // Step 3: Check each user and update flags if needed
    for (const user of users) {
      let needsUpdate = false
      const updates: string[] = []
      const values: any[] = []

      // Check first_name format
      if (user.first_name && !isValidEncryptedFormat(user.first_name)) {
        console.log(`[v0] User ${user.id}: first_name is not encrypted`)
        auditResults.corruptedFirstName++
        needsUpdate = true
        updates.push("first_name_encrypted = ?")
        values.push(false)
      }

      // Check last_name format
      if (user.last_name && !isValidEncryptedFormat(user.last_name)) {
        console.log(`[v0] User ${user.id}: last_name is not encrypted`)
        auditResults.corruptedLastName++
        needsUpdate = true
        updates.push("last_name_encrypted = ?")
        values.push(false)
      }

      // Update flags if corrupted data found
      if (needsUpdate) {
        try {
          await query(`UPDATE tbl_users SET ${updates.join(", ")} WHERE id = ?`, [...values, user.id])
          auditResults.flagsUpdated++
        } catch (updateError: any) {
          auditResults.errors.push(`User ${user.id}: ${updateError.message}`)
        }
      }
    }

    console.log("[v0] Encryption audit completed:", auditResults)

    return NextResponse.json({
      success: true,
      audit: auditResults,
      message: `Audited ${auditResults.totalUsers} users. Found ${auditResults.corruptedFirstName} corrupted first names and ${auditResults.corruptedLastName} corrupted last names. Updated ${auditResults.flagsUpdated} records.`,
    })
  } catch (error: any) {
    console.error("[v0] Encryption audit error:", error)
    return NextResponse.json(
      {
        error: "Failed to run encryption audit",
        details: error.message,
      },
      { status: 500 },
    )
  }
}

/**
 * Check if data is in valid encrypted format (iv:tag:encrypted)
 */
function isValidEncryptedFormat(data: string): boolean {
  if (!data) return false
  const parts = data.split(":")
  // Valid encrypted data has exactly 3 parts: iv, tag, encrypted
  return parts.length === 3 && parts[0].length > 0 && parts[1].length > 0 && parts[2].length > 0
}

export async function GET(request: NextRequest) {
  try {
    const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"

    if (!isSystemAdmin) {
      return NextResponse.json({ error: "Unauthorized - Admin only" }, { status: 401 })
    }

    // Get summary of encryption status
    const summary = (await query(`
      SELECT 
        COUNT(*) as total_users,
        SUM(CASE WHEN first_name_encrypted = FALSE THEN 1 ELSE 0 END) as plaintext_first_names,
        SUM(CASE WHEN last_name_encrypted = FALSE THEN 1 ELSE 0 END) as plaintext_last_names
      FROM tbl_users
      WHERE deleted_at IS NULL
    `)) as any[]

    return NextResponse.json({
      summary: summary[0] || {},
      recommendation: "Run POST /api/admin/encryption-audit to scan and flag corrupted data",
    })
  } catch (error: any) {
    console.error("[v0] Encryption audit summary error:", error)
    return NextResponse.json(
      {
        error: "Failed to get encryption audit summary",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
