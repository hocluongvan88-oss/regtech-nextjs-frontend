import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"
import { expireServiceContract, updateClientServiceStatus } from "@/lib/agent-contract-service"

// 1. Expire contracts that reached end_date
// 2. Auto-suspend services for clients without active contracts
// 3. Send 90-day renewal reminders
export async function GET(request: NextRequest) {
  try {
    const cronSecret = request.headers.get("x-cron-secret")
    if (cronSecret !== process.env.CRON_SECRET) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let actionsPerformed = 0

    const expireQuery = `
      SELECT id, client_id FROM tbl_service_contracts
      WHERE contract_status = 'active'
        AND contract_end_date < CURDATE()
    `

    const expiredContracts = await query(expireQuery)

    for (const contract of expiredContracts as any[]) {
      await expireServiceContract(contract.id, contract.client_id)
      actionsPerformed++
    }

    const clientsQuery = "SELECT DISTINCT client_id FROM tbl_service_contracts"
    const clients = await query(clientsQuery)

    for (const { client_id } of clients as any[]) {
      await updateClientServiceStatus(client_id)
    }

    const renewalQuery = `
      SELECT id, client_id FROM tbl_service_contracts
      WHERE contract_status = 'active'
        AND renewal_reminder_sent = FALSE
        AND contract_end_date <= DATE_ADD(CURDATE(), INTERVAL 90 DAY)
        AND contract_end_date > CURDATE()
    `

    const renewalContracts = await query(renewalQuery)

    for (const contract of renewalContracts as any[]) {
      await query(
        `UPDATE tbl_service_contracts 
         SET renewal_reminder_sent = TRUE, renewal_reminder_sent_date = NOW()
         WHERE id = ?`,
        [contract.id],
      )

      await query(
        `INSERT INTO tbl_reminders (
           id, client_id, service_contract_id, reminder_type,
           reminder_title, reminder_description, due_date, alert_category
         ) VALUES (
           UUID(), ?, ?, 'AGENT_CONTRACT_RENEWAL',
           'U.S. Agent Contract Renewal Due',
           'Your U.S. Agent service contract is expiring in 90 days. Please renew to maintain compliance.',
           DATE_ADD(?, INTERVAL -90 DAY), 'business'
         )`,
        [contract.client_id, contract.id, contract.contract_end_date],
      )

      actionsPerformed++
    }

    return NextResponse.json({
      status: "success",
      actions_performed: actionsPerformed,
      expired_contracts: expiredContracts.length,
      renewal_reminders_sent: renewalContracts.length,
    })
  } catch (error) {
    console.error("Error in contract management cron:", error)
    return NextResponse.json(
      { error: "Failed to process contract management", details: error.message },
      { status: 500 },
    )
  }
}
