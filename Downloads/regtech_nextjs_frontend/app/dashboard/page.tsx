"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useLanguageContext } from "@/lib/i18n/context"

export default function DashboardPage() {
  const { t } = useLanguageContext()
  const [stats, setStats] = useState({
    totalClients: 0,
    totalFacilities: 0,
    totalProducts: 0,
    activeSubmissions: 0,
    pendingRenewals: 0,
    documentsCount: 0,
    criticalAlerts: 0,
    complianceScore: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [clientRes, facilitiesRes, productsRes, submissionsRes, renewalsRes, docsRes, complianceRes] =
          await Promise.all([
            fetch("/api/clients"),
            fetch("/api/facilities"),
            fetch("/api/products"),
            fetch("/api/submissions?status=submitted"),
            fetch("/api/renewals?status=pending"),
            fetch("/api/documents"),
            fetch("/api/compliance"),
          ])

        const clients = await clientRes.json()
        const facilities = await facilitiesRes.json()
        const products = await productsRes.json()
        const submissions = await submissionsRes.json()
        const renewals = await renewalsRes.json()
        const documents = await docsRes.json()
        const compliance = await complianceRes.json()

        setStats({
          totalClients: clients.length,
          totalFacilities: facilities.length,
          totalProducts: products.length,
          activeSubmissions: submissions.length,
          pendingRenewals: renewals.filter((r: any) => r.urgency === "critical").length,
          documentsCount: documents.length,
          criticalAlerts: compliance.filter((c: any) => c.compliance_status === "non_compliant").length,
          complianceScore:
            compliance.length > 0
              ? Math.round(
                  (compliance.filter((c: any) => c.compliance_status === "compliant").length / compliance.length) * 100,
                )
              : 0,
        })
      } catch (error) {
        console.error("[v0] Error fetching stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [])

  const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: string; color?: string }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <span className="text-2xl">{icon}</span>
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${color || ""}`}>{value}</div>
        <p className="text-xs text-slate-500 mt-1">{t("dashboard.stats.totalInSystem")}</p>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t("dashboard.title")}</h1>
        <p className="text-slate-600 mt-2">{t("dashboard.subtitle")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title={t("dashboard.stats.totalClients")} value={stats.totalClients} icon="🏢" />
        <StatCard title={t("dashboard.stats.facilities")} value={stats.totalFacilities} icon="🏭" />
        <StatCard title={t("dashboard.stats.products")} value={stats.totalProducts} icon="📦" />
        <StatCard title={t("dashboard.stats.activeSubmissions")} value={stats.activeSubmissions} icon="📋" />
      </div>

      {/* Phase Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title={t("dashboard.stats.criticalRenewals")}
          value={stats.pendingRenewals}
          icon="🔄"
          color="text-red-600"
        />
        <StatCard title={t("dashboard.stats.documents")} value={stats.documentsCount} icon="📄" />
        <StatCard
          title={t("dashboard.stats.complianceIssues")}
          value={stats.criticalAlerts}
          icon="⚠️"
          color={stats.criticalAlerts > 0 ? "text-red-600" : "text-green-600"}
        />
        <StatCard
          title={t("dashboard.stats.complianceScore")}
          value={stats.complianceScore}
          icon="✓"
          color="text-green-600"
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.quickActions")}</CardTitle>
          <CardDescription>{t("dashboard.commonTasks")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Link href="/dashboard/clients">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.manageClients")}
              </Button>
            </Link>
            <Link href="/dashboard/facilities/new">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.newFacility")}
              </Button>
            </Link>
            <Link href="/dashboard/products/new">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.newProduct")}
              </Button>
            </Link>
            <Link href="/dashboard/submissions/new">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.newSubmission")}
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
            <Link href="/dashboard/documents">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.manageDocuments")}
              </Button>
            </Link>
            <Link href="/dashboard/renewals">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.viewRenewals")}
              </Button>
            </Link>
            <Link href="/dashboard/coe/new">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.createCOE")}
              </Button>
            </Link>
            <Link href="/dashboard/analytics">
              <Button className="w-full bg-transparent" variant="outline">
                {t("dashboard.viewAnalytics")}
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Critical Alerts Section */}
      {stats.criticalAlerts > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="text-red-900 flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              {t("dashboard.actionRequired")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-800 mb-3">
              {t("dashboard.complianceIssues", {
                count: stats.criticalAlerts,
              })}
            </p>
            <Link href="/dashboard/compliance">
              <Button className="bg-red-600 hover:bg-red-700">{t("dashboard.reviewCompliance")}</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* System Status */}
      <Card>
        <CardHeader>
          <CardTitle>{t("dashboard.systemStatus")}</CardTitle>
          <CardDescription>{t("dashboard.overviewHealth")}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg border border-green-200">
              <div>
                <span className="text-sm font-medium text-green-900">{t("dashboard.allSystemsOperational")}</span>
                <p className="text-xs text-green-700 mt-1">{t("dashboard.systemsActive")}</p>
              </div>
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
