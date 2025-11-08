"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { useAuth } from "@/lib/hooks/use-auth"

interface ProductForm {
  product_name: string
  product_type: string
  product_code: string
  product_classification: string
  intended_use: string
  regulatory_pathway: string
  facility_id: string
}

export default function NewProductPage() {
  const router = useRouter()
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<any[]>([])
  const [facilitiesLoading, setFacilitiesLoading] = useState(true)
  const [form, setForm] = useState<ProductForm>({
    product_name: "",
    product_type: "device",
    product_code: "",
    product_classification: "",
    intended_use: "",
    regulatory_pathway: "510k",
    facility_id: "",
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

    fetchFacilities()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.product_name) {
      alert("Product name is required")
      return
    }

    if (!user?.clientId) {
      alert("User client ID not found. Please log in again.")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          client_id: user.clientId,
        }),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to create product")
      }

      const data = await response.json()
      router.push(`/dashboard/products/${data.id}`)
    } catch (error) {
      console.error("[v0] Error creating product:", error)
      alert(error instanceof Error ? error.message : "Error creating product")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Product</h1>
          <p className="text-slate-600 mt-1">Register a new product</p>
        </div>
        <Link href="/dashboard/products">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Product Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Product Name */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Product Name *</label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                placeholder="Enter product name"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
                required
              />
            </div>

            {/* Product Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Product Type</label>
              <select
                value={form.product_type}
                onChange={(e) => setForm({ ...form, product_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="device">Medical Device</option>
                <option value="drug">Drug</option>
                <option value="food">Food</option>
                <option value="cosmetic">Cosmetic</option>
              </select>
            </div>

            {/* Product Code */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Product Code (Q-Code)</label>
              <input
                type="text"
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value })}
                placeholder="e.g., QBW"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Classification */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Classification</label>
              <input
                type="text"
                value={form.product_classification}
                onChange={(e) => setForm({ ...form, product_classification: e.target.value })}
                placeholder="e.g., Class II"
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Regulatory Pathway */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Regulatory Pathway</label>
              <select
                value={form.regulatory_pathway}
                onChange={(e) => setForm({ ...form, regulatory_pathway: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="510k">510(k)</option>
                <option value="pma">PMA</option>
                <option value="nda">NDA</option>
                <option value="anda">ANDA</option>
              </select>
            </div>

            {/* Intended Use */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Intended Use</label>
              <textarea
                value={form.intended_use}
                onChange={(e) => setForm({ ...form, intended_use: e.target.value })}
                placeholder="Describe the intended use of the product"
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
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

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href="/dashboard/products">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Product"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
