"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowUp, Clock, MessageCircle } from "lucide-react"
import { useParams } from "next/navigation"

export default function ServiceRequestDetailPage() {
  const params = useParams()
  const requestId = params.requestId as string

  const [request, setRequest] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!requestId) return

    const fetchData = async () => {
      try {
        const [reqData, actData] = await Promise.all([
          fetch(`/api/service-requests/${requestId}`)
            .then((r) => (r.ok ? r.json() : null))
            .catch(() => null),
          fetch(`/api/service-requests/${requestId}/activities`)
            .then((r) => (r.ok ? r.json() : []))
            .catch(() => []),
        ])
        setRequest(reqData)
        setActivities(actData)
      } catch (error) {
        console.error("Error fetching request details:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
    const interval = setInterval(fetchData, 10000)
    return () => clearInterval(interval)
  }, [requestId])

  const getStatusColor = (status: string) => {
    switch (status) {
      case "open":
        return "bg-blue-100 text-blue-800"
      case "in-progress":
        return "bg-orange-100 text-orange-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      case "resolved":
        return "bg-green-100 text-green-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  if (isLoading) return <div className="text-center py-8">Loading...</div>
  if (!request) return <div className="text-center py-8 text-slate-500">Request not found</div>

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{request.title}</h1>
          <p className="text-slate-600 mt-1">ID: {request.id}</p>
        </div>
        <Badge className={getStatusColor(request.status)}>{request.status}</Badge>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-4">
          {/* Request Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Request Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-600">Type</p>
                  <p className="font-semibold text-slate-900">{request.request_type}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Priority</p>
                  <Badge
                    className={
                      request.priority === "critical" ? "bg-red-100 text-red-800" : "bg-blue-100 text-blue-800"
                    }
                  >
                    {request.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm text-slate-600">Created</p>
                  <p className="font-semibold text-slate-900">{new Date(request.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-600">SLA Hours</p>
                  <p className="font-semibold text-slate-900">{request.sla_hours}h</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-slate-600">Description</p>
                  <p className="text-slate-900">{request.description}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Activities Timeline */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Activity Timeline
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {activities?.length === 0 ? (
                  <p className="text-sm text-slate-500">No activities recorded</p>
                ) : (
                  activities?.map((activity: any, idx: number) => (
                    <div key={idx} className="flex gap-4">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 bg-blue-600 rounded-full"></div>
                        {idx < activities.length - 1 && <div className="w-0.5 h-12 bg-slate-200 my-1"></div>}
                      </div>
                      <div className="flex-1 pb-4">
                        <p className="font-semibold text-slate-900">{activity.action}</p>
                        <p className="text-sm text-slate-600">{activity.description}</p>
                        <p className="text-xs text-slate-500 mt-1">{new Date(activity.created_at).toLocaleString()}</p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-4">
          {/* SLA Status */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="w-4 h-4" />
                SLA Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">SLA Hours</span>
                  <span className="font-semibold">{request.sla_hours}h</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600">Time Elapsed</span>
                  <span className="font-semibold text-slate-900">
                    {Math.round((new Date().getTime() - new Date(request.created_at).getTime()) / (1000 * 60 * 60))}h
                  </span>
                </div>
                <div className="bg-slate-100 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full"
                    style={{
                      width: `${Math.min(
                        100,
                        Math.round(
                          ((new Date().getTime() - new Date(request.created_at).getTime()) /
                            (1000 * 60 * 60) /
                            request.sla_hours) *
                            100,
                        ),
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Assigned To */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Assigned To</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="font-semibold text-slate-900">{request.assigned_to || "Unassigned"}</p>
              <p className="text-xs text-slate-600 mt-1">
                Last updated {new Date(request.updated_at).toLocaleDateString()}
              </p>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {request.status !== "resolved" && (
                <>
                  <Button className="w-full bg-blue-600 hover:bg-blue-700" size="sm">
                    Update Status
                  </Button>
                  <Button className="w-full bg-transparent" variant="outline" size="sm">
                    Add Comment
                  </Button>
                </>
              )}
              {request.status !== "escalated" && (
                <Button className="w-full bg-transparent" variant="outline" size="sm">
                  <ArrowUp className="w-3 h-3 mr-2" />
                  Escalate
                </Button>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
