/**
 * Renewal Automation Scheduler
 * Runs periodically to send renewal alerts and manage deadlines
 * Should be triggered by a cron job (e.g., daily at 8 AM)
 */

import { getPendingRenewalAlerts, markAlertAsSent, getOverdueRenewals } from "./renewal-service"
import { createAuditLog } from "./audit"
import { query } from "./db"

/**
 * Send email notification for renewal alert
 * Integration point for email service (SendGrid, AWS SES, etc.)
 */
async function sendRenewalAlertEmail(params: {
  facilitName: string
  organizationName: string
  daysUntilDeadline: number
  nextRenewalDate: Date
  recipientEmail: string
}): Promise<boolean> {
  try {
    console.log(`[v0] Sending renewal alert email to ${params.recipientEmail}`)
    console.log(`[v0] Facility: ${params.facilitName}, Organization: ${params.organizationName}`)
    console.log(`[v0] Days until deadline: ${params.daysUntilDeadline}, Date: ${params.nextRenewalDate.toISOString()}`)

    // TODO: Integrate with actual email service (SendGrid, AWS SES)
    // Example:
    // const result = await sendgrid.send({
    //   to: params.recipientEmail,
    //   from: 'noreply@regtech.com',
    //   subject: `FDA Registration Renewal Due in ${params.daysUntilDeadline} Days`,
    //   html: renderRenewalAlertTemplate(params)
    // })

    return true // Simulate success
  } catch (error) {
    console.error("[v0] Error sending renewal alert email:", error)
    return false
  }
}

/**
 * Get OC and Service Manager for a facility
 */
async function getNotificationRecipients(facilityId: string, clientId: string): Promise<any[]> {
  try {
    const recipients = await query(
      `SELECT DISTINCT u.email, u.first_name, u.last_name, r.role_name
       FROM tbl_users u
       JOIN tbl_user_roles ur ON u.id = ur.user_id
       JOIN tbl_roles r ON ur.role_id = r.id
       WHERE u.client_id = ? 
       AND r.role_name IN ('official_correspondent', 'service_manager')
       AND u.status = 'active'
       AND u.deleted_at IS NULL`,
      [clientId],
    )

    return recipients || []
  } catch (error) {
    console.error("[v0] Error fetching notification recipients:", error)
    return []
  }
}

/**
 * Process renewal alerts and send notifications
 * Should be called daily by cron job
 */
export async function processRenewalAlerts(): Promise<{
  alertsSent: number
  alertsFailed: number
  overdueCount: number
}> {
  try {
    console.log("[v0] Starting renewal alert processing...")

    const stats = {
      alertsSent: 0,
      alertsFailed: 0,
      overdueCount: 0,
    }

    const pendingAlerts = await getPendingRenewalAlerts()

    console.log(`[v0] Found ${pendingAlerts.length} pending renewal alerts`)

    for (const alert of pendingAlerts) {
      try {
        const recipients = await getNotificationRecipients(alert.facility_id, alert.client_id)

        if (recipients.length === 0) {
          console.warn(`[v0] No recipients found for facility ${alert.facility_id}`)
          continue
        }

        let emailsSent = 0
        for (const recipient of recipients) {
          const emailSent = await sendRenewalAlertEmail({
            facilitName: alert.facility_name,
            organizationName: alert.organization_name || "Unknown",
            daysUntilDeadline: alert.days_before_deadline,
            nextRenewalDate: new Date(alert.next_renewal_date),
            recipientEmail: recipient.email,
          })

          if (emailSent) {
            emailsSent++
          }
        }

        if (emailsSent > 0) {
          await markAlertAsSent(alert.id)

          await createAuditLog({
            clientId: alert.client_id,
            action: "SUBMIT",
            entityType: "RENEWAL_ALERT",
            entityId: alert.id,
            newValues: {
              alert_type: alert.alert_type,
              recipients_count: emailsSent,
              next_renewal_date: alert.next_renewal_date,
            },
            reasonForChange: "Automated renewal alert sent to OC and Service Manager",
          })

          stats.alertsSent++
        } else {
          stats.alertsFailed++
        }
      } catch (error) {
        console.error(`[v0] Error processing alert ${alert.id}:`, error)
        stats.alertsFailed++
      }
    }

    const overdueRenewals = await getOverdueRenewals()
    stats.overdueCount = overdueRenewals.length

    if (stats.overdueCount > 0) {
      console.warn(`[v0] WARNING: Found ${stats.overdueCount} overdue renewals`)

      // TODO: Send escalation alerts to admins for overdue renewals
    }

    console.log(
      `[v0] Renewal alert processing complete. Sent: ${stats.alertsSent}, Failed: ${stats.alertsFailed}, Overdue: ${stats.overdueCount}`,
    )

    return stats
  } catch (error) {
    console.error("[v0] Error in processRenewalAlerts:", error)
    throw error
  }
}

/**
 * Scheduler handler - called by cron job
 * Route: /api/cron/renewal-alerts
 */
export async function handleRenewalSchedulerCron(): Promise<any> {
  try {
    const stats = await processRenewalAlerts()

    return {
      success: true,
      message: "Renewal alert processing completed",
      stats,
    }
  } catch (error) {
    console.error("[v0] Cron job error:", error)
    return {
      success: false,
      error: "Failed to process renewal alerts",
    }
  }
}
