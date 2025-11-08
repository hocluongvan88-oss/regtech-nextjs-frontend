"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react"
import Link from "next/link"

interface ContractCardProps {
  id: string
  serviceName: string
  serviceDescription: string
  contractStatus: "active" | "pending_renewal" | "expired"
  startDate: string
  endDate: string
  daysRemaining: number
  agentName: string
}

export function ContractCard({
  id,
  serviceName,
  serviceDescription,
  contractStatus,
  startDate,
  endDate,
  daysRemaining,
  agentName,
}: ContractCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending_renewal":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "pending_renewal":
        return <Clock className="w-4 h-4" />
      case "expired":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900">{serviceName}</h3>
              <Badge className={getStatusColor(contractStatus)}>
                {getStatusIcon(contractStatus)}
                <span className="ml-1">{contractStatus.replace("_", " ")}</span>
              </Badge>
            </div>

            <p className="text-sm text-slate-600 mb-3">{serviceDescription}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Start Date</p>
                <p className="font-medium text-slate-900">{new Date(startDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600">End Date</p>
                <p className="font-medium text-slate-900">{new Date(endDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600">Days Remaining</p>
                <p
                  className={`font-medium ${
                    daysRemaining <= 30 ? "text-red-600" : daysRemaining <= 90 ? "text-yellow-600" : "text-green-600"
                  }`}
                >
                  {Math.max(0, daysRemaining)} days
                </p>
              </div>
              <div>
                <p className="text-slate-600">Agent</p>
                <p className="font-medium text-slate-900">{agentName || "TBD"}</p>
              </div>
            </div>
          </div>

          <div className="flex gap-2 ml-4">
            <Link href={`/dashboard/contracts/${id}`}>
              <Button variant="outline" size="sm">
                View
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
