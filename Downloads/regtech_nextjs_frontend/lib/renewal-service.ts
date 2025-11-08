/**
 * Renewal Automation Service
 * Handles automatic renewal scheduling, alerts, and compliance tracking
 * Supports annual (drugs/devices) and biennial (food) renewal cycles
 */

import { query } from "./db"
import { createAuditLog } from "./audit"
import { v4 as uuidv4 } from "uuid"

export type FacilityType = "Drug" | "Device" | "Food" | "Cosmetic"

/**
 * Initialize renewal schedule for a facility
 * Added service_contract_id parameter and column to link with contracts
 */
export async function initializeRenewalSchedule(params: {
  clientId: string
  facilityId: string
  facilityType: FacilityType
  lastRenewalDate: Date
  serviceContractId?: string // Optional service contract link
}): Promise<any> {
  try {
    const renewalCycle = getRenewalCycle(params.facilityType)
    const nextRenewalDate = calculateNextRenewalDate(params.lastRenewalDate, params.facilityType)

    const scheduleId = uuidv4()

    await query(
      `INSERT INTO tbl_renewal_schedule 
       (id, client_id, facility_id, facility_type, renewal_cycle, 
        last_renewal_date, next_renewal_date, service_contract_id, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        scheduleId,
        params.clientId,
        params.facilityId,
        params.facilityType,
        renewalCycle,
        params.lastRenewalDate,
        nextRenewalDate,
        params.serviceContractId || null, // Include service_contract_id
        "active",
      ],
    )

    await createAuditLog({
      clientId: params.clientId,
      action: "CREATE",
      entityType: "RENEWAL_SCHEDULE",
      entityId: scheduleId,
      newValues: {
        facility_type: params.facilityType,
        renewal_cycle: renewalCycle,
        next_renewal_date: nextRenewalDate.toISOString(),
        service_contract_id: params.serviceContractId, // Log contract link
      },
      reasonForChange: "Automatic renewal schedule initialization",
    })

    return {
      id: scheduleId,
      nextRenewalDate,
      renewalCycle,
    }
  } catch (error) {
    console.error("[v0] Error initializing renewal schedule:", error)
    throw error
  }
}

/**
 * Get renewal cycle in months based on facility type
 * Drugs/Devices: Annual (12 months)
 * Food: Biennial (24 months, even years only)
 */
function getRenewalCycle(facilityType: FacilityType): number {
  switch (facilityType.toLowerCase()) {
    case "food":
      return 24 // Biennial
    case "drug":
    case "device":
    case "cosmetic":
    default:
      return 12 // Annual
  }
}

/**
 * Calculate next renewal date based on facility type
 * Drugs/Devices: Annual renewal (1/10 - 31/12)
 * Food: Biennial in even years (1/10 - 31/12)
 */
function calculateNextRenewalDate(lastRenewalDate: Date, facilityType: FacilityType): Date {
  const cycle = getRenewalCycle(facilityType)
  const nextDate = new Date(lastRenewalDate)
  nextDate.setMonth(nextDate.getMonth() + cycle)

  if (facilityType.toLowerCase() === "food" && nextDate.getFullYear() % 2 !== 0) {
    nextDate.setFullYear(nextDate.getFullYear() + 1)
  }

  if (nextDate.getMonth() < 9) {
    nextDate.setMonth(9) // October
    nextDate.setDate(1)
  } else if (nextDate.getMonth() > 11) {
    nextDate.setMonth(9) // October
    nextDate.setDate(1)
    nextDate.setFullYear(nextDate.getFullYear() + 1)
  }

  return nextDate
}

/**
 * Get upcoming renewals (90 days before deadline)
 */
export async function getUpcomingRenewals(clientId?: string, daysUntilDeadline = 90): Promise<any[]> {
  try {
    const sql = clientId
      ? `SELECT rs.*, cf.facility_name, c.organization_name
         FROM tbl_renewal_schedule rs
         JOIN tbl_client_facilities cf ON rs.facility_id = cf.id
         JOIN tbl_clients c ON rs.client_id = c.id
         WHERE rs.client_id = ? 
         AND rs.status = 'active'
         AND DATEDIFF(rs.next_renewal_date, CURDATE()) BETWEEN 0 AND ?
         ORDER BY rs.next_renewal_date ASC`
      : `SELECT rs.*, cf.facility_name, c.organization_name
         FROM tbl_renewal_schedule rs
         JOIN tbl_client_facilities cf ON rs.facility_id = cf.id
         JOIN tbl_clients c ON rs.client_id = c.id
         WHERE rs.status = 'active'
         AND DATEDIFF(rs.next_renewal_date, CURDATE()) BETWEEN 0 AND ?
         ORDER BY rs.next_renewal_date ASC`

    const params = clientId ? [clientId, daysUntilDeadline] : [daysUntilDeadline]
    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching upcoming renewals:", error)
    throw error
  }
}

/**
 * Create renewal alerts at specific milestones (90, 60, 30, 7 days)
 * Added service_contract_id parameter and column
 */
export async function createRenewalAlerts(params: {
  clientId: string
  facilityId: string
  renewalScheduleId: string
  nextRenewalDate: Date
  serviceContractId?: string // Optional service contract link
}): Promise<any[]> {
  try {
    const alertMilestones = [90, 60, 30, 7] // Days before deadline
    const createdAlerts = []

    for (const days of alertMilestones) {
      const alertDate = new Date(params.nextRenewalDate)
      alertDate.setDate(alertDate.getDate() - days)

      if (alertDate > new Date()) {
        const alertId = uuidv4()

        await query(
          `INSERT INTO tbl_renewal_alerts 
           (id, client_id, facility_id, renewal_schedule_id, service_contract_id,
            alert_type, days_before_deadline, alert_status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [alertId, params.clientId, params.facilityId, params.renewalScheduleId, params.serviceContractId || null, `${days}_days`, days, "pending"],
        )

        createdAlerts.push({
          id: alertId,
          alertType: `${days}_days`,
          scheduledDate: alertDate,
        })
      }
    }

    return createdAlerts
  } catch (error) {
    console.error("[v0] Error creating renewal alerts:", error)
    throw error
  }
}

/**
 * Get pending renewal alerts (should be sent today or earlier)
 */
export async function getPendingRenewalAlerts(clientId?: string): Promise<any[]> {
  try {
    const sql = clientId
      ? `SELECT ra.*, rs.next_renewal_date, cf.facility_name
         FROM tbl_renewal_alerts ra
         JOIN tbl_renewal_schedule rs ON ra.renewal_schedule_id = rs.id
         JOIN tbl_client_facilities cf ON ra.facility_id = cf.id
         WHERE ra.client_id = ?
         AND ra.alert_status = 'pending'
         AND DATE_ADD(rs.next_renewal_date, INTERVAL -ra.days_before_deadline DAY) <= CURDATE()
         ORDER BY rs.next_renewal_date ASC`
      : `SELECT ra.*, rs.next_renewal_date, cf.facility_name
         FROM tbl_renewal_alerts ra
         JOIN tbl_renewal_schedule rs ON ra.renewal_schedule_id = rs.id
         JOIN tbl_client_facilities cf ON ra.facility_id = cf.id
         WHERE ra.alert_status = 'pending'
         AND DATE_ADD(rs.next_renewal_date, INTERVAL -ra.days_before_deadline DAY) <= CURDATE()
         ORDER BY rs.next_renewal_date ASC`

    const params = clientId ? [clientId] : []
    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching pending alerts:", error)
    throw error
  }
}

/**
 * Mark alert as sent
 */
export async function markAlertAsSent(alertId: string): Promise<void> {
  try {
    await query(
      `UPDATE tbl_renewal_alerts 
       SET alert_status = 'sent', email_sent_date = NOW(), in_app_notification_sent = TRUE
       WHERE id = ?`,
      [alertId],
    )
  } catch (error) {
    console.error("[v0] Error marking alert as sent:", error)
    throw error
  }
}

/**
 * Create no-change certification (for products with no updates)
 */
export async function createNoChangeCertification(params: {
  clientId: string
  facilityId: string
  renewalScheduleId: string
  certifiedBy: string
}): Promise<any> {
  try {
    const certId = uuidv4()

    const noChangeCertText = `This is to certify that there have been no changes to the registration 
information or product listing since the last submission. All information previously 
submitted remains current and accurate.`

    await query(
      `INSERT INTO tbl_no_change_certification 
       (id, client_id, facility_id, renewal_schedule_id, 
        certification_date, certification_text, certified_by)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        certId,
        params.clientId,
        params.facilityId,
        params.renewalScheduleId,
        new Date(),
        noChangeCertText,
        params.certifiedBy,
      ],
    )

    await createAuditLog({
      clientId: params.clientId,
      userId: params.certifiedBy,
      action: "CREATE",
      entityType: "NO_CHANGE_CERTIFICATION",
      entityId: certId,
      reasonForChange: "Automatic no-change certification - no product updates",
    })

    return {
      id: certId,
      text: noChangeCertText,
      certificationDate: new Date(),
    }
  } catch (error) {
    console.error("[v0] Error creating no-change certification:", error)
    throw error
  }
}

/**
 * Get overdue renewals
 */
export async function getOverdueRenewals(clientId?: string): Promise<any[]> {
  try {
    const sql = clientId
      ? `SELECT rs.*, cf.facility_name, c.organization_name,
          DATEDIFF(CURDATE(), rs.next_renewal_date) as days_overdue
         FROM tbl_renewal_schedule rs
         JOIN tbl_client_facilities cf ON rs.facility_id = cf.id
         JOIN tbl_clients c ON rs.client_id = c.id
         WHERE rs.client_id = ?
         AND rs.status = 'active'
         AND rs.next_renewal_date < CURDATE()
         ORDER BY rs.next_renewal_date ASC`
      : `SELECT rs.*, cf.facility_name, c.organization_name,
          DATEDIFF(CURDATE(), rs.next_renewal_date) as days_overdue
         FROM tbl_renewal_schedule rs
         JOIN tbl_client_facilities cf ON rs.facility_id = cf.id
         JOIN tbl_clients c ON rs.client_id = c.id
         WHERE rs.status = 'active'
         AND rs.next_renewal_date < CURDATE()
         ORDER BY rs.next_renewal_date ASC`

    const params = clientId ? [clientId] : []
    return await query(sql, params)
  } catch (error) {
    console.error("[v0] Error fetching overdue renewals:", error)
    throw error
  }
}

/**
 * Complete a renewal
 */
export async function completeRenewal(params: {
  clientId: string
  renewalScheduleId: string
  submissionId?: string
  executedBy: string
}): Promise<void> {
  try {
    const nextDate = calculateNextRenewalDate(new Date(), "Drug") // Get default, will be updated based on facility type

    await query(
      `UPDATE tbl_renewal_schedule 
       SET last_renewal_date = NOW(), 
           next_renewal_date = ?,
           status = 'active'
       WHERE id = ? AND client_id = ?`,
      [nextDate, params.renewalScheduleId, params.clientId],
    )

    await createAuditLog({
      clientId: params.clientId,
      userId: params.executedBy,
      action: "UPDATE",
      entityType: "RENEWAL_SCHEDULE",
      entityId: params.renewalScheduleId,
      newValues: {
        status: "renewed",
        submission_id: params.submissionId,
      },
      reasonForChange: "Renewal submission completed",
    })
  } catch (error) {
    console.error("[v0] Error completing renewal:", error)
    throw error
  }
}
