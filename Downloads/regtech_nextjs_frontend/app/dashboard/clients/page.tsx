"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Edit, Trash2 } from "lucide-react"
import { apiClient } from "@/lib/api-client"
import { EmptyState } from "@/components/empty-state"
import { useToast } from "@/hooks/use-toast"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await apiClient("/api/clients")
        const data = await response.json()
        setClients(data)
      } catch (error) {
        console.error("[v0] Error fetching clients:", error)
        toast({
          title: "Error loading clients",
          description: "Failed to fetch clients. Please try again.",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchClients()
  }, [toast])

  const handleDelete = async (clientId: string) => {
    if (!confirm("Are you sure you want to delete this client?")) return

    try {
      const response = await apiClient(`/api/clients/${clientId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setClients(clients.filter((c) => c.id !== clientId))
        toast({
          title: "Client deleted",
          description: "The client has been successfully deleted.",
        })
      }
    } catch (error) {
      console.error("[v0] Error deleting client:", error)
      toast({
        title: "Error deleting client",
        description: "Failed to delete client. Please try again.",
      })
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Clients</h1>
          <p className="text-slate-600 mt-1">Manage all registered organizations</p>
        </div>
        <Link href="/dashboard/clients/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Add Client
          </Button>
        </Link>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>Organizations</CardTitle>
          <CardDescription>List of all registered clients</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">
              <p className="text-slate-600">Loading clients...</p>
            </div>
          ) : clients.length === 0 ? (
            <EmptyState
              icon={Plus}
              title="No clients yet"
              description="Create your first client to get started with managing compliance documentation."
              action={{
                label: "Add Client",
                href: "/dashboard/clients/new",
              }}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Organization Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">FEI Number</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {clients.map((client) => (
                    <tr key={client.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm text-slate-900">
                        <Link href={`/dashboard/clients/${client.id}`} className="font-medium hover:text-blue-600">
                          {client.organization_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.organization_type || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{client.fei_number || "—"}</td>
                      <td className="px-4 py-3 text-sm">
                        <span
                          className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                            client.status === "active" ? "bg-green-100 text-green-800" : "bg-slate-100 text-slate-800"
                          }`}
                        >
                          {client.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <Link href={`/dashboard/clients/${client.id}/edit`}>
                          <Button size="sm" variant="outline">
                            <Edit className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDelete(client.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
