"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Plus, TrendingUp } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"

export default function RiskPage() {
  const { user } = useAuth()
  const [riskRegisters, setRiskRegisters] = useState<any[]>([])
  const [riskMitigations, setRiskMitigations] = useState<any[]>([])
  const [riskAssessments, setRiskAssessments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const clientId = user?.client_id || localStorage.getItem("clientId")

        if (!clientId) {
          console.log("[v0] No clientId available, skipping fetch")
          setLoading(false)
          return
        }

        const [registers, assessments] = await Promise.all([
          fetch(`/api/risk-management/registers?clientId=${clientId}`)
            .then((r) => (r.ok ? r.json() : []))
            .catch((err) => {
              console.error("[v0] Error fetching registers:", err)
              return []
            }),
          fetch(`/api/risk-management/assessments?clientId=${clientId}`)
            .then((r) => (r.ok ? r.json() : []))
            .catch((err) => {
              console.error("[v0] Error fetching assessments:", err)
              return []
            }),
        ])

        setRiskRegisters(registers || [])
        setRiskAssessments(assessments || [])

        if (registers && registers.length > 0) {
          const mitigationsData = await Promise.all(
            registers.map((register: any) =>
              fetch(`/api/risk-management/mitigations?riskRegisterId=${register.id}`)
                .then((r) => (r.ok ? r.json() : []))
                .catch(() => []),
            ),
          )
          const allMitigations = mitigationsData.flat()
          setRiskMitigations(allMitigations || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching risk data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [user])

  const calculateOverallRiskScore = () => {
    if (!riskRegisters || riskRegisters.length === 0) return 0
    const scores = riskRegisters.map((r: any) => r.risk_score || 0)
    return Math.round(scores.reduce((a: number, b: number) => a + b, 0) / scores.length)
  }

  const getRiskLevel = (score: number) => {
    if (score >= 60) return { label: "Critical", color: "destructive" }
    if (score >= 40) return { label: "High", color: "secondary" }
    if (score >= 20) return { label: "Medium", color: "outline" }
    return { label: "Low", color: "secondary" }
  }

  const overallScore = calculateOverallRiskScore()
  const riskLevel = getRiskLevel(overallScore)
  const criticalRisks = riskRegisters?.filter((r: any) => r.risk_score >= 60) || []

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Risk Management</h1>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          New Risk Register
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Overall Risk Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{overallScore}</div>
            <Badge variant={riskLevel.color as any} className="mt-2">
              {riskLevel.label}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Critical Risks</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalRisks.length}</div>
            <p className="text-xs text-muted-foreground mt-1">Require immediate mitigation</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Mitigations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskMitigations?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Active mitigation strategies</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Assessments</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{riskAssessments?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">Periodic evaluations</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Risk Registers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskRegisters && riskRegisters.length > 0 ? (
                riskRegisters.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">Score: {item.risk_score}</p>
                    </div>
                    <Badge variant="outline">{getRiskLevel(item.risk_score).label}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No risk registers</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Active Mitigations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {riskMitigations && riskMitigations.length > 0 ? (
                riskMitigations.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">{item.strategy}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Effectiveness: {item.effectiveness_rating || "N/A"}%
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">No mitigation strategies</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
