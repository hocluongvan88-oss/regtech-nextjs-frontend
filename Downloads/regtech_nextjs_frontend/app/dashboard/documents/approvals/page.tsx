"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguageContext } from "@/lib/i18n/context"
import Link from "next/link"
import { Clock, CheckCircle, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function ApprovalsPage() {
  const { t } = useLanguageContext()
  const [approvals, setApprovals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchApprovals = async () => {
      try {
        const response = await apiClient("/api/documents/approvals/pending")
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || "Failed to fetch approvals")
        }
        const data = await response.json()
        setApprovals(Array.isArray(data?.data) ? data.data : [])
      } catch (error) {
        console.error("[v0] Error fetching approvals:", error)
        setError(error instanceof Error ? error.message : "Failed to load approvals")
        setApprovals([])
      } finally {
        setLoading(false)
      }
    }

    fetchApprovals()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t("approvals.title")}</h1>
        <p className="text-slate-600 mt-1">{t("approvals.subtitle")}</p>
      </div>

      {/* Error Alert */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-800">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("approvals.pending")}</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {Array.isArray(approvals) ? approvals.filter((a) => a.status === "pending").length : 0}
                </p>
              </div>
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("approvals.approved")}</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {Array.isArray(approvals) ? approvals.filter((a) => a.status === "approved").length : 0}
                </p>
              </div>
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("approvals.rejected")}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {Array.isArray(approvals) ? approvals.filter((a) => a.status === "rejected").length : 0}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Approvals List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12 text-slate-600">{t("approvals.loadingApprovals")}</CardContent>
          </Card>
        ) : !Array.isArray(approvals) || approvals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600">{t("approvals.noApprovalsPending")}</p>
            </CardContent>
          </Card>
        ) : (
          approvals.map((approval) => (
            <Card key={approval.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{approval.documentName}</h3>
                      <Badge className={getStatusColor(approval.status)}>{approval.status}</Badge>
                    </div>

                    <p className="text-sm text-slate-600 mb-3">{approval.description}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">{t("approvals.currentStep")}</p>
                        <p className="font-medium text-slate-900">
                          {approval.currentStep} of {approval.totalSteps}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t("approvals.currentApprover")}</p>
                        <p className="font-medium text-slate-900">{approval.currentApprover}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t("approvals.created")}</p>
                        <p className="font-medium text-slate-900">
                          {new Date(approval.createdDate).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t("approvals.due")}</p>
                        <p
                          className={`font-medium ${
                            new Date(approval.dueDate) < new Date() ? "text-red-600" : "text-slate-900"
                          }`}
                        >
                          {new Date(approval.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    {approval.status === "pending" && (
                      <Link href={`/dashboard/documents/approve/${approval.id}`}>
                        <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                          {t("approvals.reviewAndApprove")}
                        </Button>
                      </Link>
                    )}
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
