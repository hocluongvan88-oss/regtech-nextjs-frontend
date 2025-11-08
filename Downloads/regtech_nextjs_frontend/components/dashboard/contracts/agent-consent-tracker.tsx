"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface ConsentTrackerProps {
  id: string
  facilityName: string
  agentEmail: string
  acknowledgmentStatus: "acknowledged" | "pending" | "overdue"
  fdaDeadline: string
  businessDaysRemaining: number
  acknowledgmentOverdue: boolean
  onAcknowledge?: () => void
  onEscalate?: () => void
}

export function AgentConsentTracker({
  id,
  facilityName,
  agentEmail,
  acknowledgmentStatus,
  fdaDeadline,
  businessDaysRemaining,
  acknowledgmentOverdue,
  onAcknowledge,
  onEscalate,
}: ConsentTrackerProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "acknowledged":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900">{facilityName}</h3>
              <Badge className={getStatusColor(acknowledgmentStatus)}>{acknowledgmentStatus}</Badge>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
              <div>
                <p className="text-slate-600">Consent Due</p>
                <p className="font-medium text-slate-900">{new Date(fdaDeadline).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600">Business Days Remaining</p>
                <p
                  className={`font-medium ${
                    businessDaysRemaining <= 0
                      ? "text-red-600"
                      : businessDaysRemaining <= 3
                        ? "text-orange-600"
                        : "text-green-600"
                  }`}
                >
                  {Math.max(0, businessDaysRemaining)} days
                </p>
              </div>
              <div>
                <p className="text-slate-600">Agent</p>
                <p className="font-medium text-slate-900">{agentEmail}</p>
              </div>
              <div>
                <p className="text-slate-600">Status</p>
                <p className="font-medium text-slate-900">{acknowledgmentOverdue ? "OVERDUE" : "ON TRACK"}</p>
              </div>
            </div>
          </div>

          {acknowledgmentStatus === "pending" && (
            <div className="flex gap-2 ml-4">
              <Button variant="outline" size="sm" onClick={onAcknowledge}>
                Acknowledge
              </Button>
              <Button variant="destructive" size="sm" onClick={onEscalate}>
                Escalate
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
