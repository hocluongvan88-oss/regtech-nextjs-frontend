"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plus } from "lucide-react"

interface RiskRegister {
  id: string
  risk_title: string
  risk_category: string
  probability: string
  impact: string
  risk_score: number
  risk_status: string
  identified_date: string
}

interface RiskRegisterListProps {
  clientId: string
  facilityId?: string
}

const RISK_COLORS = {
  critical: "bg-red-100 text-red-800 border-red-300",
  high: "bg-orange-100 text-orange-800 border-orange-300",
  medium: "bg-yellow-100 text-yellow-800 border-yellow-300",
  low: "bg-green-100 text-green-800 border-green-300",
}

const getRiskLevel = (score: number): keyof typeof RISK_COLORS => {
  if (score >= 48) return "critical"
  if (score >= 32) return "high"
  if (score >= 16) return "medium"
  return "low"
}

export function RiskRegisterList({ clientId, facilityId }: RiskRegisterListProps) {
  const [risks, setRisks] = useState<RiskRegister[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    const fetchRisks = async () => {
      try {
        const params = new URLSearchParams({ clientId })
        if (facilityId) params.append("facilityId", facilityId)

        const res = await fetch(`/api/risk-management/registers?${params}`)
        if (res.ok) {
          const data = await res.json()
          setRisks(Array.isArray(data) ? data : [data])
        }
      } catch (error) {
        console.error("[v0] Fetch risks error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRisks()
  }, [clientId, facilityId])

  const criticalRisks = risks.filter((r) => getRiskLevel(r.risk_score) === "critical")
  const averageRiskScore =
    risks.length > 0 ? Math.round(risks.reduce((sum, r) => sum + r.risk_score, 0) / risks.length) : 0

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{risks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Identified and tracked</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-600">{criticalRisks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Avg Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{averageRiskScore}</div>
            <p className="text-xs text-muted-foreground mt-1">Out of 64</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Risk Register</CardTitle>
            <Button size="sm" onClick={() => setShowForm(!showForm)}>
              <Plus className="w-4 h-4 mr-2" />
              New Risk
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading risks...</div>
          ) : risks.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No risks recorded yet</div>
          ) : (
            <div className="space-y-2">
              {risks.map((risk) => (
                <div
                  key={risk.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-medium">{risk.risk_title}</h4>
                      <Badge variant="outline" className={RISK_COLORS[getRiskLevel(risk.risk_score)]}>
                        Score: {risk.risk_score}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      Category: {risk.risk_category} • Probability: {risk.probability} • Impact: {risk.impact}
                    </p>
                  </div>
                  <Badge variant={risk.risk_status === "open" ? "default" : "secondary"}>{risk.risk_status}</Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
