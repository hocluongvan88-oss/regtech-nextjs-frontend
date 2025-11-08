"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { AlertTriangle, Clock } from "lucide-react"

type ServiceRequestDetailProps = {
  requestId: string
}

export function ServiceRequestDetail({ requestId }: ServiceRequestDetailProps) {
  const [request, setRequest] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [comment, setComment] = useState("")
  const [addingComment, setAddingComment] = useState(false)

  useEffect(() => {
    fetchData()
  }, [requestId])

  const fetchData = async () => {
    try {
      const [reqRes, activRes] = await Promise.all([
        fetch(`/api/service-requests/${requestId}`, {
          headers: {
            "x-client-id": localStorage.getItem("clientId") || "",
            "x-user-id": localStorage.getItem("userId") || "",
          },
        }),
        fetch(`/api/service-requests/${requestId}/activities`, {
          headers: {
            "x-client-id": localStorage.getItem("clientId") || "",
            "x-user-id": localStorage.getItem("userId") || "",
          },
        }),
      ])

      const reqData = await reqRes.json()
      const activData = await activRes.json()

      setRequest(reqData.data)
      setActivities(activData.data || [])
    } catch (error) {
      console.error("Error fetching request details:", error)
    } finally {
      setLoading(false)
    }
  }

  const addComment = async () => {
    if (!comment.trim()) return

    setAddingComment(true)
    try {
      const response = await fetch(`/api/service-requests/${requestId}/activities`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-client-id": localStorage.getItem("clientId") || "",
          "x-user-id": localStorage.getItem("userId") || "",
        },
        body: JSON.stringify({
          activity_type: "comment",
          description: comment,
        }),
      })

      if (response.ok) {
        setComment("")
        await fetchData()
      }
    } catch (error) {
      console.error("Error adding comment:", error)
    } finally {
      setAddingComment(false)
    }
  }

  if (loading) return <div>Loading request details...</div>
  if (!request) return <div>Request not found</div>

  const priorityIcon =
    request.priority === "critical" || request.priority === "urgent" ? (
      <AlertTriangle className="h-5 w-5 text-red-500" />
    ) : (
      <Clock className="h-5 w-5 text-blue-500" />
    )

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <CardTitle className="flex items-center gap-2">
                {priorityIcon}
                {request.title}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">{request.request_type}</Badge>
                <Badge variant={request.status === "resolved" ? "default" : "secondary"}>{request.status}</Badge>
                <Badge className="bg-red-100 text-red-800">{request.priority}</Badge>
              </div>
            </div>
            {request.status !== "resolved" && <Button variant="default">Update Status</Button>}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm font-medium text-gray-600">Reference</p>
              <p>{request.reference_number || "N/A"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Due Date</p>
              <p>{request.required_response_date || "Not set"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Assigned To</p>
              <p>{request.assigned_to || "Unassigned"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Created</p>
              <p>{new Date(request.created_at).toLocaleDateString()}</p>
            </div>
          </div>

          {request.description && (
            <div>
              <p className="text-sm font-medium text-gray-600 mb-2">Description</p>
              <p className="bg-gray-50 p-3 rounded">{request.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Activity Timeline */}
      <Card>
        <CardHeader>
          <CardTitle>Activity & Comments</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {activities.map((activity) => (
              <div key={activity.id} className="border-l-2 border-gray-200 pl-4 py-2">
                <p className="text-sm font-medium">{activity.activity_type}</p>
                <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-2">{new Date(activity.created_at).toLocaleString()}</p>
              </div>
            ))}
          </div>

          {request.status !== "closed" && (
            <div className="space-y-2 border-t pt-4">
              <Textarea
                placeholder="Add a comment..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-20"
              />
              <Button onClick={addComment} disabled={addingComment || !comment.trim()} className="w-full">
                {addingComment ? "Adding..." : "Add Comment"}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
