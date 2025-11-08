"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Clock } from "lucide-react"
import Link from "next/link"

type ServiceRequest = {
  id: string
  title: string
  request_type: string
  priority: string
  status: string
  required_response_date?: string
  assigned_to?: string
}

export function ServiceRequestList() {
  const [requests, setRequests] = useState<ServiceRequest[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("open")

  useEffect(() => {
    fetchServiceRequests()
  }, [filter])

  const fetchServiceRequests = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.append("status", filter)

      const response = await fetch(`/api/service-requests?${params}`, {
        headers: {
          "x-client-id": localStorage.getItem("clientId") || "",
          "x-user-id": localStorage.getItem("userId") || "",
        },
      })
      const data = await response.json()
      setRequests(data.data || [])
    } catch (error) {
      console.error("Error fetching service requests:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case "critical":
      case "urgent":
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case "high":
        return <Clock className="h-4 w-4 text-orange-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "resolved":
      case "closed":
        return "bg-green-100 text-green-800"
      case "escalated":
        return "bg-red-100 text-red-800"
      case "in_progress":
        return "bg-blue-100 text-blue-800"
      case "pending_info":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) return <div className="text-center py-8">Loading service requests...</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {["open", "in_progress", "escalated", "resolved", "all"].map((status) => (
          <Button
            key={status}
            variant={filter === status ? "default" : "outline"}
            onClick={() => setFilter(status)}
            className="capitalize"
          >
            {status.replace("_", " ")}
          </Button>
        ))}
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium max-w-xs truncate">{request.title}</TableCell>
              <TableCell>
                <Badge variant="outline">{request.request_type.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  {getPriorityIcon(request.priority)}
                  <span className="capitalize">{request.priority}</span>
                </div>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(request.status)}>{request.status.replace("_", " ")}</Badge>
              </TableCell>
              <TableCell className="text-sm">{request.required_response_date || "TBD"}</TableCell>
              <TableCell>
                <Link href={`/service-requests/${request.id}`}>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {requests.length === 0 && <div className="text-center py-8 text-gray-500">No service requests found.</div>}
    </div>
  )
}
