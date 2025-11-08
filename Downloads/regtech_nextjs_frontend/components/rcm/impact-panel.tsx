"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Package, Building2 } from "lucide-react"

interface ImpactAnalysisProps {
  regulationId: string
  onGenerateServiceRequest: (regulationId: string) => void
}

export function ImpactPanel({ regulationId, onGenerateServiceRequest }: ImpactAnalysisProps) {
  const [impact, setImpact] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchImpact = async () => {
      try {
        const response = await fetch(`/api/rcm/impacts/${regulationId}`)
        const data = await response.json()
        setImpact(data)
      } catch (error) {
        console.error("[v0] Error fetching impact analysis:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchImpact()
  }, [regulationId])

  if (loading) {
    return (
      <Card>
        <CardContent className="text-center py-12 text-slate-600">Loading impact analysis...</CardContent>
      </Card>
    )
  }

  if (!impact || (impact.affectedProducts.length === 0 && impact.affectedFacilities.length === 0)) {
    return (
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-green-900">
            <AlertCircle className="w-5 h-5" />
            <p>No impact on your current products or facilities</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Affected Products */}
      {impact.affectedProducts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Package className="w-4 h-4" />
              Affected Products ({impact.affectedProducts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {impact.affectedProducts.map((product: any) => (
                <div key={product.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{product.name}</p>
                    <p className="text-sm text-slate-600">{product.code}</p>
                  </div>
                  <Badge
                    className={
                      product.impactLevel === "critical"
                        ? "bg-red-100 text-red-800"
                        : product.impactLevel === "high"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-yellow-100 text-yellow-800"
                    }
                  >
                    {product.impactLevel}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Affected Facilities */}
      {impact.affectedFacilities.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Building2 className="w-4 h-4" />
              Affected Facilities ({impact.affectedFacilities.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {impact.affectedFacilities.map((facility: any) => (
                <div key={facility.id} className="p-3 border rounded-lg flex items-center justify-between">
                  <div>
                    <p className="font-medium text-slate-900">{facility.name}</p>
                    <p className="text-sm text-slate-600">{facility.type}</p>
                  </div>
                  <Badge variant="outline">{facility.productCount} products</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action */}
      <Button onClick={() => onGenerateServiceRequest(regulationId)} className="w-full bg-blue-600 hover:bg-blue-700">
        Generate Service Request
      </Button>
    </div>
  )
}
