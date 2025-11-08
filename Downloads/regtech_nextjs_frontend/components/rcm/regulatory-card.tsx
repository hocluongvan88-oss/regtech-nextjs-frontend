"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, AlertCircle, BookOpen, CheckCircle } from "lucide-react"

interface RegulatoryCardProps {
  id: string
  title: string
  description: string
  type: "guidance" | "final_rule" | "compliance_program"
  severity: "critical" | "high" | "medium" | "low"
  datePublished: string
  affectedProductsCount: number
  isRead: boolean
  onMarkRead?: (id: string) => void
  onGenerateServiceRequest?: (id: string) => void
}

export function RegulatoryCard({
  id,
  title,
  description,
  type,
  severity,
  datePublished,
  affectedProductsCount,
  isRead,
  onMarkRead,
  onGenerateServiceRequest,
}: RegulatoryCardProps) {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const getTypeIcon = (t: string) => {
    switch (t) {
      case "guidance":
        return <BookOpen className="w-4 h-4" />
      case "final_rule":
        return <AlertCircle className="w-4 h-4" />
      case "compliance_program":
        return <CheckCircle className="w-4 h-4" />
      default:
        return null
    }
  }

  return (
    <Card className={`hover:shadow-lg transition-all ${!isRead ? "border-l-4 border-l-blue-600" : ""}`}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
            <div className="flex items-start gap-3 mb-2">
              <div className="flex-1">
                <h3 className={`font-semibold text-slate-900 ${!isRead ? "font-bold" : ""}`}>{title}</h3>
                <p className="text-sm text-slate-600 mt-1">{description}</p>
              </div>
              <Badge className={`flex items-center gap-1 flex-shrink-0 ${getSeverityColor(severity)}`}>
                {getTypeIcon(type)}
                <span className="capitalize">{type.replace("_", " ")}</span>
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-4 mt-4 text-sm">
              <div className="flex items-center gap-2 text-slate-600">
                <Calendar className="w-4 h-4" />
                {new Date(datePublished).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <AlertCircle className="w-4 h-4" />
                {affectedProductsCount} affected product{affectedProductsCount !== 1 ? "s" : ""}
              </div>
              <Badge variant="outline" className={getSeverityColor(severity)}>
                {severity}
              </Badge>
            </div>
          </div>

          <div className="flex flex-col gap-2 flex-shrink-0">
            {!isRead && (
              <Button variant="outline" size="sm" onClick={() => onMarkRead?.(id)} className="text-xs">
                Mark as Read
              </Button>
            )}
            {affectedProductsCount > 0 && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onGenerateServiceRequest?.(id)}
                className="bg-blue-600 hover:bg-blue-700 text-xs"
              >
                View Impact
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
