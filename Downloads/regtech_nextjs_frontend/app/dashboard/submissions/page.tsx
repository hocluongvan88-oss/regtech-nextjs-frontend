"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Eye, FileText, Clock, CheckCircle, XCircle } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { useLanguageContext } from "@/lib/i18n/context"
import { apiClient } from "@/lib/api-client"

export default function SubmissionsPage() {
  const { hasPermission } = useAuth()
  const { t } = useLanguageContext()
  const [submissions, setSubmissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string>("all")

  useEffect(() => {
    fetchSubmissions()
  }, [filterStatus])

  const fetchSubmissions = async () => {
    try {
      let url = "/api/submissions"
      if (filterStatus !== "all") {
        url += `?status=${filterStatus}`
      }
      const response = await apiClient(url)
      const data = await response.json()
      setSubmissions(data)
    } catch (error) {
      console.error("[v0] Error fetching submissions:", error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "submitted":
        return <FileText className="w-5 h-5 text-blue-600" />
      case "pending_review":
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <FileText className="w-5 h-5 text-slate-600" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("submissions.title")}</h1>
          <p className="text-slate-600 mt-1">{t("submissions.subtitle")}</p>
        </div>
        {hasPermission("create_submissions") && (
          <Link href="/dashboard/submissions/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              {t("submissions.newSubmission")}
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "all", label: t("submissions.all") },
          { value: "draft", label: t("submissions.draft") },
          { value: "submitted", label: t("submissions.submitted") },
          { value: "pending_review", label: t("submissions.pendingReview") },
          { value: "approved", label: t("submissions.approved") },
        ].map((filter) => (
          <Button
            key={filter.value}
            variant={filterStatus === filter.value ? "default" : "outline"}
            onClick={() => setFilterStatus(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Submissions List */}
      {loading ? (
        <div className="text-center py-12">{t("submissions.loadingSubmissions")}</div>
      ) : submissions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-600">{t("submissions.noSubmissionsFound")}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {submissions.map((submission) => (
            <Card key={submission.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    {/* Icon */}
                    <div className="mt-1">{getStatusIcon(submission.submission_status)}</div>

                    {/* Details */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-slate-900">
                          {submission.submission_type.charAt(0).toUpperCase() + submission.submission_type.slice(1)}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${getStatusColor(submission.submission_status)}`}
                        >
                          {submission.submission_status.replace("_", " ")}
                        </span>
                      </div>

                      <div className="mt-2 grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">{t("submissions.submissionNumber")}</p>
                          <p className="font-mono text-slate-900">
                            {submission.submission_number || t("submissions.pending")}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">{t("submissions.submitted")}</p>
                          <p className="text-slate-900">
                            {submission.submitted_date ? new Date(submission.submitted_date).toLocaleDateString() : "—"}
                          </p>
                        </div>
                      </div>

                      {submission.expiration_date && (
                        <div className="mt-2 text-sm">
                          <p className="text-slate-600">{t("submissions.expires")}</p>
                          <p className="text-slate-900">{new Date(submission.expiration_date).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Action */}
                  <Link href={`/dashboard/submissions/${submission.id}`}>
                    <Button size="sm" variant="outline">
                      <Eye className="w-4 h-4 mr-2" />
                      {t("submissions.view")}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
