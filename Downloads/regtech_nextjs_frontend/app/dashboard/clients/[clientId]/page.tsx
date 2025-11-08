"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Plus, Building2, Users } from "lucide-react"
import { apiClient } from "@/lib/api-client"

export default function ClientDetailPage() {
  const params = useParams()
  const clientId = params.clientId as string
  const [client, setClient] = useState<any>(null)
  const [facilities, setFacilities] = useState<any[]>([])
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const clientRes = await apiClient(`/api/clients/${clientId}`)
        const clientData = clientRes.ok ? await clientRes.json() : null

        const facilitiesRes = await apiClient(`/api/facilities?client_id=${clientId}`)
        const facilitiesData = facilitiesRes.ok ? await facilitiesRes.json() : []

        const usersRes = await apiClient(`/api/users?client_id=${clientId}`)
        const usersData = usersRes.ok ? await usersRes.json() : []

        console.log(
          "[v0] Fetched data - Client:",
          !!clientData,
          "Facilities:",
          facilitiesData.length,
          "Users:",
          usersData.length,
        )

        setClient(clientData)
        setFacilities(Array.isArray(facilitiesData) ? facilitiesData : [])
        setUsers(Array.isArray(usersData) ? usersData : [])
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        setFacilities([])
        setUsers([])
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [clientId])

  if (loading) {
    return <div className="text-center py-12">Loading client details...</div>
  }

  if (!client) {
    return <div className="text-center py-12">Client not found</div>
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/clients">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Clients
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{client.organization_name}</h1>
          <p className="text-slate-600 mt-2">{client.organization_type || "Organization"}</p>
        </div>
        <Link href={`/dashboard/clients/${clientId}/edit`}>
          <Button>Edit Client</Button>
        </Link>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Information Card */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Organization Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-slate-600">Organization Name</p>
                <p className="font-medium text-slate-900">{client.organization_name}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">Organization Type</p>
                <p className="font-medium text-slate-900">{client.organization_type || "—"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">FEI Number</p>
                <p className="font-mono font-medium text-slate-900">{client.fei_number || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-slate-600">DUNS Number</p>
                <p className="font-mono font-medium text-slate-900">{client.duns_number || "N/A"}</p>
              </div>
            </div>

            {client.address && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-2">Address</p>
                <p className="text-slate-900">{client.address}</p>
              </div>
            )}

            {client.contact_email && (
              <div className="border-t border-slate-200 pt-4">
                <p className="text-sm text-slate-600 mb-2">Contact Information</p>
                <div className="space-y-1">
                  <p className="text-slate-900">{client.contact_email}</p>
                  {client.contact_phone && <p className="text-slate-900">{client.contact_phone}</p>}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-slate-600">Client Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium mt-1 ${
                  client.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                }`}
              >
                {client.status || "active"}
              </span>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-sm text-slate-600 mb-2">Statistics</p>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Facilities</span>
                  <span className="font-semibold text-slate-900">{facilities.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-700">Users</span>
                  <span className="font-semibold text-slate-900">{users.length}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Facilities Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Facilities
            </CardTitle>
            <CardDescription>{facilities.length} registered facilities</CardDescription>
          </div>
          <Link href={`/dashboard/facilities/new?client_id=${clientId}`}>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Facility
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {facilities.length === 0 ? (
            <p className="text-slate-600 text-sm">No facilities registered for this client</p>
          ) : (
            <div className="space-y-3">
              {facilities.map((facility) => (
                <div
                  key={facility.id}
                  className="flex items-center justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50"
                >
                  <div>
                    <p className="font-medium text-slate-900">{facility.facility_name}</p>
                    <p className="text-sm text-slate-600">
                      {facility.city}, {facility.country}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">FEI: {facility.fei_number || "N/A"}</p>
                  </div>
                  <Link href={`/dashboard/facilities/${facility.id}`}>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Users Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Users
            </CardTitle>
            <CardDescription>{users.length} users with access</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <p className="text-slate-600 text-sm">No users assigned to this client</p>
          ) : (
            <div className="space-y-3">
              {users.map((user) => (
                <div key={user.id} className="flex items-center justify-between p-4 border border-slate-200 rounded-lg">
                  <div>
                    <p className="font-medium text-slate-900">
                      {user.first_name} {user.last_name}
                    </p>
                    <p className="text-sm text-slate-600">{user.email}</p>
                    <p className="text-xs text-slate-500 mt-1">Role: {user.role_name || "User"}</p>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                      user.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                    }`}
                  >
                    {user.status || "active"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
