"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditProductPage() {
  const router = useRouter()
  const params = useParams()
  const productId = params.productId as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [product, setProduct] = useState<any>(null)
  const [form, setForm] = useState({
    product_name: "",
    product_type: "",
    product_code: "",
    product_classification: "",
    intended_use: "",
    regulatory_pathway: "",
  })

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const response = await fetch(`/api/products/${productId}`)
        const data = await response.json()
        setProduct(data)
        setForm({
          product_name: data.product_name || "",
          product_type: data.product_type || "",
          product_code: data.product_code || "",
          product_classification: data.product_classification || "",
          intended_use: data.intended_use || "",
          regulatory_pathway: data.regulatory_pathway || "",
        })
      } catch (error) {
        console.error("[v0] Error fetching product:", error)
      } finally {
        setFetching(false)
      }
    }

    fetchProduct()
  }, [productId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      if (!response.ok) {
        throw new Error("Failed to update product")
      }

      router.push(`/dashboard/products/${productId}`)
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      alert("Error updating product")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-center py-12">Loading product...</div>
  }

  if (!product) {
    return <div className="text-center py-12">Product not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Product</h1>
          <p className="text-slate-600 mt-1">{product.product_name}</p>
        </div>
        <Link href={`/dashboard/products/${productId}`}>
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
              <label className="block text-sm font-medium text-slate-900 mb-2">Product Name</label>
              <input
                type="text"
                value={form.product_name}
                onChange={(e) => setForm({ ...form, product_name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
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
              <label className="block text-sm font-medium text-slate-900 mb-2">Product Code</label>
              <input
                type="text"
                value={form.product_code}
                onChange={(e) => setForm({ ...form, product_code: e.target.value })}
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
                <option value="">Select...</option>
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
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href={`/dashboard/products/${productId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
