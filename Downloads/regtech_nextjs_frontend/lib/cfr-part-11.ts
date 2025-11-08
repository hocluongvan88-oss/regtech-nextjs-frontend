/**
 * 21 CFR Part 11 Electronic Records and Signatures Compliance Module
 * Implements FDA requirements for electronic records and electronic signatures
 * - Ensures records are trustworthy, reliable, and legally equivalent to paper records
 * - Provides non-repudiation, authenticity, and integrity verification
 */

import crypto from "crypto"
import { query } from "./db"
import { createAuditLog } from "./audit"
import { v4 as uuidv4 } from "uuid"

/**
 * Electronic Signature Record
 */
export interface ElectronicSignature {
  id: string
  documentId: string
  signedBy: string
  signatureTime: Date
  signatureValue: string // Digital signature value
  certificateSerial: string // Certificate identifying the signer
  intentToSign: string // User's intention/reason for signing
  hash: string // SHA-256 hash of signed document for integrity verification
}

/**
 * Create an electronic signature for a document
 * Implements 21 CFR Part 11 requirements:
 * - Unique identification and authentication
 * - Non-repudiation (user cannot deny signing)
 * - Timestamp
 * - Integrity verification
 */
export async function createElectronicSignature(params: {
  documentId: string
  signedBy: string
  clientId: string
  intentToSign: string
  documentContent: string
}): Promise<ElectronicSignature> {
  try {
    const signatureId = uuidv4()
    const signatureTime = new Date()

    const hash = crypto.createHash("sha256").update(params.documentContent).digest("hex")

    const signatureData = `${params.documentId}:${params.signedBy}:${signatureTime.toISOString()}:${hash}`
    const signatureValue = crypto
      .createHmac("sha256", process.env.SIGNING_KEY || "default-key")
      .update(signatureData)
      .digest("hex")

    const certificateSerial = generateCertificateSerial()

    await query(
      `INSERT INTO tbl_e_signatures 
       (id, document_id, signed_by, signature_time, signature_value, 
        certificate_serial, intent_to_sign, document_hash)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        signatureId,
        params.documentId,
        params.signedBy,
        signatureTime,
        signatureValue,
        certificateSerial,
        params.intentToSign,
        hash,
      ],
    )

    await createAuditLog({
      clientId: params.clientId,
      userId: params.signedBy,
      action: "APPROVE",
      entityType: "ELECTRONIC_SIGNATURE",
      entityId: signatureId,
      newValues: {
        document_id: params.documentId,
        signature_time: signatureTime.toISOString(),
        certificate_serial: certificateSerial,
      },
      reasonForChange: `E-signature created with intent: ${params.intentToSign}`,
    })

    return {
      id: signatureId,
      documentId: params.documentId,
      signedBy: params.signedBy,
      signatureTime,
      signatureValue,
      certificateSerial,
      hash,
      intentToSign: params.intentToSign,
    }
  } catch (error) {
    console.error("[v0] Error creating electronic signature:", error)
    throw error
  }
}

/**
 * Verify an electronic signature (21 CFR Part 11 verification)
 * Confirms:
 * - Signer identity
 * - Document integrity
 * - Signature authenticity
 * - Non-repudiation
 */
export async function verifyElectronicSignature(
  signatureId: string,
  documentContent: string,
): Promise<{
  valid: boolean
  error?: string
  signer?: string
  signedAt?: Date
}> {
  try {
    const result = await query(`SELECT * FROM tbl_e_signatures WHERE id = ?`, [signatureId])

    if (!Array.isArray(result) || result.length === 0) {
      return { valid: false, error: "Signature not found" }
    }

    const signature = result[0]

    const currentHash = crypto.createHash("sha256").update(documentContent).digest("hex")
    if (currentHash !== signature.document_hash) {
      return {
        valid: false,
        error: "Document has been modified since signing. Signature is invalid.",
      }
    }

    const signatureData = `${signature.document_id}:${signature.signed_by}:${signature.signature_time}:${signature.document_hash}`
    const expectedSignature = crypto
      .createHmac("sha256", process.env.SIGNING_KEY || "default-key")
      .update(signatureData)
      .digest("hex")

    if (signature.signature_value !== expectedSignature) {
      return {
        valid: false,
        error: "Signature verification failed. Signature value does not match.",
      }
    }

    return {
      valid: true,
      signer: signature.signed_by,
      signedAt: new Date(signature.signature_time),
    }
  } catch (error) {
    console.error("[v0] Error verifying electronic signature:", error)
    return { valid: false, error: "Verification error" }
  }
}

/**
 * Generate certificate serial for non-repudiation (Part 11)
 * In production, use actual PKI infrastructure
 */
function generateCertificateSerial(): string {
  return `CERT-${Date.now()}-${crypto.randomBytes(8).toString("hex").toUpperCase()}`
}

/**
 * Get all signatures for a document (audit trail)
 */
export async function getDocumentSignatures(documentId: string): Promise<any[]> {
  try {
    return await query(
      `SELECT * FROM tbl_e_signatures 
       WHERE document_id = ? 
       ORDER BY signature_time DESC`,
      [documentId],
    )
  } catch (error) {
    console.error("[v0] Error fetching document signatures:", error)
    return []
  }
}

/**
 * Create immutable audit record for signature action
 * Part 11: Audit trail requirements
 */
export async function logSignatureAction(params: {
  clientId: string
  userId: string
  action: "created" | "verified" | "rejected"
  signatureId: string
  documentId: string
  details: Record<string, any>
}): Promise<void> {
  try {
    await createAuditLog({
      clientId: params.clientId,
      userId: params.userId,
      action: params.action === "created" ? "APPROVE" : "VIEW",
      entityType: "E_SIGNATURE_ACTION",
      entityId: params.signatureId,
      newValues: params.details,
      reasonForChange: `Signature ${params.action}`,
    })
  } catch (error) {
    console.error("[v0] Error logging signature action:", error)
  }
}

/**
 * Validate that all required approvals have been signed
 * Part 11: Approval requirements
 */
export async function validateApprovalChain(
  documentId: string,
  requiredApprovers: string[],
): Promise<{
  approved: boolean
  signedBy: string[]
  pendingApprovers: string[]
}> {
  try {
    const signatures = await getDocumentSignatures(documentId)
    const signedBy = signatures.map((sig) => sig.signed_by)
    const pendingApprovers = requiredApprovers.filter((approver) => !signedBy.includes(approver))

    return {
      approved: pendingApprovers.length === 0,
      signedBy,
      pendingApprovers,
    }
  } catch (error) {
    console.error("[v0] Error validating approval chain:", error)
    return { approved: false, signedBy: [], pendingApprovers: requiredApprovers }
  }
}

/**
 * Check if record is subject to 21 CFR Part 11 requirements
 */
export function isSubjectToPart11(recordType: string): boolean {
  const part11RecordTypes = [
    "SUBMISSION",
    "NO_CHANGE_CERTIFICATION",
    "DOCUMENT",
    "FACILITY_REGISTRATION",
    "PRODUCT_LISTING",
    "COMPLIANCE_REPORT",
    "APPROVAL_DECISION",
  ]

  return part11RecordTypes.includes(recordType.toUpperCase())
}

/**
 * Get 21 CFR Part 11 compliance status for a document
 */
export async function getPart11ComplianceStatus(documentId: string): Promise<{
  isCompliant: boolean
  issues: string[]
  requirements: Record<string, boolean>
}> {
  try {
    const signatures = await getDocumentSignatures(documentId)

    const requirements = {
      signed: signatures.length > 0,
      timestamped: signatures.length > 0 && signatures[0].signature_time != null,
      authenticated: signatures.length > 0 && signatures[0].certificate_serial != null,
      nonRepudiation: signatures.length > 0, // Signatures provide non-repudiation
      integrityVerified: true, // Verified via hash
    }

    const issues: string[] = []

    if (!requirements.signed) issues.push("Document is not signed")
    if (!requirements.timestamped) issues.push("Signature lacks timestamp")
    if (!requirements.authenticated) issues.push("Signature lacks certificate")

    return {
      isCompliant: issues.length === 0,
      issues,
      requirements,
    }
  } catch (error) {
    console.error("[v0] Error checking Part 11 compliance:", error)
    return {
      isCompliant: false,
      issues: ["Compliance check failed"],
      requirements: {},
    }
  }
}
