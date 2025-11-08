"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface RiskScoreCardProps {
  title: string
  score: number
  maxScore: number
  trend: "improving" | "declining" | "stable"
  riskLevel: "critical" | "high" | "medium" | "low"
  lastUpdated: string
  onClick?: () => void
}

export function RiskScoreCard({ title, score, maxScore, trend, riskLevel, lastUpdated, onClick }: RiskScoreCardProps) {
  const percentage = (score / maxScore) * 100
  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return { bg: "bg-red-100", text: "text-red-900", border: "border-red-300" }
      case "high":
        return { bg: "bg-orange-100", text: "text-orange-900", border: "border-orange-300" }
      case "medium":
        return { bg: "bg-yellow-100", text: "text-yellow-900", border: "border-yellow-300" }
      default:
        return { bg: "bg-green-100", text: "text-green-900", border: "border-green-300" }
    }
  }

  const colors = getRiskColor(riskLevel)
  const getTrendIcon = () => {
    switch (trend) {
      case "improving":
        return <TrendingDown className="w-4 h-4 text-green-600" />
      case "declining":
        return <TrendingUp className="w-4 h-4 text-red-600" />
      default:
        return <Minus className="w-4 h-4 text-slate-600" />
    }
  }

  return (
    <Card className={`cursor-pointer hover:shadow-lg transition-shadow border-2 ${colors.border}`} onClick={onClick}>
      <CardContent className={`p-6 ${colors.bg}`}>
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className={`text-sm font-medium ${colors.text}`}>{title}</p>
            <h3 className={`text-3xl font-bold ${colors.text} mt-2`}>{score}</h3>
          </div>
          <Badge className={`${colors.bg} ${colors.text} border ${colors.border}`}>{riskLevel}</Badge>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-slate-200 rounded-full h-2 mb-4 overflow-hidden">
          <div
            className={`h-full ${
              riskLevel === "critical"
                ? "bg-red-600"
                : riskLevel === "high"
                  ? "bg-orange-600"
                  : riskLevel === "medium"
                    ? "bg-yellow-600"
                    : "bg-green-600"
            }`}
            style={{ width: `${Math.min(percentage, 100)}%` }}
          />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between text-xs">
          <span className={colors.text}>of {maxScore} max</span>
          <div className="flex items-center gap-1">
            {getTrendIcon()}
            <span className={colors.text}>{trend}</span>
          </div>
        </div>

        <p className="text-xs text-slate-600 mt-2">Updated: {new Date(lastUpdated).toLocaleDateString()}</p>
      </CardContent>
    </Card>
  )
}
