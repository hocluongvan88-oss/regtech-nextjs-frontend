"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useLanguageContext } from "@/lib/i18n/context"
import Link from "next/link"
import { Calendar, AlertCircle, CheckCircle, Clock } from "lucide-react"

export default function ContractsPage() {
  const { t } = useLanguageContext()
  const [contracts, setContracts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContracts = async () => {
      try {
        const response = await fetch("/api/contracts/service")
        const result = await response.json()
        setContracts(result.data || [])
      } catch (error) {
        console.error("[v0] Error fetching contracts:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchContracts()
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "pending_renewal":
        return "bg-yellow-100 text-yellow-800"
      case "expired":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="w-4 h-4" />
      case "pending_renewal":
        return <Clock className="w-4 h-4" />
      case "expired":
        return <AlertCircle className="w-4 h-4" />
      default:
        return <Calendar className="w-4 h-4" />
    }
  }

  const calculateDaysRemaining = (endDate: string) => {
    const today = new Date()
    const end = new Date(endDate)
    const diffTime = end.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return Math.max(0, diffDays)
  }

  const getContractTypeName = (type: string) => {
    const types: Record<string, string> = {
      US_AGENT_REP: "U.S. Agent Representation",
      QMS_SUPPORT: "QMS Support",
      COMPLIANCE_SERVICES: "Compliance Services",
    }
    return types[type] || type
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("contracts.title")}</h1>
          <p className="text-slate-600 mt-1">{t("contracts.subtitle")}</p>
        </div>
        <Link href="/dashboard/contracts/new">
          <Button className="bg-blue-600 hover:bg-blue-700">{t("common.create")} Contract</Button>
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Active Contracts</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {contracts.filter((c) => c.contract_status === "active").length}
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
                <p className="text-sm text-slate-600">Pending Renewal</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {contracts.filter((c) => c.contract_status === "pending_renewal").length}
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
                <p className="text-sm text-slate-600">Expired</p>
                <p className="text-2xl font-bold text-red-600 mt-1">
                  {contracts.filter((c) => c.contract_status === "expired").length}
                </p>
              </div>
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Contracts List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="text-center py-12 text-slate-600">Loading contracts...</CardContent>
          </Card>
        ) : contracts.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600">{t("contracts.noContracts")}</p>
            </CardContent>
          </Card>
        ) : (
          contracts.map((contract) => {
            const daysRemaining = calculateDaysRemaining(contract.contract_end_date)

            return (
              <Card key={contract.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-semibold text-slate-900">{getContractTypeName(contract.contract_type)}</h3>
                        <Badge className={getStatusColor(contract.contract_status)}>
                          {getStatusIcon(contract.contract_status)}
                          <span className="ml-1">{contract.contract_status.replace("_", " ")}</span>
                        </Badge>
                      </div>

                      {contract.contract_notes && (
                        <p className="text-sm text-slate-600 mb-3">{contract.contract_notes}</p>
                      )}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-slate-600">{t("contracts.startDate")}</p>
                          <p className="font-medium text-slate-900">
                            {new Date(contract.contract_start_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">{t("contracts.endDate")}</p>
                          <p className="font-medium text-slate-900">
                            {new Date(contract.contract_end_date).toLocaleDateString()}
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">{t("contracts.daysRemaining")}</p>
                          <p
                            className={`font-medium ${
                              daysRemaining <= 30
                                ? "text-red-600"
                                : daysRemaining <= 90
                                  ? "text-yellow-600"
                                  : "text-green-600"
                            }`}
                          >
                            {daysRemaining} days
                          </p>
                        </div>
                        <div>
                          <p className="text-slate-600">Duration</p>
                          <p className="font-medium text-slate-900">{contract.contract_duration_months} months</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 ml-4">
                      <Link href={`/dashboard/contracts/${contract.id}`}>
                        <Button variant="outline" size="sm">
                          View
                        </Button>
                      </Link>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
