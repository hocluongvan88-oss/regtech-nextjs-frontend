"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams()
  const clientId = params.clientId as string
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    organization_name: "",
    organization_type: "",
    duns_number: "",
    fei_number: "",
  })

  useEffect(() => {
    const fetchClient = async () => {
      try {
        const response = await apiClient(`/api/clients/${clientId}`)
        if (!response.ok) throw new Error("Failed to fetch client")
        const data = await response.json()
        setFormData({
          organization_name: data.organization_name || "",
          organization_type: data.organization_type || "",
          duns_number: data.duns_number || "",
          fei_number: data.fei_number || "",
        })
      } catch (err) {
        console.error("[v0] Error fetching client:", err)
        setError("Failed to load client data")
      } finally {
        setLoading(false)
      }
    }

    fetchClient()
  }, [clientId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const response = await apiClient(`/api/clients/${clientId}`, {
        method: "PUT",
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        setError(data.error || "Failed to update client")
        return
      }

      router.push("/dashboard/clients")
    } catch (err) {
      console.error("[v0] Error updating client:", err)
      setError("An error occurred while updating the client")
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading client data...</div>
  }

  return (
    <div className="space-y-6">
      <Link href="/dashboard/clients">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </Link>

      <div>
        <h1 className="text-3xl font-bold text-slate-900">Edit Client</h1>
        <p className="text-slate-600 mt-2">Update organization information</p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle>Client Information</CardTitle>
          <CardDescription>Modify the organization details below</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && <div className="p-3 bg-red-50 border border-red-200 rounded text-red-700 text-sm">{error}</div>}

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Organization Name *</label>
              <input
                type="text"
                name="organization_name"
                value={formData.organization_name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">Organization Type</label>
              <select
                name="organization_type"
                value={formData.organization_type}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select type...</option>
                <option value="Manufacturer">Manufacturer</option>
                <option value="Distributor">Distributor</option>
                <option value="Importer">Importer</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">DUNS Number</label>
              <input
                type="text"
                name="duns_number"
                value={formData.duns_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">FEI Number</label>
              <input
                type="text"
                name="fei_number"
                value={formData.fei_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={submitting} className="bg-blue-600 hover:bg-blue-700">
                {submitting ? "Updating..." : "Update Client"}
              </Button>
              <Link href="/dashboard/clients">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
