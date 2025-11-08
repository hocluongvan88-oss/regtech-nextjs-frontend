"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, Clock, CheckCircle, Plus, Filter } from "lucide-react"
import Link from "next/link"

export default function ServiceRequestsPage() {
  const [requests, setRequests] = useState<any[]>([])
  const [escalations, setEscalations] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<string | null>(null)
  const [sortBy, setSortBy] = useState<"priority" | "created" | "sla">("priority")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [reqData, escData] = await Promise.all([
          fetch("/api/service-requests")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
          fetch("/api/service-requests/escalations")
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ])
        setRequests(reqData)
        setEscalations(escData)
      } catch (error) {
        console.error("Error fetching service requests:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 5000)
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "critical":
        return "bg-red-100 text-red-800 border-red-300"
      case "high":
        return "bg-orange-100 text-orange-800 border-orange-300"
      case "medium":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      default:
        return "bg-green-100 text-green-800 border-green-300"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "critical":
      case "high":
        return <AlertCircle className="w-4 h-4" />
      case "medium":
        return <Clock className="w-4 h-4" />
      default:
        return <CheckCircle className="w-4 h-4" />
    }
  }

  const filteredRequests = filterStatus ? requests?.filter((r: any) => r.priority === filterStatus) : requests

  const sortedRequests = filteredRequests?.sort((a: any, b: any) => {
    switch (sortBy) {
      case "priority":
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 }
        return (
          priorityOrder[a.priority as keyof typeof priorityOrder] -
          priorityOrder[b.priority as keyof typeof priorityOrder]
        )
      case "created":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      case "sla":
        return (a.sla_hours || 0) - (b.sla_hours || 0)
      default:
        return 0
    }
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Service Requests</h1>
          <p className="text-slate-600 mt-1">Track FDA 483s, warning letters, and internal service requests</p>
        </div>
        <Link href="/dashboard/service-requests/new">
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Plus className="w-4 h-4 mr-2" />
            New Request
          </Button>
        </Link>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{requests?.length || 0}</div>
            <p className="text-xs text-slate-500 mt-1">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-red-600">Critical</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {requests?.filter((r: any) => r.priority === "critical").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Require immediate action</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-orange-600">Escalated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {escalations?.filter((e: any) => e.escalation_level === 2 || e.escalation_level === 3).length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">Need management review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-green-600">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {requests?.filter((r: any) => r.status === "resolved").length || 0}
            </div>
            <p className="text-xs text-slate-500 mt-1">This month</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Sort */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            <CardTitle className="text-sm">Filters & Sort</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={filterStatus === null ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus(null)}
              className={filterStatus === null ? "bg-blue-600" : "bg-transparent"}
            >
              All
            </Button>
            {["critical", "high", "medium", "low"].map((priority) => (
              <Button
                key={priority}
                variant={filterStatus === priority ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus(priority)}
                className={filterStatus === priority ? "bg-blue-600" : "bg-transparent"}
              >
                {priority.charAt(0).toUpperCase() + priority.slice(1)}
              </Button>
            ))}
            <div className="ml-auto">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-1 border rounded-md text-sm"
              >
                <option value="priority">Sort: Priority</option>
                <option value="created">Sort: Newest</option>
                <option value="sla">Sort: SLA</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Service Requests List */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="text-center py-8 text-slate-500">Loading service requests...</div>
        ) : sortedRequests?.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center text-slate-500">
              No service requests found. Create one to get started.
            </CardContent>
          </Card>
        ) : (
          sortedRequests?.map((request: any) => (
            <Link key={request.id} href={`/dashboard/service-requests/${request.id}`}>
              <Card className="hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-slate-900">{request.title}</h3>
                        <Badge className={getStatusColor(request.priority)}>
                          {getStatusIcon(request.priority)}
                          <span className="ml-1">{request.priority}</span>
                        </Badge>
                      </div>
                      <p className="text-sm text-slate-600 mb-2">{request.description}</p>
                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>ID: {request.id.substring(0, 8)}</span>
                        <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                        <span>Type: {request.request_type}</span>
                        {request.sla_hours && (
                          <span className="text-blue-600 font-medium">SLA: {request.sla_hours}h</span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{request.status}</Badge>
                      {request.assigned_to && (
                        <p className="text-xs text-slate-600 mt-2">
                          Assigned: {request.assigned_to.substring(0, 20)}...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))
        )}
      </div>
    </div>
  )
}
