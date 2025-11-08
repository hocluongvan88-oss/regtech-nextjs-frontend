"use client"

import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle, Clock, Lock } from "lucide-react"

interface ServiceStatusBadgeProps {
  status: "active" | "pending" | "expired" | "blocked"
  daysRemaining?: number
}

export function ServiceStatusBadge({ status, daysRemaining }: ServiceStatusBadgeProps) {
  const getConfig = (s: string) => {
    switch (s) {
      case "active":
        return {
          color: "bg-green-100 text-green-800",
          icon: <CheckCircle className="w-4 h-4" />,
          label: "Active",
        }
      case "pending":
        return {
          color: "bg-yellow-100 text-yellow-800",
          icon: <Clock className="w-4 h-4" />,
          label: "Pending Renewal",
        }
      case "expired":
        return {
          color: "bg-red-100 text-red-800",
          icon: <AlertCircle className="w-4 h-4" />,
          label: "Expired",
        }
      case "blocked":
        return {
          color: "bg-red-100 text-red-800",
          icon: <Lock className="w-4 h-4" />,
          label: "Services Blocked",
        }
      default:
        return {
          color: "bg-slate-100 text-slate-800",
          icon: null,
          label: "Unknown",
        }
    }
  }

  const config = getConfig(status)

  return (
    <Badge className={config.color}>
      {config.icon}
      <span className="ml-1">
        {config.label}
        {daysRemaining !== undefined && ` (${daysRemaining}d)`}
      </span>
    </Badge>
  )
}
