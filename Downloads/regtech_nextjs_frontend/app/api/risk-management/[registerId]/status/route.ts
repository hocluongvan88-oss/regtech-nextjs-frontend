import { updateRiskRegister } from "@/lib/risk-management-service"
import { type NextRequest, NextResponse } from "next/server"
import { verifyAuth } from "@/lib/auth"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ registerId: string }> }) {
  try {
    const authResult = await verifyAuth(request)

    if (!authResult.authenticated || !authResult.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { registerId } = await params
    const body = await request.json()
    const { risk_status } = body

    await updateRiskRegister(registerId, { risk_status } as any, authResult.user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Risk status update error:", error)
    return NextResponse.json({ error: "Failed to update risk status" }, { status: 500 })
  }
}
