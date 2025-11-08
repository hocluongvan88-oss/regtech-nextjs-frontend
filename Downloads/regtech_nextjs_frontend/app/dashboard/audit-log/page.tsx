"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface AuditLog {
  id: string
  client_id: string
  user_id: string
  action: string
  entity_type: string
  entity_id: string
  old_values: string
  new_values: string
  timestamp: string
  ip_address: string
  user_agent: string
  status: string
  error_message?: string
}

interface PaginationData {
  total: number
  limit: number
  offset: number
  pages: number
}

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [pagination, setPagination] = useState<PaginationData | null>(null)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    entityType: "",
  })
  const [page, setPage] = useState(0)

  useEffect(() => {
    const fetchLogs = async () => {
      setLoading(true)
      try {
        const params = new URLSearchParams({
          limit: "50",
          offset: String(page * 50),
          ...(filters.userId && { user_id: filters.userId }),
          ...(filters.action && { action: filters.action }),
          ...(filters.entityType && { entity_type: filters.entityType }),
        })

        const response = await fetch(`/api/audit-log?${params}`, {
          headers: {
            "x-client-id": localStorage.getItem("clientId") || "",
          },
        })

        if (!response.ok) throw new Error("Failed to fetch logs")

        const data = await response.json()
        setLogs(data.logs || [])
        setPagination(data.pagination)
      } catch (error) {
        console.error("[v0] Error fetching audit logs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchLogs()
  }, [filters, page])

  const handleExportCSV = () => {
    if (!logs.length) return

    const headers = ["Timestamp", "User ID", "Action", "Entity Type", "Entity ID", "Status"]
    const rows = logs.map((log) => [
      new Date(log.timestamp).toLocaleString(),
      log.user_id,
      log.action,
      log.entity_type,
      log.entity_id,
      log.status,
    ])

    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n")
    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `audit-log-${new Date().toISOString()}.csv`
    a.click()
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <p className="text-muted-foreground">Track all system activities and changes</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">User ID</label>
              <Input
                placeholder="Filter by user ID"
                value={filters.userId}
                onChange={(e) => {
                  setFilters({ ...filters, userId: e.target.value })
                  setPage(0)
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Action</label>
              <Input
                placeholder="Filter by action"
                value={filters.action}
                onChange={(e) => {
                  setFilters({ ...filters, action: e.target.value })
                  setPage(0)
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Entity Type</label>
              <Input
                placeholder="Filter by entity type"
                value={filters.entityType}
                onChange={(e) => {
                  setFilters({ ...filters, entityType: e.target.value })
                  setPage(0)
                }}
              />
            </div>
          </div>
          <Button onClick={handleExportCSV} disabled={!logs.length}>
            Export to CSV
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Logs</CardTitle>
          <CardDescription>
            Total: {pagination?.total || 0} records | Page {page + 1} of {pagination?.pages || 1}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading...</div>
          ) : logs.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2 px-2">Timestamp</th>
                    <th className="text-left py-2 px-2">User ID</th>
                    <th className="text-left py-2 px-2">Action</th>
                    <th className="text-left py-2 px-2">Entity</th>
                    <th className="text-left py-2 px-2">Status</th>
                    <th className="text-left py-2 px-2">IP Address</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log) => (
                    <tr key={log.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 px-2">{new Date(log.timestamp).toLocaleString()}</td>
                      <td className="py-2 px-2">{log.user_id}</td>
                      <td className="py-2 px-2">
                        <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">{log.action}</span>
                      </td>
                      <td className="py-2 px-2">
                        {log.entity_type} ({log.entity_id})
                      </td>
                      <td className="py-2 px-2">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            log.status === "success" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                          }`}
                        >
                          {log.status}
                        </span>
                      </td>
                      <td className="py-2 px-2 text-xs">{log.ip_address}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">No audit logs found</div>
          )}

          {pagination && pagination.pages > 1 && (
            <div className="flex justify-between items-center mt-4">
              <Button variant="outline" onClick={() => setPage(Math.max(0, page - 1))} disabled={page === 0}>
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {page + 1} of {pagination.pages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(Math.min(pagination.pages - 1, page + 1))}
                disabled={page >= pagination.pages - 1}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
