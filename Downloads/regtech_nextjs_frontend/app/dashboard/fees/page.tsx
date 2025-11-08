"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguageContext } from "@/lib/i18n/context"
import Link from "next/link"
import { AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function FeesPage() {
  const { t } = useLanguageContext()
  const [fees, setFees] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFees = async () => {
      try {
        const response = await fetch("/api/fees")

        // Check if response is ok
        if (!response.ok) {
          throw new Error(`Failed to fetch fees: ${response.status}`)
        }

        // Check if response is JSON
        const contentType = response.headers.get("content-type")
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Expected JSON response but received HTML")
        }

        const data = await response.json()
        setFees(data || [])
        setError(null)
      } catch (error: any) {
        console.error("[v0] Error fetching fees:", error)
        setError(error.message || "Failed to load fees")
        setFees([])
      } finally {
        setLoading(false)
      }
    }

    fetchFees()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const totalPaid = fees.filter((f) => f.payment_status === "paid").reduce((sum, f) => sum + f.amount, 0)
  const totalPending = fees.filter((f) => f.payment_status !== "paid").reduce((sum, f) => sum + f.amount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("fees.title")}</h1>
          <p className="text-slate-600 mt-1">{t("fees.subtitle")}</p>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("fees.totalPaid")}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">${totalPaid.toLocaleString()}</p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("fees.pendingAmount")}</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">${totalPending.toLocaleString()}</p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">${(totalPaid + totalPending).toLocaleString()}</p>
              </div>
              <AlertCircle className="w-8 h-8 text-slate-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fees List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12 text-slate-600">Loading fees...</CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="text-center py-12">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <p className="text-red-900 font-medium mb-2">Failed to load fees</p>
              <p className="text-red-700 text-sm">{error}</p>
              <Button onClick={() => window.location.reload()} variant="outline" className="mt-4">
                Retry
              </Button>
            </CardContent>
          </Card>
        ) : fees.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600">No fees found</p>
            </CardContent>
          </Card>
        ) : (
          fees.map((fee) => (
            <Card key={fee.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">
                        {fee.fee_type === "mdufa" ? t("fees.mdufa") : t("fees.pdufa")}
                      </h3>
                      <Badge className={getStatusColor(fee.payment_status)}>{fee.payment_status}</Badge>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{fee.facility_name}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">{t("fees.amount")}</p>
                        <p className="font-medium text-slate-900">${fee.amount}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Due Date</p>
                        <p className="font-medium text-slate-900">{new Date(fee.due_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">PIN/PCN</p>
                        <p className="font-medium text-slate-900">{fee.pin_validated ? "Validated" : "Pending"}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Year</p>
                        <p className="font-medium text-slate-900">{fee.fiscal_year}</p>
                      </div>
                    </div>
                  </div>

                  {fee.payment_status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Link href={`/dashboard/fees/${fee.id}/validate`}>
                        <Button variant="outline" size="sm">
                          Validate PIN/PCN
                        </Button>
                      </Link>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2">
        <Link href="/dashboard/fees/invoices">
          <Button variant="outline">View Invoices</Button>
        </Link>
      </div>
    </div>
  )
}
