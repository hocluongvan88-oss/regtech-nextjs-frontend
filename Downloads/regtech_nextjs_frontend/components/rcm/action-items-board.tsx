"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

type ActionItem = {
  id: string
  action_title: string
  priority: string
  status: string
  due_date: string
  assigned_to: string
}

export function ActionItemsBoard() {
  const [items, setItems] = useState<ActionItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchActionItems()
  }, [])

  const fetchActionItems = async () => {
    try {
      const response = await fetch("/api/rcm/action-items", {
        headers: {
          "x-client-id": localStorage.getItem("clientId") || "",
          "x-user-id": localStorage.getItem("userId") || "",
        },
      })
      const data = await response.json()
      setItems(data.data || [])
    } catch (error) {
      console.error("Error fetching action items:", error)
    } finally {
      setLoading(false)
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "critical":
        return "bg-red-100 text-red-800"
      case "high":
        return "bg-orange-100 text-orange-800"
      case "medium":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-green-100 text-green-800"
    }
  }

  const groupedItems = {
    pending: items.filter((i) => i.status === "pending"),
    in_progress: items.filter((i) => i.status === "in_progress"),
    completed: items.filter((i) => i.status === "completed"),
  }

  if (loading) return <div className="text-center py-8">Loading action items...</div>

  return (
    <div className="grid grid-cols-3 gap-4">
      {/* Pending Column */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-yellow-500" />
            Pending ({groupedItems.pending.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupedItems.pending.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg space-y-2 bg-yellow-50">
              <p className="font-medium text-sm">{item.action_title}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                <Badge variant="outline">{item.due_date}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* In Progress Column */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-500" />
            In Progress ({groupedItems.in_progress.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupedItems.in_progress.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg space-y-2 bg-blue-50">
              <p className="font-medium text-sm">{item.action_title}</p>
              <div className="flex gap-2 flex-wrap">
                <Badge className={getPriorityColor(item.priority)}>{item.priority}</Badge>
                <Badge variant="outline">{item.due_date}</Badge>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Completed Column */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            Completed ({groupedItems.completed.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {groupedItems.completed.map((item) => (
            <div key={item.id} className="p-3 border rounded-lg space-y-2 bg-green-50 opacity-75">
              <p className="font-medium text-sm line-through">{item.action_title}</p>
              <Badge variant="outline">Completed</Badge>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
