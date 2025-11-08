"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { AlertCircle, CheckCircle, Calendar, Zap } from "lucide-react"

export default function RenewalsPage() {
  const [renewals, setRenewals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState("pending")

  useEffect(() => {
    const fetchRenewals = async () => {
      try {
        const url = `/api/renewals?status=${filterStatus}`
        const response = await fetch(url)
        const data = await response.json()
        setRenewals(data || [])
      } catch (error) {
        console.error("[v0] Error fetching renewals:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRenewals()
  }, [filterStatus])

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
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

  const getUrgencyIcon = (urgency: string) => {
    switch (urgency) {
      case "critical":
        return <AlertCircle className="w-5 h-5" />
      case "completed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      default:
        return <Calendar className="w-5 h-5" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Renewal & Deadline Tracking</h1>
          <p className="text-slate-600 mt-1">Multi-stage alerts at 90, 60, and 30 days</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <AlertCircle className="w-8 h-8 text-red-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Critical (≤30 days)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {renewals.filter((r) => r.urgency === "critical").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Zap className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">High (31-60 days)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {renewals.filter((r) => r.urgency === "high").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <Calendar className="w-8 h-8 text-yellow-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Medium (61-90 days)</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {renewals.filter((r) => r.urgency === "medium").length}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-green-600 mx-auto mb-2" />
              <p className="text-slate-600 text-sm">Completed</p>
              <p className="text-2xl font-bold text-slate-900 mt-1">
                {renewals.filter((r) => r.urgency === "completed").length}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "pending", label: "Pending" },
          { value: "completed", label: "Completed" },
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

      {/* Renewals List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12">Loading renewals...</CardContent>
          </Card>
        ) : renewals.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CheckCircle className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No renewals to display</p>
            </CardContent>
          </Card>
        ) : (
          renewals.map((renewal) => (
            <Card key={renewal.id} className={`border-2 ${getUrgencyColor(renewal.urgency)}`}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getUrgencyIcon(renewal.urgency)}</div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-slate-900">{renewal.reminder_title}</h3>
                      <span className="text-xs px-2 py-1 bg-slate-200 rounded-full">
                        {renewal.facility_type || "General"}
                      </span>
                    </div>

                    <p className="text-sm text-slate-600 mt-1">{renewal.facility_name}</p>

                    <div className="mt-2 grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-slate-600">Due Date</p>
                        <p className="font-medium text-slate-900">{new Date(renewal.due_date).toLocaleDateString()}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Days Remaining</p>
                        <p
                          className={`font-medium ${
                            renewal.days_remaining <= 30
                              ? "text-red-600"
                              : renewal.days_remaining <= 60
                                ? "text-orange-600"
                                : "text-blue-600"
                          }`}
                        >
                          {renewal.days_remaining} days
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">Status</p>
                        <p className="font-medium text-slate-900">{renewal.is_completed ? "Completed" : "Pending"}</p>
                      </div>
                    </div>
                  </div>

                  {!renewal.is_completed && (
                    <Link href={`/dashboard/renewals/${renewal.id}/complete`}>
                      <Button size="sm">Complete Renewal</Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
