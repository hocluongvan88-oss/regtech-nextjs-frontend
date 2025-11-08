"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Loader2, AlertCircle } from "lucide-react"
import { apiClient } from "@/lib/api-client"

interface MappingEntry {
  productCode: string
  productName: string
  regulationId: string
  regulationTitle: string
  applicabilityLevel: "critical" | "high" | "medium" | "low"
  requiresAction: boolean
}

export function MappingMatrix() {
  const [mappings, setMappings] = useState<MappingEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null)

  useEffect(() => {
    const fetchMappings = async () => {
      try {
        setError(null)
        console.log("[v0] Fetching mappings from /api/rcm/mapping")
        const response = await apiClient("/api/rcm/mapping")

        console.log("[v0] API response status:", response.status)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(errorData.error || `HTTP ${response.status}: ${response.statusText}`)
        }

        const result = await response.json()
        console.log("[v0] API response data:", result)

        const data = Array.isArray(result) ? result : result?.data || []

        if (Array.isArray(data)) {
          console.log("[v0] Successfully parsed mappings. Count:", data.length)
          setMappings(data)
        } else {
          console.warn("[v0] API returned non-array data after transformation:", data)
          setMappings([])
        }
      } catch (error: any) {
        console.error("[v0] Error fetching mappings:", error.message)
        setError(error.message || "Failed to load mappings")
        setMappings([])
      } finally {
        setLoading(false)
      }
    }

    fetchMappings()
  }, [])

  const getApplicabilityColor = (level: string) => {
    switch (level) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-blue-100 text-blue-800 border-blue-300"
    }
  }

  const products = [...new Set(mappings.map((m) => m.productCode))]
  const filteredMappings = selectedProduct ? mappings.filter((m) => m.productCode === selectedProduct) : mappings

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="ml-2 text-slate-600">Loading mappings...</span>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardContent className="flex items-center justify-center py-12">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div className="ml-3">
            <p className="font-semibold text-red-900">Failed to load mappings</p>
            <p className="text-sm text-red-700 mt-1">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Product Filter */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Filter by Product</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedProduct === null ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedProduct(null)}
            >
              All Products ({products.length})
            </Button>
            {products.slice(0, 5).map((product) => (
              <Button
                key={product}
                variant={selectedProduct === product ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedProduct(product)}
              >
                {product}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Mapping Matrix */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Product-Regulation Mapping</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Product</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Regulation</th>
                  <th className="text-left py-3 px-4 font-semibold text-slate-900">Applicability</th>
                  <th className="text-center py-3 px-4 font-semibold text-slate-900">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredMappings.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-slate-600">
                      No mappings found
                    </td>
                  </tr>
                ) : (
                  filteredMappings.map((mapping, idx) => (
                    <tr key={idx} className="border-b hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-slate-900">{mapping.productName}</p>
                          <p className="text-xs text-slate-600">{mapping.productCode}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <p className="text-slate-900">{mapping.regulationTitle}</p>
                      </td>
                      <td className="py-3 px-4">
                        <Badge className={getApplicabilityColor(mapping.applicabilityLevel)}>
                          {mapping.applicabilityLevel}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {mapping.requiresAction && <Badge className="bg-red-100 text-red-800">Action Required</Badge>}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {filteredMappings.length > 0 && (
            <div className="mt-4 pt-4 border-t text-sm text-slate-600">
              Showing {filteredMappings.length} mapping{filteredMappings.length !== 1 ? "s" : ""}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
