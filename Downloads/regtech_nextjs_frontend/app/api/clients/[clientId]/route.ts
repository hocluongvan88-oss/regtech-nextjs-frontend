import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const { clientId } = await params
    const result = await query(`SELECT * FROM tbl_clients WHERE id = ? AND deleted_at IS NULL`, [clientId])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error fetching client:", error)
    return NextResponse.json({ error: "Failed to fetch client" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const { clientId } = await params
    const body = await request.json()
    const { organization_name, organization_type, duns_number, fei_number, status } = body

    const result = await query(
      `UPDATE tbl_clients 
       SET organization_name = IFNULL(?, organization_name),
           organization_type = IFNULL(?, organization_type),
           duns_number = IFNULL(?, duns_number),
           fei_number = IFNULL(?, fei_number),
           status = IFNULL(?, status)
       WHERE id = ?`,
      [organization_name, organization_type, duns_number, fei_number, status, clientId],
    )

    if (!result) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    const updated = await query(`SELECT * FROM tbl_clients WHERE id = ?`, [clientId])
    return NextResponse.json(updated[0])
  } catch (error) {
    console.error("[v0] Error updating client:", error)
    return NextResponse.json({ error: "Failed to update client" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ clientId: string }> }) {
  try {
    const { clientId } = await params
    const result = await query(`UPDATE tbl_clients SET deleted_at = NOW() WHERE id = ?`, [clientId])

    if (!result) {
      return NextResponse.json({ error: "Client not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Client deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting client:", error)
    return NextResponse.json({ error: "Failed to delete client" }, { status: 500 })
  }
}
