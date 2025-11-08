"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertTriangle, TrendingUp, RefreshCw } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useLanguageContext } from "@/lib/i18n/context"

export default function RCMPage() {
  const { user } = useAuth()
  const { t } = useLanguageContext()
  const [isSyncing, setIsSyncing] = useState(false)
  const [actionItems, setActionItems] = useState<any[]>([])
  const [fdaIntelligence, setFdaIntelligence] = useState<any[]>([])
  const [impactAssessments, setImpactAssessments] = useState<any[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [items, intel, assessments] = await Promise.all([
          fetch("/api/rcm/action-items")
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((result) => (Array.isArray(result) ? result : result.data || []))
            .catch(() => []),
          fetch("/api/rcm/intelligence")
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((result) => (Array.isArray(result) ? result : result.data || []))
            .catch(() => []),
          fetch("/api/rcm/impact-assessments")
            .then((r) => (r.ok ? r.json() : { data: [] }))
            .then((result) => (Array.isArray(result) ? result : result.data || []))
            .catch(() => []),
        ])
        setActionItems(items)
        setFdaIntelligence(intel)
        setImpactAssessments(assessments)
      } catch (error) {
        console.error("Error fetching RCM data:", error)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [])

  const handleSyncFdaData = async () => {
    setIsSyncing(true)
    try {
      const res = await fetch("/api/rcm/sync-fda-intelligence", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clientId: user?.client_id || "vexim-global-sp",
          userId: user?.id || "system",
        }),
      })
      const data = await res.json()
      if (data.success) {
        const [intel, items] = await Promise.all([
          fetch("/api/rcm/intelligence")
            .then((r) => r.json())
            .then((result) => (Array.isArray(result) ? result : result.data || [])),
          fetch("/api/rcm/action-items")
            .then((r) => r.json())
            .then((result) => (Array.isArray(result) ? result : result.data || [])),
        ])
        setFdaIntelligence(intel)
        setActionItems(items)
      }
    } catch (error) {
      console.error("[v0] FDA sync error:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  const criticalActionItems = Array.isArray(actionItems)
    ? actionItems.filter((item: any) => item.priority === "critical")
    : []
  const totalActionItems = Array.isArray(actionItems) ? actionItems.length : 0

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">{t("rcm.title")}</h1>
        <Button onClick={handleSyncFdaData} disabled={isSyncing} variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          {isSyncing ? t("rcm.syncingFdaData") : t("rcm.syncFdaData")}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("rcm.totalActionItems")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActionItems}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("rcm.regulatoryChangesTracked")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("rcm.criticalItems")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{criticalActionItems.length}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("rcm.requireImmediateAttention")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("rcm.fdaIntelligence")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{fdaIntelligence?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("rcm.realTimeRegulatoryData")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">{t("rcm.assessments")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{impactAssessments?.length || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">{t("rcm.impactEvaluations")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5" />
              {t("rcm.actionItems")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {actionItems && actionItems.length > 0 ? (
                actionItems.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="flex justify-between items-start p-3 border rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                    </div>
                    <Badge variant={item.priority === "critical" ? "destructive" : "secondary"}>{item.priority}</Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t("rcm.noActionItems")}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              {t("rcm.fdaIntelligenceFeed")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {fdaIntelligence && fdaIntelligence.length > 0 ? (
                fdaIntelligence.slice(0, 5).map((item: any) => (
                  <div key={item.id} className="p-3 border rounded-lg">
                    <p className="font-medium text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{item.source}</p>
                    <Badge className="mt-2" variant="outline">
                      {item.type}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground">{t("rcm.noFdaIntelligence")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
