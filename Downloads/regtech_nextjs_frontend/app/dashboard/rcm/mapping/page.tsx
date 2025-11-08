"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useLanguageContext } from "@/lib/i18n/context"
import { MappingMatrix } from "@/components/rcm/mapping-matrix"
import { BarChart3, RefreshCw } from "lucide-react"

export default function MappingPage() {
  const { t } = useLanguageContext()
  const [isRefreshing, setIsRefreshing] = useState(false)

  const handleRefreshMappings = async () => {
    setIsRefreshing(true)
    try {
      await fetch("/api/rcm/mapping/refresh", { method: "POST" })
      alert("Regulatory mappings refreshed successfully")
      window.location.reload()
    } catch (error) {
      console.error("[v0] Error refreshing mappings:", error)
    } finally {
      setIsRefreshing(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("rcm.productMapping")}</h1>
          <p className="text-slate-600 mt-1">Map your products to applicable FDA regulations</p>
        </div>
        <Button onClick={handleRefreshMappings} disabled={isRefreshing} className="bg-blue-600 hover:bg-blue-700">
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          {isRefreshing ? "Refreshing..." : "Refresh Mappings"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Products</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">24</p>
              </div>
              <BarChart3 className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Regulations</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">156</p>
              </div>
              <BarChart3 className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Mappings</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">487</p>
              </div>
              <BarChart3 className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mapping Matrix */}
      <MappingMatrix />

      {/* Info Card */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How It Works</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>1. AI analyzes your product codes (Q-codes)</li>
            <li>2. Maps applicable FDA regulations automatically</li>
            <li>3. Updates in real-time as new regulations are published</li>
            <li>4. Identifies which products are affected by new requirements</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
