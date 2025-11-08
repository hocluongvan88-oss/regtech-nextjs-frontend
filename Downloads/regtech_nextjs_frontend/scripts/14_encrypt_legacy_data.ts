/**
 * Migration script to encrypt legacy plaintext PII data
 * Run ONCE after ENCRYPTION_KEY environment variable is set
 *
 * Usage:
 * npx ts-node scripts/14_encrypt_legacy_data.ts
 */

import { query } from "@/lib/db"
import { encryptField } from "@/lib/encryption"

export async function migrateLegacyEncryption() {
  console.log("[v0] Starting legacy data encryption migration...")

  try {
    // Find all users with unencrypted data
    const users: any[] = await query(
      `SELECT id, first_name, last_name, first_name_encrypted, last_name_encrypted 
       FROM tbl_users 
       WHERE (first_name_encrypted = 0 OR first_name_encrypted IS NULL) 
       AND first_name IS NOT NULL`,
    )

    console.log(`[v0] Found ${users.length} users with plaintext first_name`)

    let processedCount = 0

    for (const user of users) {
      try {
        const encryptedFirstName = encryptField(user.first_name)
        const encryptedLastName = encryptField(user.last_name)

        await query(
          `UPDATE tbl_users 
           SET first_name = ?, 
               last_name = ?, 
               first_name_encrypted = 1, 
               last_name_encrypted = 1
           WHERE id = ?`,
          [encryptedFirstName, encryptedLastName, user.id],
        )

        processedCount++
        if (processedCount % 100 === 0) {
          console.log(`[v0] Processed ${processedCount}/${users.length} users`)
        }
      } catch (error) {
        console.error(`[v0] Failed to encrypt user ${user.id}:`, error)
      }
    }

    console.log(`[v0] Migration complete! Encrypted ${processedCount} users`)
  } catch (error) {
    console.error("[v0] Migration failed:", error)
    throw error
  }
}

// Run if called directly
migrateLegacyEncryption().catch(console.error)
