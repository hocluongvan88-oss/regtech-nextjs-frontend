import { query } from "@/lib/db"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest, { params }: { params: Promise<{ facilityId: string }> }) {
  try {
    const { facilityId } = await params
    const result = await query(`SELECT * FROM tbl_client_facilities WHERE id = ? AND deleted_at IS NULL`, [facilityId])

    if (!Array.isArray(result) || result.length === 0) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error fetching facility:", error)
    return NextResponse.json({ error: "Failed to fetch facility" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ facilityId: string }> }) {
  try {
    const { facilityId } = await params
    const body = await request.json()

    await query(
      `UPDATE tbl_client_facilities 
       SET facility_name = IFNULL(?, facility_name),
           street_address = IFNULL(?, street_address),
           city = IFNULL(?, city),
           state_province = IFNULL(?, state_province),
           postal_code = IFNULL(?, postal_code),
           primary_contact_name = IFNULL(?, primary_contact_name),
           primary_contact_email = IFNULL(?, primary_contact_email),
           registration_status = IFNULL(?, registration_status)
       WHERE id = ?`,
      [
        body.facility_name,
        body.street_address,
        body.city,
        body.state_province,
        body.postal_code,
        body.primary_contact_name,
        body.primary_contact_email,
        body.registration_status,
        facilityId,
      ],
    )

    const result: any = await query(`SELECT * FROM tbl_client_facilities WHERE id = ?`, [facilityId])
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("[v0] Error updating facility:", error)
    return NextResponse.json({ error: "Failed to update facility" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ facilityId: string }> }) {
  try {
    const { facilityId } = await params
    await query(`UPDATE tbl_client_facilities SET deleted_at = NOW() WHERE id = ?`, [facilityId])

    const result: any = await query(`SELECT id FROM tbl_client_facilities WHERE id = ?`, [facilityId])
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Facility not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Facility deleted successfully" })
  } catch (error) {
    console.error("[v0] Error deleting facility:", error)
    return NextResponse.json({ error: "Failed to delete facility" }, { status: 500 })
  }
}
