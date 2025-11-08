"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguageContext } from "@/lib/i18n/context"
import { useToast } from "@/hooks/use-toast"
import { AlertCircle, Clock, CheckCircle, Loader2 } from "lucide-react"

export default function ConsentTrackingPage() {
  const { t } = useLanguageContext()
  const { toast } = useToast()
  const [consents, setConsents] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    const fetchConsents = async () => {
      try {
        const response = await fetch("/api/contracts/consent-tracking")
        const data = await response.json()
        setConsents(data || [])
      } catch (error) {
        console.error("[v0] Error fetching consents:", error)
        toast({
          title: "Error",
          description: "Failed to load consent tracking data",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchConsents()
  }, [toast])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "acknowledged":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const handleAcknowledge = async (consentId: string) => {
    setActionLoading(consentId)
    try {
      const response = await fetch(`/api/contracts/consent/${consentId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "acknowledge" }),
      })

      if (!response.ok) {
        throw new Error("Failed to acknowledge consent")
      }

      toast({
        title: "Success",
        description: "Consent acknowledged successfully",
      })

      // Refresh consent list
      const refreshResponse = await fetch("/api/contracts/consent-tracking")
      const refreshData = await refreshResponse.json()
      setConsents(refreshData || [])
    } catch (error) {
      console.error("[v0] Error acknowledging consent:", error)
      toast({
        title: "Error",
        description: "Failed to acknowledge consent",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleEscalate = async (consentId: string) => {
    setActionLoading(consentId)
    try {
      const response = await fetch(`/api/contracts/consent/${consentId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          escalation_reason: "Escalated from consent tracking page",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to escalate consent")
      }

      toast({
        title: "Success",
        description: "Consent escalated successfully",
      })

      // Refresh consent list
      const refreshResponse = await fetch("/api/contracts/consent-tracking")
      const refreshData = await refreshResponse.json()
      setConsents(refreshData || [])
    } catch (error) {
      console.error("[v0] Error escalating consent:", error)
      toast({
        title: "Error",
        description: "Failed to escalate consent",
        variant: "destructive",
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t("contracts.consentTracking")}</h1>
        <p className="text-slate-600 mt-1">FDA 10-business-day agent acknowledgment process</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Acknowledged</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {consents.filter((c) => c.acknowledgment_status === "acknowledged").length}
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
                <p className="text-sm text-slate-600">Pending</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {consents.filter((c) => c.acknowledgment_status === "pending").length}
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
                <p className="text-sm text-slate-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {consents.filter((c) => c.acknowledgment_overdue === true).length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Consent Tracking List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12 text-slate-600">Loading consent tracking...</CardContent>
          </Card>
        ) : consents.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600">No consent tracking records</p>
            </CardContent>
          </Card>
        ) : (
          consents.map((consent) => (
            <Card key={consent.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-slate-900">{consent.facility_name}</h3>
                      <Badge className={getStatusColor(consent.acknowledgment_status)}>
                        {consent.acknowledgment_status}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-3">
                      <div>
                        <p className="text-slate-600">{t("contracts.consentDue")}</p>
                        <p className="font-medium text-slate-900">
                          {new Date(consent.fda_deadline).toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t("contracts.businessDays")}</p>
                        <p
                          className={`font-medium ${
                            consent.business_days_remaining <= 0
                              ? "text-red-600"
                              : consent.business_days_remaining <= 3
                                ? "text-orange-600"
                                : "text-green-600"
                          }`}
                        >
                          {Math.max(0, consent.business_days_remaining)} days
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-600">{t("contracts.agent")}</p>
                        <p className="font-medium text-slate-900">{consent.agent_email}</p>
                      </div>
                      <div>
                        <p className="text-slate-600">Status</p>
                        <p className="font-medium text-slate-900">
                          {consent.acknowledgment_overdue ? "OVERDUE" : "ON TRACK"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {consent.acknowledgment_status === "pending" && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAcknowledge(consent.id)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === consent.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            {t("contracts.acknowledge")}
                          </>
                        ) : (
                          t("contracts.acknowledge")
                        )}
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleEscalate(consent.id)}
                        disabled={actionLoading !== null}
                      >
                        {actionLoading === consent.id ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                            {t("contracts.escalate")}
                          </>
                        ) : (
                          t("contracts.escalate")
                        )}
                      </Button>
                    </div>
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
