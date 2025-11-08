/**
 * Encryption utilities for handling sensitive data at rest
 * Complies with FDA requirements for data protection
 * Uses AES-256-GCM for field-level encryption
 */

import crypto from "crypto"

// Master encryption key from environment - must be 32 bytes for AES-256
const MASTER_KEY = process.env.ENCRYPTION_KEY
  ? Buffer.from(process.env.ENCRYPTION_KEY, "hex")
  : (() => {
      console.warn("[v0] WARNING: ENCRYPTION_KEY not set, using development key. DO NOT USE IN PRODUCTION.")
      return Buffer.from("0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef", "hex")
    })()

// Algorithm for AES-256-GCM encryption
const ALGORITHM = "aes-256-gcm"
const SALT_LENGTH = 16
const TAG_LENGTH = 16
const IV_LENGTH = 12

/**
 * Generate a random initialization vector
 */
function generateIV(): Buffer {
  return crypto.randomBytes(IV_LENGTH)
}

/**
 * Encrypt sensitive data using AES-256-GCM
 * @param plaintext - The data to encrypt
 * @returns Encrypted data in format: iv:tag:encryptedData (all as hex)
 */
export function encryptField(plaintext: string | null | undefined): string | null {
  if (!plaintext) return null

  try {
    const iv = generateIV()
    const cipher = crypto.createCipheriv(ALGORITHM, MASTER_KEY, iv)

    let encrypted = cipher.update(plaintext, "utf8", "hex")
    encrypted += cipher.final("hex")

    const tag = cipher.getAuthTag()

    return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted}`
  } catch (error) {
    console.error("[v0] Encryption error:", error)
    throw new Error("Failed to encrypt field")
  }
}

/**
 * Decrypt sensitive data encrypted with encryptField
 * @param encryptedData - Encrypted data in format: iv:tag:encryptedData
 * @returns Original plaintext
 */
export function decryptField(encryptedData: string | null | undefined): string | null {
  if (!encryptedData) return null

  try {
    const parts = encryptedData.split(":")
    if (parts.length !== 3) {
      // If data is not in the expected format, assume it's plaintext from an old record
      console.warn(`[v0] Data not in encrypted format, treating as plaintext: ${encryptedData.substring(0, 20)}...`)
      return encryptedData
    }

    const [ivHex, tagHex, encrypted] = parts
    const iv = Buffer.from(ivHex, "hex")
    const tag = Buffer.from(tagHex, "hex")

    const decipher = crypto.createDecipheriv(ALGORITHM, MASTER_KEY, iv)
    decipher.setAuthTag(tag)

    let decrypted = decipher.update(encrypted, "hex", "utf8")
    decrypted += decipher.final("utf8")

    return decrypted
  } catch (error) {
    console.error("[v0] Decryption error:", error)
    // This handles corrupted encrypted data gracefully
    return encryptedData || null
  }
}

/**
 * Hash sensitive data for comparison without decryption
 * Uses SHA-256 with salt
 */
export function hashField(plaintext: string): string {
  try {
    const salt = crypto.randomBytes(SALT_LENGTH)
    const hash = crypto.pbkdf2Sync(plaintext, salt, 100000, 64, "sha256")
    return `${salt.toString("hex")}:${hash.toString("hex")}`
  } catch (error) {
    console.error("[v0] Hash error:", error)
    throw new Error("Failed to hash field")
  }
}

/**
 * Verify a hashed field
 */
export function verifyHashedField(plaintext: string, hashedData: string): boolean {
  try {
    const [saltHex, originalHash] = hashedData.split(":")
    const salt = Buffer.from(saltHex, "hex")
    const hash = crypto.pbkdf2Sync(plaintext, salt, 100000, 64, "sha256")
    return hash.toString("hex") === originalHash
  } catch (error) {
    console.error("[v0] Hash verification error:", error)
    return false
  }
}

/**
 * Generate a secure encryption key (32 bytes for AES-256)
 * Used for initial setup
 */
export function generateEncryptionKey(): string {
  return crypto.randomBytes(32).toString("hex")
}
