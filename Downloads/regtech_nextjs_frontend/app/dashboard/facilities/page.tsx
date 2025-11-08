"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Trash2, MapPin, Building2 } from "lucide-react"
import { useAuth } from "@/lib/hooks/use-auth"
import { apiClient } from "@/lib/api-client"

export default function FacilitiesPage() {
  const { hasPermission } = useAuth()
  const [facilities, setFacilities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFacilities()
  }, [])

  const fetchFacilities = async () => {
    try {
      const response = await apiClient("/api/facilities")
      const data = await response.json()
      setFacilities(data)
    } catch (error) {
      console.error("[v0] Error fetching facilities:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (facilityId: string) => {
    if (!confirm("Are you sure you want to delete this facility?")) return

    try {
      await apiClient(`/api/facilities/${facilityId}`, {
        method: "DELETE",
      })
      setFacilities(facilities.filter((f) => f.id !== facilityId))
    } catch (error) {
      console.error("[v0] Error deleting facility:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Facilities</h1>
          <p className="text-slate-600 mt-1">Manage your registered facilities</p>
        </div>
        <Link href="/dashboard/facilities/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Facility
          </Button>
        </Link>
      </div>

      {/* Grid View */}
      {loading ? (
        <div className="text-center py-12">
          <p className="text-slate-600">Loading facilities...</p>
        </div>
      ) : facilities.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No facilities found</h3>
            <p className="text-slate-600 mb-6 max-w-md mx-auto">
              Register your manufacturing or distribution facilities to comply with FDA regulations. Each facility needs
              an FEI number.
            </p>
            <Link href="/dashboard/facilities/new">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Facility
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {facilities.map((facility) => (
            <Card key={facility.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{facility.facility_name}</CardTitle>
                    <CardDescription className="text-xs">{facility.facility_type || "Facility"}</CardDescription>
                  </div>
                  <span
                    className={`text-xs px-2 py-1 rounded-full font-medium ${
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
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Address */}
                <div className="flex gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <div>
                    <div>{facility.street_address}</div>
                    <div>
                      {facility.city}, {facility.state_province} {facility.postal_code}
                    </div>
                  </div>
                </div>

                {/* FEI Number */}
                {facility.fei_number && (
                  <div className="text-sm">
                    <span className="text-slate-600">FEI: </span>
                    <span className="font-mono text-slate-900">{facility.fei_number}</span>
                  </div>
                )}

                {/* Contact */}
                {facility.primary_contact_email && (
                  <div className="text-sm text-slate-600">
                    <div className="font-medium text-slate-900">{facility.primary_contact_name}</div>
                    <div>{facility.primary_contact_email}</div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-2 border-t border-slate-200">
                  <Link href={`/dashboard/facilities/${facility.id}`} className="flex-1">
                    <Button size="sm" variant="outline" className="w-full bg-transparent">
                      <Edit className="w-3 h-3 mr-1" />
                      View
                    </Button>
                  </Link>
                  {hasPermission("manage_facilities") && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 bg-transparent"
                      onClick={() => handleDelete(facility.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
