"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, AlertTriangle, RefreshCw, Download, TrendingUp } from "lucide-react"

export default function FDAPage() {
  const [enforcementActions, setEnforcementActions] = useState<any[]>([])
  const [recalls, setRecalls] = useState<any[]>([])
  const [adverseEvents, setAdverseEvents] = useState<any[]>([])
  const [enforcementLoading, setEnforcementLoading] = useState(true)
  const [recallsLoading, setRecallsLoading] = useState(true)
  const [eventsLoading, setEventsLoading] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [enforcement, recallData, adverse] = await Promise.all([
          fetch("/api/fda/enforcement-actions")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch("/api/fda/recalls")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch("/api/fda/adverse-events")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ])
        setEnforcementActions(enforcement)
        setRecalls(recallData)
        setAdverseEvents(adverse)
      } catch (error) {
        console.error("Error fetching FDA data:", error)
      } finally {
        setEnforcementLoading(false)
        setRecallsLoading(false)
        setEventsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 300000) // 5 minutes
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const stored = localStorage.getItem("fda-last-sync")
    if (stored) setLastSync(new Date(stored))
  }, [])

  const handleSync = async () => {
    try {
      const response = await fetch("/api/cron/sync-fda-data", { method: "POST" })
      if (response.ok) {
        setLastSync(new Date())
        localStorage.setItem("fda-last-sync", new Date().toISOString())
        const [enforcement, recallData, adverse] = await Promise.all([
          fetch("/api/fda/enforcement-actions").then((r) => r.json()),
          fetch("/api/fda/recalls").then((r) => r.json()),
          fetch("/api/fda/adverse-events").then((r) => r.json()),
        ])
        setEnforcementActions(enforcement)
        setRecalls(recallData)
        setAdverseEvents(adverse)
      }
    } catch (error) {
      console.error("[v0] Sync error:", error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">FDA Public Data Intelligence</h1>
          <p className="text-slate-600 mt-1">Real-time enforcement actions, recalls, and adverse events from FDA</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={handleSync}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Sync Data
          </Button>
          <Button variant="outline" size="sm">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Last Sync Info */}
      {lastSync && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="py-3">
            <p className="text-sm text-blue-700">Last sync: {lastSync.toLocaleString()}</p>
          </CardContent>
        </Card>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Enforcement Actions (90d)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{enforcementActions?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Active enforcement</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Product Recalls</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{recalls?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Active recalls</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Adverse Events (6m)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{adverseEvents?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">Total events</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Critical Issues</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {(enforcementActions?.filter((e: any) => e.severity === "critical").length || 0) +
                (recalls?.filter((r: any) => r.classification === "Class I").length || 0)}
            </div>
            <p className="text-xs text-slate-500 mt-1">Require attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Enforcement Actions */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5" />
            FDA Enforcement Actions (Last 90 Days)
          </h2>
        </div>

        <div className="space-y-3">
          {enforcementLoading ? (
            <Card>
              <CardContent className="py-6 text-center text-slate-500">Loading enforcement actions...</CardContent>
            </Card>
          ) : enforcementActions?.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-slate-500">No enforcement actions found</CardContent>
            </Card>
          ) : (
            enforcementActions?.slice(0, 5).map((action: any, idx: number) => (
              <Card key={idx} className="border-l-4 border-l-red-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{action.enforcement_type}</h3>
                        <Badge className={getSeverityColor(action.severity)}>{action.severity}</Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{action.action_summary}</p>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Facility: {action.facility_name}</span>
                        <span>Date: {new Date(action.enforcement_date).toLocaleDateString()}</span>
                        <span className="text-blue-600 font-medium">Code: {action.product_code}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Recalls */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Product Recalls
          </h2>
        </div>

        <div className="space-y-3">
          {recallsLoading ? (
            <Card>
              <CardContent className="py-6 text-center text-slate-500">Loading recalls...</CardContent>
            </Card>
          ) : recalls?.length === 0 ? (
            <Card>
              <CardContent className="py-6 text-center text-slate-500">No active recalls found</CardContent>
            </Card>
          ) : (
            recalls?.slice(0, 5).map((recall: any, idx: number) => (
              <Card key={idx} className="border-l-4 border-l-orange-500">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{recall.product_name}</h3>
                        <Badge
                          className={
                            recall.classification === "Class I"
                              ? "bg-red-100 text-red-800"
                              : recall.classification === "Class II"
                                ? "bg-orange-100 text-orange-800"
                                : "bg-yellow-100 text-yellow-800"
                          }
                        >
                          {recall.classification}
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{recall.reason_for_recall}</p>
                      <div className="flex gap-4 text-xs text-slate-500">
                        <span>Recall Date: {new Date(recall.recall_initiation_date).toLocaleDateString()}</span>
                        <span className="text-blue-600 font-medium">UPC: {recall.upc}</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Adverse Events Summary */}
      <div>
        <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Adverse Events Summary (Last 6 Months)
        </h2>

        {eventsLoading ? (
          <Card>
            <CardContent className="py-6 text-center text-slate-500">Loading adverse events...</CardContent>
          </Card>
        ) : adverseEvents?.length === 0 ? (
          <Card>
            <CardContent className="py-6 text-center text-slate-500">No adverse events found</CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-slate-900">{adverseEvents?.length || 0}</p>
                  <p className="text-xs text-slate-600 mt-1">Total Events</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-red-600">
                    {adverseEvents?.filter((e: any) => e.serious === "Yes").length || 0}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Serious</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-orange-600">
                    {adverseEvents?.filter((e: any) => e.patient_outcome === "Death").length || 0}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Deaths</p>
                </div>
                <div className="text-center p-3 border rounded-lg">
                  <p className="text-2xl font-bold text-yellow-600">
                    {adverseEvents?.filter((e: any) => e.patient_outcome === "Hospitalization").length || 0}
                  </p>
                  <p className="text-xs text-slate-600 mt-1">Hospitalizations</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 mt-4">Data from FDA FAERS database</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
