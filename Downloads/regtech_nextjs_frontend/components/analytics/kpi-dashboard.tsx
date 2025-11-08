"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TrendingUp, TrendingDown, Minus } from "lucide-react"

interface KPI {
  id: string
  kpi_name: string
  kpi_category: string
  target_value: number
  current_value: number
  kpi_status: string
  trend: string
}

interface KPIDashboardProps {
  clientId: string
}

const STATUS_COLORS = {
  on_track: "bg-green-100 text-green-800",
  at_risk: "bg-yellow-100 text-yellow-800",
  critical: "bg-red-100 text-red-800",
  exceeded: "bg-blue-100 text-blue-800",
}

const getTrendIcon = (trend: string) => {
  if (trend === "improving") return <TrendingUp className="w-4 h-4 text-green-600" />
  if (trend === "declining") return <TrendingDown className="w-4 h-4 text-red-600" />
  return <Minus className="w-4 h-4 text-gray-600" />
}

export function KPIDashboard({ clientId }: KPIDashboardProps) {
  const [kpis, setKpis] = useState<KPI[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("compliance")

  useEffect(() => {
    const fetchKPIs = async () => {
      try {
        const res = await fetch(`/api/analytics/kpi?clientId=${clientId}&category=${selectedCategory}`)
        if (res.ok) {
          const data = await res.json()
          setKpis(Array.isArray(data) ? data : [data])
        }
      } catch (error) {
        console.error("[v0] Fetch KPIs error:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchKPIs()
  }, [clientId, selectedCategory])

  const categories = ["compliance", "efficiency", "quality", "financial"]
  const categoryCounts = categories.map((cat) => ({
    name: cat,
    count: kpis.filter((k) => k.kpi_category === cat).length,
  }))

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Key Performance Indicators</CardTitle>
          <CardDescription>Track and monitor KPIs by category</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1 rounded-full text-sm capitalize transition-colors ${
                  selectedCategory === cat ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/80"
                }`}
              >
                {cat} ({categoryCounts.find((c) => c.name === cat)?.count || 0})
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-full text-center py-8">Loading KPIs...</div>
        ) : kpis.length === 0 ? (
          <div className="col-span-full text-center py-8 text-muted-foreground">No KPIs tracked yet</div>
        ) : (
          kpis.map((kpi) => (
            <Card key={kpi.id}>
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-base">{kpi.kpi_name}</CardTitle>
                    <p className="text-xs text-muted-foreground capitalize mt-1">{kpi.kpi_category}</p>
                  </div>
                  <div className="flex gap-1">
                    {getTrendIcon(kpi.trend)}
                    <Badge className={STATUS_COLORS[kpi.kpi_status as keyof typeof STATUS_COLORS]}>
                      {kpi.kpi_status.replace("_", " ")}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Current</span>
                    <span className="font-semibold">{kpi.current_value}</span>
                  </div>
                  <Progress value={Math.min(100, (kpi.current_value / kpi.target_value) * 100)} />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Target: {kpi.target_value}</span>
                    <span>{Math.round((kpi.current_value / kpi.target_value) * 100)}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
