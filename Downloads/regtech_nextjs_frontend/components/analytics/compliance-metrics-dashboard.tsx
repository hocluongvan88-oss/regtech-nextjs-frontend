"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { Progress } from "@/components/ui/progress"

interface ComplianceAnalytics {
  analytics_date: string
  compliance_percentage: number
  total_compliance_items: number
  compliant_items: number
  non_compliant_items: number
  fda_483_count: number
  warning_letter_count: number
  complaint_count: number
}

interface ComplianceMetricsDashboardProps {
  clientId: string
}

export function ComplianceMetricsDashboard({ clientId }: ComplianceMetricsDashboardProps) {
  const [analytics, setAnalytics] = useState<ComplianceAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [latestMetrics, setLatestMetrics] = useState<ComplianceAnalytics | null>(null)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch(`/api/analytics/compliance?clientId=${clientId}&days=30`)
        if (res.ok) {
          const data = await res.json()
          const analyticsArray = Array.isArray(data) ? data : [data]
          setAnalytics(analyticsArray)
          if (analyticsArray.length > 0) {
            setLatestMetrics(analyticsArray[0])
          }
        }
      } catch (error) {
        console.error("[v0] Fetch analytics error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [clientId])

  if (loading) {
    return (
      <Card>
        <CardContent className="py-8 text-center">Loading analytics...</CardContent>
      </Card>
    )
  }

  const chartData = analytics.map((a) => ({
    date: new Date(a.analytics_date).toLocaleDateString(),
    compliance: a.compliance_percentage,
    compliant: a.compliant_items,
    nonCompliant: a.non_compliant_items,
  }))

  const fdaEventData = analytics.map((a) => ({
    date: new Date(a.analytics_date).toLocaleDateString(),
    "483s": a.fda_483_count,
    "Warning Letters": a.warning_letter_count,
    Complaints: a.complaint_count,
  }))

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Compliance Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestMetrics?.compliance_percentage.toFixed(1)}%</div>
            <Progress value={latestMetrics?.compliance_percentage || 0} className="mt-2" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">FDA 483s</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestMetrics?.fda_483_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In review period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Warning Letters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestMetrics?.warning_letter_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In review period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Complaints</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{latestMetrics?.complaint_count || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">In review period</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Compliance Trend</CardTitle>
          <CardDescription>Historical compliance percentage and items</CardDescription>
        </CardHeader>
        <CardContent>
          {chartData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line yAxisId="left" type="monotone" dataKey="compliance" stroke="#10b981" name="Compliance %" />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>FDA Events Trend</CardTitle>
          <CardDescription>483s, Warning Letters, and Complaints</CardDescription>
        </CardHeader>
        <CardContent>
          {fdaEventData.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">No data available</div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={fdaEventData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="483s" fill="#ef4444" name="FDA 483s" />
                <Bar dataKey="Warning Letters" fill="#f97316" name="Warning Letters" />
                <Bar dataKey="Complaints" fill="#eab308" name="Complaints" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
