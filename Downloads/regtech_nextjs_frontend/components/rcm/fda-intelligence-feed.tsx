"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Loader2, RefreshCw } from "lucide-react"

interface RegulatoryIntelligence {
  id: string
  title: string
  description: string
  risk_level: "low" | "medium" | "high" | "critical"
  status: string
  announcement_date: string
  change_type: string
}

interface Props {
  clientId: string
}

export function FDAIntelligenceFeed({ clientId }: Props) {
  const [items, setItems] = useState<RegulatoryIntelligence[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)

  const fetchIntelligence = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/rcm/intelligence?client_id=${clientId}&limit=10`)
      const data = await response.json()
      setItems(data.data || [])
    } catch (error) {
      console.error("[v0] Error fetching intelligence:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSyncFDA = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/rcm/sync-fda-intelligence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clientId, userId: "system" }),
      })
      const data = await response.json()
      if (data.success) {
        await fetchIntelligence()
      }
    } catch (error) {
      console.error("[v0] Error syncing FDA data:", error)
    } finally {
      setSyncing(false)
    }
  }

  useEffect(() => {
    fetchIntelligence()
  }, [clientId])

  const getRiskColor = (level: string) => {
    const colors: Record<string, string> = {
      critical: "bg-red-50 border-red-200",
      high: "bg-orange-50 border-orange-200",
      medium: "bg-yellow-50 border-yellow-200",
      low: "bg-green-50 border-green-200",
    }
    return colors[level] || "bg-slate-50 border-slate-200"
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>FDA Regulatory Intelligence Feed</CardTitle>
        <Button
          onClick={handleSyncFDA}
          disabled={syncing || loading}
          variant="outline"
          size="sm"
          className="gap-2 bg-transparent"
        >
          <RefreshCw className="w-4 h-4" />
          {syncing ? "Syncing..." : "Sync FDA Data"}
        </Button>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-8">No regulatory intelligence available</p>
        ) : (
          <div className="space-y-3">
            {items.map((item) => (
              <div key={item.id} className={`p-4 rounded-lg border ${getRiskColor(item.risk_level)}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h4 className="font-semibold text-sm text-slate-900">{item.title}</h4>
                    <p className="text-sm text-slate-600 mt-1">{item.description}</p>
                    <div className="flex gap-2 mt-3 text-xs">
                      <span className="px-2 py-1 bg-white rounded border capitalize">
                        {item.change_type.replace("_", " ")}
                      </span>
                      <span className="text-slate-500">{new Date(item.announcement_date).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 rounded text-xs font-medium whitespace-nowrap ${
                      item.risk_level === "critical"
                        ? "bg-red-100 text-red-700"
                        : item.risk_level === "high"
                          ? "bg-orange-100 text-orange-700"
                          : item.risk_level === "medium"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-green-100 text-green-700"
                    }`}
                  >
                    {item.risk_level.toUpperCase()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
