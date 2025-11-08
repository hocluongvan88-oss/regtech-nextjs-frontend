"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MatrixCell {
  likelihood: number
  impact: number
  count: number
  riskLevel: "critical" | "high" | "medium" | "low"
}

interface RiskMatrixProps {
  data: MatrixCell[]
}

export function RiskMatrix({ data }: RiskMatrixProps) {
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-600"
      case "high":
        return "bg-orange-500"
      case "medium":
        return "bg-yellow-500"
      default:
        return "bg-green-600"
    }
  }

  const likelihoods = ["Very Low", "Low", "Medium", "High", "Very High"]
  const impacts = ["Very Low", "Low", "Medium", "High", "Very High"]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Matrix</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block">
            {/* Header Row */}
            <div className="flex gap-1">
              <div className="w-32 h-8" />
              {impacts.map((impact, idx) => (
                <div key={idx} className="w-20 h-8 flex items-center justify-center text-xs font-semibold">
                  {impact}
                </div>
              ))}
            </div>

            {/* Matrix Rows */}
            {likelihoods.map((likelihood, likeIdx) => (
              <div key={likeIdx} className="flex gap-1">
                <div className="w-32 h-20 flex items-center justify-center text-xs font-semibold">{likelihood}</div>
                {impacts.map((_, impIdx) => {
                  const cell = data.find((c) => c.likelihood === likeIdx + 1 && c.impact === impIdx + 1)
                  return (
                    <div
                      key={impIdx}
                      className={`w-20 h-20 flex flex-col items-center justify-center text-white font-semibold rounded text-xs ${
                        cell ? getRiskColor(cell.riskLevel) : "bg-slate-100"
                      }`}
                    >
                      {cell && (
                        <>
                          <div>{cell.count}</div>
                          <div className="text-xs opacity-80">{cell.riskLevel}</div>
                        </>
                      )}
                    </div>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
