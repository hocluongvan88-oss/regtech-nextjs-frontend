/**
 * Secure database operations with automatic encryption/decryption
 * Handles sensitive fields: contact info, technical files, organizational data
 */

import { query } from "./db"
import { encryptField, decryptField } from "./encryption"

// Fields that should be encrypted at rest
const ENCRYPTED_FIELDS_BY_TABLE: Record<string, string[]> = {
  tbl_client_facilities: ["primary_contact_email", "primary_contact_phone", "primary_contact_name"],
  tbl_clients: ["organization_name"], // High-value target
  tbl_documents: ["file_content"], // Technical files
  tbl_compliance_status: ["notes"],
}

/**
 * Insert a record with automatic field encryption
 */
export async function encryptedInsert(table: string, data: Record<string, any>): Promise<any> {
  const encryptedData = { ...data }
  const fieldsToEncrypt = ENCRYPTED_FIELDS_BY_TABLE[table] || []

  for (const field of fieldsToEncrypt) {
    if (field in encryptedData && encryptedData[field]) {
      encryptedData[field] = encryptField(encryptedData[field])
    }
  }

  return query(`INSERT INTO ${table} SET ?`, [encryptedData])
}

/**
 * Select with automatic field decryption
 */
export async function encryptedSelect(table: string, whereClause: string, params: any[] = []): Promise<any> {
  const result = await query(`SELECT * FROM ${table} WHERE ${whereClause}`, params)

  const fieldsToDecrypt = ENCRYPTED_FIELDS_BY_TABLE[table] || []

  if (Array.isArray(result)) {
    return result.map((record) => {
      const decrypted = { ...record }
      for (const field of fieldsToDecrypt) {
        if (field in decrypted && decrypted[field]) {
          decrypted[field] = decryptField(decrypted[field])
        }
      }
      return decrypted
    })
  }

  return result
}

/**
 * Update with automatic field encryption
 */
export async function encryptedUpdate(
  table: string,
  data: Record<string, any>,
  whereClause: string,
  params: any[] = [],
): Promise<any> {
  const encryptedData = { ...data }
  const fieldsToEncrypt = ENCRYPTED_FIELDS_BY_TABLE[table] || []

  for (const field of fieldsToEncrypt) {
    if (field in encryptedData && encryptedData[field]) {
      encryptedData[field] = encryptField(encryptedData[field])
    }
  }

  const setClause = Object.keys(encryptedData)
    .map((key) => `${key} = ?`)
    .join(", ")

  return query(`UPDATE ${table} SET ${setClause} WHERE ${whereClause}`, [...Object.values(encryptedData), ...params])
}
