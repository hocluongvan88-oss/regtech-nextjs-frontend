"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Clock, TrendingUp } from "lucide-react"
import Link from "next/link"
import { useLanguageContext } from "@/lib/i18n/context"

export default function CompliancePage() {
  const { t } = useLanguageContext()
  const [compliance, setCompliance] = useState<any[]>([])
  const [alerts, setAlerts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchComplianceData = async () => {
      try {
        const [complianceRes, alertsRes] = await Promise.all([
          fetch("/api/compliance"),
          fetch("/api/compliance-alerts"),
        ])

        const complianceData = await complianceRes.json()
        const alertsData = await alertsRes.json()

        setCompliance(complianceData)
        setAlerts(alertsData)
      } catch (error) {
        console.error("[v0] Error fetching compliance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchComplianceData()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "compliant":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warning":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "non_compliant":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return <Clock className="w-5 h-5 text-slate-600" />
    }
  }

  const getAlertColor = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return "bg-red-100 border-red-300 text-red-900"
      case "high":
        return "bg-orange-100 border-orange-300 text-orange-900"
      case "medium":
        return "bg-yellow-100 border-yellow-300 text-yellow-900"
      default:
        return "bg-blue-100 border-blue-300 text-blue-900"
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t("compliance.title")}</h1>
        <p className="text-slate-600 mt-1">{t("compliance.subtitle")}</p>
      </div>

      {alerts.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t("compliance.activeAlerts")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {alerts.slice(0, 5).map((alert) => (
                <div key={alert.id} className={`p-3 rounded border ${getAlertColor(alert.urgency)}`}>
                  <p className="font-semibold text-sm">{alert.alert_message}</p>
                  <p className="text-xs mt-1">
                    {t("common.type")}: {alert.alert_type}
                  </p>
                </div>
              ))}
            </div>
            {alerts.length > 5 && (
              <p className="text-sm text-slate-600 mt-3">
                {t("common.and")} {alerts.length - 5} {t("common.moreAlerts")}
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="text-center py-12">{t("compliance.loadingCompliance")}</div>
      ) : compliance.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <p className="text-slate-600">{t("compliance.noComplianceRecords")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {compliance.map((item) => (
            <Card key={item.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    {getStatusIcon(item.compliance_status)}
                    <div>
                      <p className="font-medium text-slate-900">{item.compliance_type}</p>
                      <p className="text-sm text-slate-600">
                        {t("compliance.lastInspection")}:{" "}
                        {item.last_inspection_date ? new Date(item.last_inspection_date).toLocaleDateString() : "N/A"}
                      </p>
                      {item.warning_message && <p className="text-sm text-yellow-700 mt-1">⚠️ {item.warning_message}</p>}
                    </div>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-sm font-medium ${
                      item.compliance_status === "compliant"
                        ? "bg-green-100 text-green-800"
                        : item.compliance_status === "warning"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                    }`}
                  >
                    {t(`compliance.${item.compliance_status.replace("_", "")}`)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <div className="flex gap-4">
        <Link href="/dashboard/renewals">
          <Button variant="outline">
            <Clock className="w-4 h-4 mr-2" />
            {t("compliance.viewRenewalSchedule")}
          </Button>
        </Link>
        <Link href="/dashboard/analytics">
          <Button variant="outline">
            <TrendingUp className="w-4 h-4 mr-2" />
            {t("compliance.viewRiskAnalytics")}
          </Button>
        </Link>
      </div>
    </div>
  )
}
