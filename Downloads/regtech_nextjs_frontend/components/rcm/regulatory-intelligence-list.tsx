"use client"

import { useState, useEffect } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type RegulatoryIntelligence = {
  id: string
  title: string
  regulatory_body: string
  change_type: string
  risk_level: string
  status: string
  effective_date?: string
  action_items_count: number
}

export function RegulatoryIntelligenceList() {
  const [items, setItems] = useState<RegulatoryIntelligence[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("all")

  useEffect(() => {
    fetchItems()
  }, [filter])

  const fetchItems = async () => {
    try {
      const params = new URLSearchParams()
      if (filter !== "all") params.append("status", filter)

      const response = await fetch(`/api/rcm/intelligence?${params}`, {
        headers: {
          "x-client-id": localStorage.getItem("clientId") || "",
          "x-user-id": localStorage.getItem("userId") || "",
        },
      })
      const data = await response.json()
      setItems(data.data || [])
    } catch (error) {
      console.error("Error fetching regulatory intelligence:", error)
    } finally {
      setLoading(false)
    }
  }

  const getRiskColor = (level: string) => {
    switch (level) {
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-blue-100 text-blue-800"
      case "requires_action":
        return "bg-red-100 text-red-800"
      case "implemented":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) return <div className="text-center py-8">Loading regulatory intelligence...</div>

  return (
    <div className="space-y-4">
      <div className="flex gap-4">
        <Input placeholder="Search regulatory changes..." className="flex-1" />
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="new">New</SelectItem>
            <SelectItem value="under_review">Under Review</SelectItem>
            <SelectItem value="requires_action">Requires Action</SelectItem>
            <SelectItem value="implemented">Implemented</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Regulatory Body</TableHead>
            <TableHead>Risk Level</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
            <TableHead>Effective Date</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="font-medium">{item.title}</TableCell>
              <TableCell>{item.regulatory_body}</TableCell>
              <TableCell>
                <Badge className={getRiskColor(item.risk_level)}>{item.risk_level}</Badge>
              </TableCell>
              <TableCell>
                <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
              </TableCell>
              <TableCell>
                <span className="text-sm font-medium bg-blue-50 px-2 py-1 rounded">
                  {item.action_items_count} action(s)
                </span>
              </TableCell>
              <TableCell>{item.effective_date || "TBD"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {items.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          No regulatory intelligence found. Create your first entry to get started.
        </div>
      )}
    </div>
  )
}
