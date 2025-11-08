"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Pencil, Trash2 } from "lucide-react"

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const productId = params.productId as string
  const [product, setProduct] = useState<any>(null)
  const [facility, setFacility] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const productRes = await fetch(`/api/products/${productId}`)
        if (!productRes.ok) {
          throw new Error("Product not found")
        }

        const productData = await productRes.json()
        setProduct(productData)

        // Fetch facility if available
        if (productData.facility_id) {
          try {
            const facilityRes = await fetch(`/api/facilities/${productData.facility_id}`)
            if (facilityRes.ok) {
              const facilityData = await facilityRes.json()
              setFacility(facilityData)
            }
          } catch (err) {
            console.error("[v0] Error fetching facility:", err)
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching product:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [productId])

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this product?")) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete product")
      }

      router.push("/dashboard/products")
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      alert("Failed to delete product")
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading product details...</div>
  }

  if (!product) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-600">Product not found</p>
        <Link href="/dashboard/products">
          <Button className="mt-4">Back to Products</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/products">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Products
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{product.product_name}</h1>
          <p className="text-slate-600 mt-2">{product.product_type}</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/dashboard/products/${productId}/edit`}>
            <Button variant="outline">
              <Pencil className="w-4 h-4 mr-2" />
              Edit
            </Button>
          </Link>
          <Button variant="destructive" onClick={handleDelete} disabled={deleting}>
            <Trash2 className="w-4 h-4 mr-2" />
            {deleting ? "Deleting..." : "Delete"}
          </Button>
        </div>
      </div>

      {/* Details Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Product Information */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Product Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Product Code</p>
                <p className="font-mono font-medium text-slate-900">{product.product_code || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Classification</p>
                <p className="font-medium text-slate-900">{product.product_classification || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Regulatory Pathway</p>
                <p className="font-medium text-slate-900">{product.regulatory_pathway || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">NDC Number</p>
                <p className="font-mono font-medium text-slate-900">{product.ndc_number || "N/A"}</p>
              </div>
            </div>

            {product.intended_use && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-2">Intended Use</p>
                <p className="text-slate-900">{product.intended_use}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status & Facility Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status & Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  product.status === "active"
                    ? "bg-green-100 text-green-800"
                    : product.status === "inactive"
                      ? "bg-slate-100 text-slate-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {product.status || "draft"}
              </span>
            </div>

            {facility && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-2">Manufactured At</p>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900">{facility.facility_name}</p>
                  <p className="text-sm text-slate-600">
                    {facility.city}, {facility.country}
                  </p>
                  <Link href={`/dashboard/facilities/${facility.id}`}>
                    <Button size="sm" variant="outline" className="mt-2 w-full bg-transparent">
                      View Facility
                    </Button>
                  </Link>
                </div>
              </div>
            )}

            {!facility && product.facility_id && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600">Facility</p>
                <p className="text-slate-900">Loading...</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Regulatory Information */}
      <Card>
        <CardHeader>
          <CardTitle>Regulatory Information</CardTitle>
          <CardDescription>FDA submissions and compliance status</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-slate-600">Created</p>
              <p className="font-medium text-slate-900">
                {product.created_at ? new Date(product.created_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Last Updated</p>
              <p className="font-medium text-slate-900">
                {product.updated_at ? new Date(product.updated_at).toLocaleDateString() : "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Device Class</p>
              <p className="font-medium text-slate-900">{product.device_class || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Submission Type</p>
              <p className="font-medium text-slate-900">{product.submission_type || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
