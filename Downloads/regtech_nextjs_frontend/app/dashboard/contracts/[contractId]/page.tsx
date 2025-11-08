"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft } from "lucide-react"
import { ContractRenewalTimeline } from "@/components/dashboard/contracts/contract-renewal-timeline"
import { useToast } from "@/hooks/use-toast"

export default function ContractDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [contract, setContract] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchContract = async () => {
      try {
        const response = await fetch(`/api/contracts/service/${params.contractId}`)

        if (!response.ok) {
          throw new Error("Failed to fetch contract")
        }

        const result = await response.json()
        setContract(result.data)
      } catch (error) {
        console.error("[v0] Error fetching contract:", error)
        setContract(null)
      } finally {
        setLoading(false)
      }
    }

    fetchContract()
  }, [params.contractId])

  const handleRenewContract = async () => {
    try {
      const response = await fetch(`/api/contracts/service/${params.contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contract_status: "pending_renewal",
          contract_end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split("T")[0],
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to renew contract")
      }

      const result = await response.json()
      setContract(result.data)

      toast({
        title: "Success",
        description: "Contract renewal initiated successfully.",
      })
    } catch (error) {
      console.error("[v0] Error renewing contract:", error)
      toast({
        title: "Error",
        description: "Failed to renew contract. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleViewDocuments = () => {
    router.push(`/dashboard/contracts/${params.contractId}/documents`)
  }

  const handleSuspendServices = async () => {
    if (!confirm("Are you sure you want to suspend this service contract? This action can be reversed later.")) {
      return
    }

    try {
      const response = await fetch(`/api/contracts/service/${params.contractId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contract_status: "suspended" }),
      })

      if (!response.ok) {
        throw new Error("Failed to suspend contract")
      }

      toast({
        title: "Success",
        description: "Contract has been suspended successfully.",
      })

      // Refresh contract data
      const result = await response.json()
      setContract(result.data)
    } catch (error) {
      console.error("[v0] Error suspending contract:", error)
      toast({
        title: "Error",
        description: "Failed to suspend contract. Please try again.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading contract...</p>
      </div>
    )
  }

  if (!contract) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Contract not found</p>
        <Link href="/dashboard/contracts">
          <Button variant="outline">Back to Contracts</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{contract.contract_type}</h1>
          <p className="text-slate-600 mt-1">Service Contract</p>
        </div>
      </div>

      {/* Contract Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Contract Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between">
              <span className="text-slate-600">Status</span>
              <span className="font-semibold text-slate-900">{contract.contract_status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Start Date</span>
              <span className="font-semibold text-slate-900">
                {new Date(contract.contract_start_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">End Date</span>
              <span className="font-semibold text-slate-900">
                {new Date(contract.contract_end_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Duration</span>
              <span className="font-semibold text-slate-900">{contract.contract_duration_months} months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Billing Status</span>
              <span className="font-semibold text-slate-900">{contract.billing_status}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full bg-blue-600 hover:bg-blue-700" onClick={handleRenewContract}>
              Renew Contract
            </Button>
            <Button variant="outline" className="w-full bg-transparent" onClick={handleViewDocuments}>
              View Documents
            </Button>
            <Button variant="destructive" className="w-full" onClick={handleSuspendServices}>
              Suspend Services
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Timeline */}
      <ContractRenewalTimeline
        events={[
          { date: contract.contract_start_date, title: "Contract Start", status: "completed" },
          { date: contract.contract_end_date, title: "Contract End", status: "upcoming" },
        ]}
      />
    </div>
  )
}
