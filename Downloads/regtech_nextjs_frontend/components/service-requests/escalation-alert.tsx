"use client"

import { useState, useEffect } from "react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle } from "lucide-react"

type Escalation = {
  id: string
  service_request_id: string
  escalation_reason: string
  required_resolution_date?: string
  status: string
}

export function EscalationAlert() {
  const [escalations, setEscalations] = useState<Escalation[]>([])

  useEffect(() => {
    fetchEscalations()
  }, [])

  const fetchEscalations = async () => {
    try {
      const response = await fetch("/api/service-requests/escalations", {
        headers: {
          "x-client-id": localStorage.getItem("clientId") || "",
          "x-user-id": localStorage.getItem("userId") || "",
        },
      })
      const data = await response.json()
      setEscalations(data.data || [])
    } catch (error) {
      console.error("Error fetching escalations:", error)
    }
  }

  if (escalations.length === 0) return null

  return (
    <Alert className="border-red-200 bg-red-50">
      <AlertTriangle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">
        {escalations.length} Escalated Service Request{escalations.length !== 1 ? "s" : ""}
      </AlertTitle>
      <AlertDescription className="text-red-700">
        <ul className="mt-2 space-y-1">
          {escalations.slice(0, 3).map((esc) => (
            <li key={esc.id} className="text-sm">
              {esc.escalation_reason}
              {esc.required_resolution_date && (
                <Badge variant="outline" className="ml-2 text-xs">
                  Due: {esc.required_resolution_date}
                </Badge>
              )}
            </li>
          ))}
        </ul>
        {escalations.length > 3 && <p className="text-sm mt-2">and {escalations.length - 3} more...</p>}
      </AlertDescription>
    </Alert>
  )
}
