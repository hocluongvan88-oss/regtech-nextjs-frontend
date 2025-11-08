"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from "recharts"

interface RiskAssessment {
  assessment_date: string
  overall_risk_score: number
  compliance_risk_score?: number
  operational_risk_score?: number
  financial_risk_score?: number
}

interface RiskAssessmentChartProps {
  clientId: string
}

export function RiskAssessmentChart({ clientId }: RiskAssessmentChartProps) {
  const [assessments, setAssessments] = useState<RiskAssessment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAssessments = async () => {
      try {
        const res = await fetch(`/api/risk-management/assessments?clientId=${clientId}`)
        if (res.ok) {
          const data = await res.json()
          setAssessments(Array.isArray(data) ? data : [data])
        }
      } catch (error) {
        console.error("[v0] Fetch assessments error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAssessments()
  }, [clientId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">Loading assessment data...</CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk Assessment Trend</CardTitle>
        <CardDescription>Overall risk score over time</CardDescription>
      </CardHeader>
      <CardContent>
        {assessments.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">No assessments available</div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart
              data={assessments.map((a) => ({
                date: new Date(a.assessment_date).toLocaleDateString(),
                score: a.overall_risk_score,
                compliance: a.compliance_risk_score || 0,
                operational: a.operational_risk_score || 0,
                financial: a.financial_risk_score || 0,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis domain={[0, 100]} />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="score" stroke="#ef4444" name="Overall Score" />
              <Line type="monotone" dataKey="compliance" stroke="#f97316" name="Compliance" />
              <Line type="monotone" dataKey="operational" stroke="#eab308" name="Operational" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  )
}
