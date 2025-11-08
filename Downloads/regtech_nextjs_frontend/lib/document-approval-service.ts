/**
 * Document Approval Workflow Service
 * Implements multi-step approval workflows for regulatory documents
 * Integrates with 21 CFR Part 11 electronic signatures
 */

import { query } from "./db"
import { createAuditLog } from "./audit"
import { createElectronicSignature } from "./cfr-part-11"
import { v4 as uuidv4 } from "uuid"

export type WorkflowType = "renewal" | "submission" | "registration" | "certification"
export type ApprovalStatus = "pending" | "approved" | "rejected" | "withdrawn"

/**
 * Create an approval workflow for a document
 */
export async function createApprovalWorkflow(params: {
  clientId: string
  documentId: string
  workflowType: WorkflowType
  requiredApprovers: string[] // User IDs of required approvers
  createdBy: string
}): Promise<any> {
  try {
    const workflowId = uuidv4()

    await query(
      `INSERT INTO tbl_approval_workflows 
       (id, client_id, document_id, workflow_type, required_approvers, status)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [workflowId, params.clientId, params.documentId, params.workflowType, params.requiredApprovers.length, "pending"],
    )

    for (let i = 0; i < params.requiredApprovers.length; i++) {
      const stepId = uuidv4()
      await query(
        `INSERT INTO tbl_approval_steps 
         (id, approval_workflow_id, step_number, assigned_to, status)
         VALUES (?, ?, ?, ?, ?)`,
        [stepId, workflowId, i + 1, params.requiredApprovers[i], "pending"],
      )
    }

    await createAuditLog({
      clientId: params.clientId,
      userId: params.createdBy,
      action: "CREATE",
      entityType: "APPROVAL_WORKFLOW",
      entityId: workflowId,
      newValues: {
        workflow_type: params.workflowType,
        approvers_count: params.requiredApprovers.length,
      },
      reasonForChange: `Approval workflow created for ${params.workflowType}`,
    })

    return {
      workflowId,
      stepsCount: params.requiredApprovers.length,
      status: "pending",
    }
  } catch (error) {
    console.error("[v0] Error creating approval workflow:", error)
    throw error
  }
}

/**
 * Get pending approvals for a user
 */
export async function getPendingApprovalsForUser(userId: string): Promise<any[]> {
  try {
    const approvals = await query(
      `SELECT 
        ast.id as step_id,
        ast.approval_workflow_id,
        ast.step_number,
        ast.required_role,
        aw.document_id,
        aw.workflow_type,
        aw.client_id,
        d.document_name,
        c.organization_name,
        ast.assigned_date,
        ast.status,
        aw.created_at as createdDate,
        DATE_ADD(ast.assigned_date, INTERVAL 7 DAY) as dueDate,
        ast.step_number as currentStep,
        (SELECT COUNT(*) FROM tbl_approval_steps WHERE approval_workflow_id = aw.id) as totalSteps,
        (SELECT CONCAT(first_name, ' ', last_name) FROM tbl_users WHERE id = ast.assigned_to) as currentApprover,
        d.document_name as documentName
       FROM tbl_approval_steps ast
       JOIN tbl_approval_workflows aw ON ast.approval_workflow_id = aw.id
       JOIN tbl_documents d ON aw.document_id = d.id
       JOIN tbl_clients c ON aw.client_id = c.id
       WHERE ast.assigned_to = ?
       AND ast.status = 'pending'
       ORDER BY ast.assigned_date DESC`,
      [userId],
    )

    if (!Array.isArray(approvals)) {
      console.error("[v0] getPendingApprovalsForUser returned non-array:", approvals)
      return []
    }

    return approvals
  } catch (error) {
    console.error("[v0] Error fetching pending approvals:", error)
    return []
  }
}

/**
 * Approve a document step
 */
export async function approveDocumentStep(params: {
  clientId: string
  stepId: string
  approvedBy: string
  approvalComment?: string
  documentContent: string
  intentToSign: string
}): Promise<any> {
  try {
    const stepResult = await query(`SELECT * FROM tbl_approval_steps WHERE id = ?`, [params.stepId])

    if (!Array.isArray(stepResult) || stepResult.length === 0) {
      throw new Error("Approval step not found")
    }

    const step = stepResult[0]

    const workflowResult = await query(`SELECT * FROM tbl_approval_workflows WHERE id = ?`, [step.approval_workflow_id])

    if (!Array.isArray(workflowResult) || workflowResult.length === 0) {
      throw new Error("Approval workflow not found")
    }

    const workflow = workflowResult[0]

    const signature = await createElectronicSignature({
      documentId: workflow.document_id,
      signedBy: params.approvedBy,
      clientId: params.clientId,
      intentToSign: params.intentToSign,
      documentContent: params.documentContent,
    })

    await query(
      `UPDATE tbl_approval_steps 
       SET status = 'approved', e_signature_id = ?, approval_comment = ?, completed_date = NOW()
       WHERE id = ?`,
      [signature.id, params.approvalComment || null, params.stepId],
    )

    const allSteps = await query(
      `SELECT COUNT(*) as total, SUM(CASE WHEN status = 'approved' THEN 1 ELSE 0 END) as approved
       FROM tbl_approval_steps WHERE approval_workflow_id = ?`,
      [step.approval_workflow_id],
    )

    const stepsResult = Array.isArray(allSteps) ? allSteps[0] : allSteps

    let workflowComplete = false
    if (stepsResult.total === stepsResult.approved) {
      await query(`UPDATE tbl_approval_workflows SET status = 'approved', updated_at = NOW() WHERE id = ?`, [
        step.approval_workflow_id,
      ])
      workflowComplete = true
    }

    await createAuditLog({
      clientId: params.clientId,
      userId: params.approvedBy,
      action: "APPROVE",
      entityType: "DOCUMENT_APPROVAL",
      entityId: params.stepId,
      newValues: {
        step_number: step.step_number,
        signature_id: signature.id,
        workflow_status: workflowComplete ? "completed" : "in_progress",
      },
      reasonForChange: `Document step ${step.step_number} approved with e-signature`,
    })

    return {
      stepApproved: true,
      signatureId: signature.id,
      workflowComplete,
      nextStep: workflowComplete ? null : step.step_number + 1,
    }
  } catch (error) {
    console.error("[v0] Error approving document step:", error)
    throw error
  }
}

/**
 * Reject a document step
 */
export async function rejectDocumentStep(params: {
  clientId: string
  stepId: string
  rejectedBy: string
  rejectionReason: string
}): Promise<any> {
  try {
    const stepResult = await query(
      `SELECT ast.*, aw.id as workflow_id 
       FROM tbl_approval_steps ast
       JOIN tbl_approval_workflows aw ON ast.approval_workflow_id = aw.id
       WHERE ast.id = ?`,
      [params.stepId],
    )

    if (!Array.isArray(stepResult) || stepResult.length === 0) {
      throw new Error("Approval step not found")
    }

    const step = stepResult[0]

    await query(
      `UPDATE tbl_approval_steps 
       SET status = 'rejected', approval_comment = ?, completed_date = NOW()
       WHERE id = ?`,
      [params.rejectionReason, params.stepId],
    )

    await query(`UPDATE tbl_approval_workflows SET status = 'rejected', updated_at = NOW() WHERE id = ?`, [
      step.workflow_id,
    ])

    await createAuditLog({
      clientId: params.clientId,
      userId: params.rejectedBy,
      action: "REJECT",
      entityType: "DOCUMENT_APPROVAL",
      entityId: params.stepId,
      newValues: {
        step_number: step.step_number,
        rejection_reason: params.rejectionReason,
      },
      reasonForChange: `Document approval rejected at step ${step.step_number}`,
    })

    return {
      stepRejected: true,
      workflowStatus: "rejected",
      message: "Approval has been rejected. Document cannot proceed to submission.",
    }
  } catch (error) {
    console.error("[v0] Error rejecting document step:", error)
    throw error
  }
}

/**
 * Get approval workflow status
 */
export async function getApprovalWorkflowStatus(workflowId: string): Promise<any> {
  try {
    const workflowResult = await query(`SELECT * FROM tbl_approval_workflows WHERE id = ?`, [workflowId])

    if (!Array.isArray(workflowResult) || workflowResult.length === 0) {
      throw new Error("Workflow not found")
    }

    const workflow = workflowResult[0]

    const stepsResult = await query(
      `SELECT * FROM tbl_approval_steps 
       WHERE approval_workflow_id = ? 
       ORDER BY step_number ASC`,
      [workflowId],
    )

    const steps = Array.isArray(stepsResult) ? stepsResult : []

    const approved = steps.filter((s) => s.status === "approved").length
    const rejected = steps.filter((s) => s.status === "rejected").length
    const pending = steps.filter((s) => s.status === "pending").length

    return {
      workflowId,
      workflowType: workflow.workflow_type,
      status: workflow.status,
      createdAt: workflow.created_at,
      completedAt: workflow.completed_at,
      totalSteps: steps.length,
      approved,
      rejected,
      pending,
      steps: steps.map((s) => ({
        stepNumber: s.step_number,
        assignedTo: s.assigned_to,
        status: s.status,
        completedDate: s.completed_date,
        comment: s.approval_comment,
      })),
    }
  } catch (error) {
    console.error("[v0] Error getting workflow status:", error)
    throw error
  }
}

/**
 * Check if document is ready for submission (all approvals complete)
 */
export async function isDocumentReadyForSubmission(documentId: string): Promise<boolean> {
  try {
    const workflows = await query(`SELECT * FROM tbl_approval_workflows WHERE document_id = ?`, [documentId])

    if (!Array.isArray(workflows) || workflows.length === 0) {
      return true // No approvals required
    }

    const allApproved = (workflows as any[]).every((w) => w.status === "approved")

    return allApproved
  } catch (error) {
    console.error("[v0] Error checking document submission readiness:", error)
    return false
  }
}

/**
 * Get all approvals for a document (audit trail)
 */
export async function getDocumentApprovalHistory(documentId: string): Promise<any[]> {
  try {
    return await query(
      `SELECT 
        aw.id as workflow_id,
        aw.workflow_type,
        ast.step_number,
        ast.assigned_to,
        ast.status,
        ast.approval_comment,
        ast.completed_date,
        es.certificate_serial,
        es.signature_time
       FROM tbl_approval_workflows aw
       LEFT JOIN tbl_approval_steps ast ON aw.id = ast.approval_workflow_id
       LEFT JOIN tbl_e_signatures es ON ast.e_signature_id = es.id
       WHERE aw.document_id = ?
       ORDER BY aw.created_at DESC, ast.step_number ASC`,
      [documentId],
    )
  } catch (error) {
    console.error("[v0] Error fetching document approval history:", error)
    return []
  }
}
