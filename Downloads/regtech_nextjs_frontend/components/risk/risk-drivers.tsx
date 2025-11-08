"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, TrendingUp } from "lucide-react"

interface RiskDriver {
  id: string
  name: string
  description: string
  affectedFacilities: number
  severity: "critical" | "high" | "medium" | "low"
  trend: "increasing" | "stable" | "decreasing"
}

interface RiskDriversProps {
  drivers: RiskDriver[]
}

export function RiskDrivers({ drivers }: RiskDriversProps) {
  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-600" />
          Top Risk Drivers
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {drivers.length === 0 ? (
            <p className="text-slate-600 text-sm">No risk drivers identified</p>
          ) : (
            drivers.map((driver) => (
              <div key={driver.id} className="p-4 border rounded-lg hover:bg-slate-50 transition-colors">
                <div className="flex items-start justify-between mb-2">
                  <h4 className="font-semibold text-slate-900">{driver.name}</h4>
                  <Badge className={getSeverityColor(driver.severity)}>{driver.severity}</Badge>
                </div>
                <p className="text-sm text-slate-600 mb-2">{driver.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-slate-600">Affects {driver.affectedFacilities} facilities</span>
                  <div className="flex items-center gap-1 text-slate-600">
                    <TrendingUp className="w-4 h-4" />
                    <span className="text-xs">{driver.trend}</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
