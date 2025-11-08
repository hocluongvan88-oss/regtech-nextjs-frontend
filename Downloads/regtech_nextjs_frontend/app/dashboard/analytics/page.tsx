"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, FileText, Building2, BarChart3 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { apiClient } from "@/lib/api-client"
import { useLanguageContext } from "@/lib/i18n/context"

interface RiskData {
  riskScore: number
  riskLevel: string
  breakdown: {
    compliance: number
    deadlines: number
    submissions: number
    issues: number
  }
}

interface AnalyticsData {
  facilities: any
  products: any
  submissions: any
  compliance: any
  deadlines: any
  activity: any
}

function getAuthContext() {
  if (typeof window === "undefined") return null
  try {
    const stored = localStorage.getItem("auth_context")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export default function AnalyticsPage() {
  const { t } = useLanguageContext()
  const [riskData, setRiskData] = useState<any>(null)
  const [complianceMetrics, setComplianceMetrics] = useState<any>(null)
  const [kpiData, setKpiData] = useState<any>(null)
  const [trendData, setTrendData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const authContext = getAuthContext()
        if (!authContext || !authContext.clientId) {
          console.error("[v0] No clientId found in auth context")
          setLoading(false)
          return
        }

        const clientId = authContext.clientId

        const [risk, compliance, kpi, trend] = await Promise.all([
          apiClient(`/api/risk-management/registers?summary=true&clientId=${clientId}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          apiClient(`/api/analytics/compliance?clientId=${clientId}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          apiClient(`/api/analytics/kpi?clientId=${clientId}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          apiClient(`/api/analytics/trends?clientId=${clientId}&metricName=compliance_score`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
        ])

        setRiskData(risk)
        setComplianceMetrics(compliance)
        setKpiData(kpi)
        setTrendData(trend)
      } catch (error) {
        console.error("[v0] Error fetching analytics data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchData, 30000)
    return () => clearInterval(interval)
  }, [])

  const getRiskColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-900 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-900 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-900 border-yellow-300"
      default:
        return "bg-green-100 text-green-900 border-green-300"
    }
  }

  const getRiskIcon = (level: string) => {
    switch (level) {
      case "critical":
      case "high":
        return <AlertTriangle className="w-8 h-8" />
      case "medium":
        return <Clock className="w-8 h-8" />
      default:
        return <CheckCircle className="w-8 h-8" />
    }
  }

  const calculateRiskLevel = (score: number): string => {
    if (score >= 60) return "critical"
    if (score >= 40) return "high"
    if (score >= 20) return "medium"
    return "low"
  }

  const overallRiskScore =
    riskData?.length > 0
      ? Math.round(riskData.reduce((sum: number, r: any) => sum + (r.risk_score || 0), 0) / riskData.length)
      : 50

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("analytics.title")}</h1>
          <p className="text-slate-600 mt-1">{t("analytics.subtitle")}</p>
        </div>
        <Button variant="outline" size="sm">
          <BarChart3 className="w-4 h-4 mr-2" />
          {t("analytics.exportReport")}
        </Button>
      </div>

      {/* Overall Risk Score Card */}
      <Card className={`border-2 ${getRiskColor(calculateRiskLevel(overallRiskScore))}`}>
        <CardHeader>
          <CardTitle>{t("analytics.overallComplianceRiskScore")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-5xl font-bold">{overallRiskScore}</div>
              <p className="text-sm mt-2 capitalize">
                {t("analytics.riskLevel")}: {t(`analytics.${calculateRiskLevel(overallRiskScore)}`)}
              </p>
            </div>
            {getRiskIcon(calculateRiskLevel(overallRiskScore))}
          </div>

          {/* Risk Register Breakdown */}
          <div className="grid grid-cols-4 gap-2 mt-6">
            <div className="bg-white bg-opacity-50 rounded p-3">
              <p className="text-xs text-slate-600">{t("analytics.totalRisks")}</p>
              <p className="text-lg font-semibold mt-1">{riskData?.length || 0}</p>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-3">
              <p className="text-xs text-slate-600">{t("analytics.critical")}</p>
              <p className="text-lg font-semibold mt-1 text-red-600">
                {riskData?.filter((r: any) => r.risk_level === "critical").length || 0}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-3">
              <p className="text-xs text-slate-600">{t("analytics.mitigations")}</p>
              <p className="text-lg font-semibold mt-1">
                {riskData?.filter((r: any) => r.mitigation_strategy).length || 0}
              </p>
            </div>
            <div className="bg-white bg-opacity-50 rounded p-3">
              <p className="text-xs text-slate-600">{t("analytics.assessments")}</p>
              <p className="text-lg font-semibold mt-1">
                {riskData?.filter((r: any) => r.last_assessment_date).length || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* KPI Metrics Grid */}
      {kpiData && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="w-5 h-5" />
                  {t("analytics.facilitiesStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.facilitiesTotal")}</span>
                    <span className="font-semibold">{kpiData.facilities_total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.facilitiesRegistered")}</span>
                    <span className="font-semibold text-green-600">{kpiData.facilities_registered || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.facilitiesNeedsAction")}</span>
                    <span className="font-semibold text-red-600">{kpiData.facilities_action_needed || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  {t("analytics.submissionsStatus")}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.submissionsTotal")}</span>
                    <span className="font-semibold">{kpiData.submissions_total || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.submissionsApproved")}</span>
                    <span className="font-semibold text-green-600">{kpiData.submissions_approved || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.submissionsPending")}</span>
                    <span className="font-semibold text-yellow-600">{kpiData.submissions_pending || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.compliancePerformance")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.onTrack")}</span>
                    <span className="font-semibold text-green-600">{kpiData.compliance_on_track || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.atRisk")}</span>
                    <span className="font-semibold text-orange-600">{kpiData.compliance_at_risk || 0}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.critical")}</span>
                    <span className="font-semibold text-red-600">{kpiData.compliance_critical || 0}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t("analytics.trendAnalysis")}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.improving")}</span>
                    <span className="font-semibold text-green-600">{trendData?.improving_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.stable")}</span>
                    <span className="font-semibold text-blue-600">{trendData?.stable_count || 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">{t("analytics.declining")}</span>
                    <span className="font-semibold text-red-600">{trendData?.declining_count || 0}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}

      {/* Compliance Summary */}
      {complianceMetrics && (
        <Card>
          <CardHeader>
            <CardTitle>{t("analytics.dailyComplianceMetrics")}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                <p className="text-xs text-green-700">{t("analytics.fda483s")}</p>
                <p className="text-2xl font-bold text-green-900 mt-2">{complianceMetrics.fda_483_count || 0}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                <p className="text-xs text-orange-700">{t("analytics.warningLetters")}</p>
                <p className="text-2xl font-bold text-orange-900 mt-2">{complianceMetrics.warning_letter_count || 0}</p>
              </div>
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <p className="text-xs text-red-700">{t("analytics.complaints")}</p>
                <p className="text-2xl font-bold text-red-900 mt-2">{complianceMetrics.complaint_count || 0}</p>
              </div>
              <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                <p className="text-xs text-yellow-700">{t("analytics.recalls")}</p>
                <p className="text-2xl font-bold text-yellow-900 mt-2">{complianceMetrics.recall_count || 0}</p>
              </div>
              <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                <p className="text-xs text-slate-700">{t("analytics.totalIssues")}</p>
                <p className="text-2xl font-bold text-slate-900 mt-2">{complianceMetrics.total_issues || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Risk Recommendations */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle>{t("analytics.recommendations")}</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-slate-700">
            {calculateRiskLevel(overallRiskScore) === "critical" && (
              <>
                <li>• {t("analytics.immediateActionRequired")}</li>
                <li>• {t("analytics.reviewAndResolve")}</li>
                <li>• {t("analytics.scheduleEmergency")}</li>
              </>
            )}
            {calculateRiskLevel(overallRiskScore) === "high" && (
              <>
                <li>• {t("analytics.addressHighPriority")}</li>
                <li>• {t("analytics.monitorCritical")}</li>
                <li>• {t("analytics.escalateTopFive")}</li>
              </>
            )}
            {calculateRiskLevel(overallRiskScore) === "medium" && (
              <>
                <li>• {t("analytics.continueProactive")}</li>
                <li>• {t("analytics.completeAssessments")}</li>
                <li>• {t("analytics.implementPlanned")}</li>
              </>
            )}
            {calculateRiskLevel(overallRiskScore) === "low" && (
              <>
                <li>• {t("analytics.maintainCurrent")}</li>
                <li>• {t("analytics.continueRegular")}</li>
                <li>• {t("analytics.updateQuarterly")}</li>
              </>
            )}
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
