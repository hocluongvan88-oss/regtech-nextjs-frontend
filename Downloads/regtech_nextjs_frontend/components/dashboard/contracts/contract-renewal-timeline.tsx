"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

interface TimelineEvent {
  date: string
  title: string
  status: "completed" | "upcoming" | "overdue"
}

interface ContractRenewalTimelineProps {
  events: TimelineEvent[]
}

export function ContractRenewalTimeline({ events }: ContractRenewalTimelineProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "bg-green-600"
      case "overdue":
        return "bg-red-600"
      default:
        return "bg-blue-600"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "overdue":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-blue-600" />
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Contract Renewal Timeline</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.map((event, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center ${getStatusColor(event.status)}`}
                >
                  {getStatusIcon(event.status)}
                </div>
                {idx !== events.length - 1 && <div className="w-0.5 h-8 bg-slate-200 my-2" />}
              </div>
              <div className="py-1">
                <p className="font-semibold text-slate-900">{event.title}</p>
                <p className="text-sm text-slate-600">{new Date(event.date).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
