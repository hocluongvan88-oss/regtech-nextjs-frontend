"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus } from "lucide-react"

export default function FacilityDetailPage() {
  const params = useParams()
  const facilityId = params.facilityId as string
  const [facility, setFacility] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilityRes, productsRes] = await Promise.all([
          fetch(`/api/facilities/${facilityId}`),
          fetch(`/api/products?facility_id=${facilityId}`),
        ])

        const facilityData = await facilityRes.json()
        const productsData = await productsRes.json()

        setFacility(facilityData)
        setProducts(productsData)
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [facilityId])

  if (loading) {
    return <div className="text-center py-12">Loading facility details...</div>
  }

  if (!facility) {
    return <div className="text-center py-12">Facility not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/facilities">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Facilities
        </Button>
      </Link>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{facility.facility_name}</h1>
        <p className="text-slate-600 mt-2">{facility.facility_type}</p>
      </div>

      {/* Details Card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Facility Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Address</p>
                <p className="font-medium text-slate-900">{facility.street_address}</p>
                <p className="text-slate-700">
                  {facility.city}, {facility.state_province} {facility.postal_code}
                </p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Country</p>
                <p className="font-medium text-slate-900">{facility.country}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">FEI Number</p>
                <p className="font-mono font-medium text-slate-900">{facility.fei_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">DUNS Number</p>
                <p className="font-mono font-medium text-slate-900">{facility.duns_number || "N/A"}</p>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600 mb-2">Primary Contact</p>
              <div className="space-y-1">
                <p className="font-medium text-slate-900">{facility.primary_contact_name}</p>
                <p className="text-slate-700">{facility.primary_contact_email}</p>
                <p className="text-slate-700">{facility.primary_contact_phone}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Facility Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  facility.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                }`}
              >
                {facility.status}
              </span>
            </div>

            <div>
              <p className="text-sm text-slate-600">Registration Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  facility.registration_status === "approved"
                    ? "bg-green-100 text-green-800"
                    : facility.registration_status === "submitted"
                      ? "bg-blue-100 text-blue-800"
                      : "bg-yellow-100 text-yellow-800"
                }`}
              >
                {facility.registration_status}
              </span>
            </div>

            <Link href={`/dashboard/facilities/${facilityId}/edit`} className="block">
              <Button className="w-full mt-4">Edit Facility</Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Products Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Associated Products</CardTitle>
            <CardDescription>{products.length} products</CardDescription>
          </div>
          <Link href={`/dashboard/products/new?facility_id=${facilityId}`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Product
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-slate-600 text-sm">No products assigned to this facility</p>
          ) : (
            <div className="space-y-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{product.product_name}</p>
                    <p className="text-sm text-slate-600">{product.product_type}</p>
                  </div>
                  <Link href={`/dashboard/products/${product.id}`}>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
