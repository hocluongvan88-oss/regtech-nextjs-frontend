"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

interface ContractForm {
  facility_id: string
  contract_type: string
  contract_start_date: string
  contract_end_date: string
  contract_duration_months: number
  billing_status: string
  agent_user_id: string
  contract_notes: string
}

export default function NewContractPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<any[]>([])
  const [agents, setAgents] = useState<any[]>([])
  const [facilitiesLoading, setFacilitiesLoading] = useState(true)
  const [agentsLoading, setAgentsLoading] = useState(true)
  const [form, setForm] = useState<ContractForm>({
    facility_id: "",
    contract_type: "US_AGENT_REP",
    contract_start_date: new Date().toISOString().split("T")[0],
    contract_end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    contract_duration_months: 12,
    billing_status: "paid",
    agent_user_id: "",
    contract_notes: "",
  })

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        const response = await fetch("/api/facilities")
        const data = await response.json()
        setFacilities(data || [])
      } catch (error) {
        console.error("[v0] Error fetching facilities:", error)
      } finally {
        setFacilitiesLoading(false)
      }
    }

    const fetchAgents = async () => {
      try {
        if (!user?.clientId) return
        const response = await fetch(`/api/users?client_id=${user.clientId}`)
        if (response.ok) {
          const data = await response.json()
          setAgents(data || [])
        }
      } catch (error) {
        console.error("[v0] Error fetching agents:", error)
      } finally {
        setAgentsLoading(false)
      }
    }

    fetchFacilities()
    fetchAgents()
  }, [user?.clientId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!user?.clientId) {
      alert("User client ID not found. Please log in again.")
      return
    }

    if (!form.contract_start_date || !form.contract_end_date) {
      alert("Contract start and end dates are required")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/contracts/service", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          facility_id: form.facility_id || null,
          agent_user_id: form.agent_user_id || null,
          contract_notes: form.contract_notes || null,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create contract")
      }

      const result = await response.json()
      router.push(`/dashboard/contracts/${result.data.id}`)
    } catch (error) {
      console.error("[v0] Error creating contract:", error)
      alert(error instanceof Error ? error.message : "Error creating contract")
    } finally {
      setLoading(false)
    }
  }

  const handleDurationChange = (months: number) => {
    const startDate = new Date(form.contract_start_date)
    const endDate = new Date(startDate)
    endDate.setMonth(endDate.getMonth() + months)

    setForm({
      ...form,
      contract_duration_months: months,
      contract_end_date: endDate.toISOString().split("T")[0],
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Service Contract</h1>
          <p className="text-slate-600 mt-1">Create a new multi-year service contract</p>
        </div>
        <Link href="/dashboard/contracts">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Contract Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Contract Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Contract Type *</label>
              <select
                value={form.contract_type}
                onChange={(e) => setForm({ ...form, contract_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              >
                <option value="US_AGENT_REP">U.S. Agent Representation</option>
                <option value="QMS_SUPPORT">QMS Support</option>
                <option value="COMPLIANCE_SERVICES">Compliance Services</option>
              </select>
            </div>

            {/* Facility */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Facility (Optional)</label>
              {facilitiesLoading ? (
                <div className="text-sm text-slate-600">Loading facilities...</div>
              ) : (
                <select
                  value={form.facility_id}
                  onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select a facility...</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.facility_name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Contract Duration *</label>
              <select
                value={form.contract_duration_months}
                onChange={(e) => handleDurationChange(Number(e.target.value))}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              >
                <option value={12}>1 Year (12 months)</option>
                <option value={24}>2 Years (24 months)</option>
                <option value={36}>3 Years (36 months)</option>
                <option value={48}>4 Years (48 months)</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Start Date *</label>
              <input
                type="date"
                value={form.contract_start_date}
                onChange={(e) => {
                  const startDate = new Date(e.target.value)
                  const endDate = new Date(startDate)
                  endDate.setMonth(endDate.getMonth() + form.contract_duration_months)

                  setForm({
                    ...form,
                    contract_start_date: e.target.value,
                    contract_end_date: endDate.toISOString().split("T")[0],
                  })
                }}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">End Date *</label>
              <input
                type="date"
                value={form.contract_end_date}
                onChange={(e) => setForm({ ...form, contract_end_date: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>

            {/* Billing Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Billing Status</label>
              <select
                value={form.billing_status}
                onChange={(e) => setForm({ ...form, billing_status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="paid">Paid</option>
                <option value="due">Due</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>

            {/* Assigned Agent */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Assigned Agent (Optional)</label>
              {agentsLoading ? (
                <div className="text-sm text-slate-600">Loading agents...</div>
              ) : (
                <select
                  value={form.agent_user_id}
                  onChange={(e) => setForm({ ...form, agent_user_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select an agent...</option>
                  {agents.map((agent) => (
                    <option key={agent.id} value={agent.id}>
                      {agent.full_name} ({agent.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Contract Notes */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Contract Notes</label>
              <textarea
                value={form.contract_notes}
                onChange={(e) => setForm({ ...form, contract_notes: e.target.value })}
                placeholder="Special terms, conditions, or notes"
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href="/dashboard/contracts">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Contract"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
