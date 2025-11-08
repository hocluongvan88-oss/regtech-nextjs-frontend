"use client"

import React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface SubmissionForm {
  submission_type: string
  facility_id: string
  product_ids: string[]
  comments: string
}

export default function NewSubmissionPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [facilitiesLoading, setFacilitiesLoading] = useState(true)
  const [productsLoading, setProductsLoading] = useState(true)
  const [form, setForm] = useState<SubmissionForm>({
    submission_type: "registration",
    facility_id: "",
    product_ids: [],
    comments: "",
  })

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilitiesRes, productsRes] = await Promise.all([fetch("/api/facilities"), fetch("/api/products")])

        const facilitiesData = await facilitiesRes.json()
        const productsData = await productsRes.json()

        setFacilities(facilitiesData || [])
        setProducts(productsData || [])
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setFacilitiesLoading(false)
        setProductsLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!form.facility_id) {
      alert("Please select a facility")
      return
    }

    if (form.product_ids.length === 0) {
      alert("Please select at least one product")
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submission_type: form.submission_type,
          facility_id: form.facility_id,
          product_ids: form.product_ids,
          comments: form.comments,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create submission")
      }

      const data = await response.json()
      router.push(`/dashboard/submissions/${data.id}`)
    } catch (error) {
      console.error("[v0] Error creating submission:", error)
      alert("Error creating submission")
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      product_ids: prev.product_ids.includes(productId)
        ? prev.product_ids.filter((id) => id !== productId)
        : [...prev.product_ids, productId],
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">New Submission</h1>
          <p className="text-slate-600 mt-1">Create a new FDA registration submission</p>
        </div>
        <Link href="/dashboard/submissions">
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Submission Type */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Submission Type</label>
              <select
                value={form.submission_type}
                onChange={(e) => setForm({ ...form, submission_type: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="registration">Registration</option>
                <option value="renewal">Renewal</option>
                <option value="amendment">Amendment</option>
                <option value="coe">Certificate of Export</option>
              </select>
            </div>

            {/* Facility Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Facility</label>
              {facilitiesLoading ? (
                <div className="text-sm text-slate-600">Loading facilities...</div>
              ) : facilities.length === 0 ? (
                <div className="text-sm text-slate-600">No facilities available</div>
              ) : (
                <select
                  value={form.facility_id}
                  onChange={(e) => setForm({ ...form, facility_id: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-md"
                >
                  <option value="">Select a facility...</option>
                  {facilities.map((facility) => (
                    <option key={facility.id} value={facility.id}>
                      {facility.facility_name} ({facility.fei_number || "No FEI"})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Products</label>
              {productsLoading ? (
                <div className="text-sm text-slate-600">Loading products...</div>
              ) : products.length === 0 ? (
                <div className="text-sm text-slate-600">No products available</div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto border border-slate-300 rounded-md p-3">
                  {products.map((product) => (
                    <label key={product.id} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={form.product_ids.includes(product.id)}
                        onChange={() => toggleProduct(product.id)}
                        className="rounded"
                      />
                      <span className="text-sm text-slate-900">{product.product_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Comments</label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                placeholder="Add any additional comments or special instructions..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href="/dashboard/submissions">
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Submission"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
