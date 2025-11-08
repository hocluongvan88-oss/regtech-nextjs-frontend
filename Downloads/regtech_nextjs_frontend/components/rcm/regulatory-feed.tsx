"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RegulatoryCard } from "./regulatory-card"
import { Loader2, Search } from "lucide-react"

interface RegulatoryUpdate {
  id: string
  title: string
  description: string
  type: "guidance" | "final_rule" | "compliance_program"
  severity: "critical" | "high" | "medium" | "low"
  datePublished: string
  affectedProductsCount: number
  isRead: boolean
}

export function RegulatoryFeed() {
  const [updates, setUpdates] = useState<RegulatoryUpdate[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedType, setSelectedType] = useState<string>("all")
  const [selectedSeverity, setSelectedSeverity] = useState<string>("all")

  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const response = await fetch("/api/rcm/regulations")
        const data = await response.json()
        setUpdates(data || [])
      } catch (error) {
        console.error("[v0] Error fetching regulatory updates:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpdates()
  }, [])

  const handleMarkRead = async (id: string) => {
    try {
      await fetch(`/api/rcm/regulations/${id}/read`, {
        method: "POST",
      })
      setUpdates((prev) => prev.map((u) => (u.id === id ? { ...u, isRead: true } : u)))
    } catch (error) {
      console.error("[v0] Error marking as read:", error)
    }
  }

  const filteredUpdates = updates.filter((update) => {
    const matchesSearch =
      update.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      update.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = selectedType === "all" || update.type === selectedType
    const matchesSeverity = selectedSeverity === "all" || update.severity === selectedSeverity
    return matchesSearch && matchesType && matchesSeverity
  })

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
          <Input
            placeholder="Search regulatory updates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          {/* Type Filter */}
          <div className="flex gap-2">
            {["all", "guidance", "final_rule", "compliance_program"].map((type) => (
              <Button
                key={type}
                variant={selectedType === type ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedType(type)}
              >
                {type === "all" ? "All Types" : type.replace("_", " ")}
              </Button>
            ))}
          </div>

          {/* Severity Filter */}
          <div className="flex gap-2">
            {["all", "critical", "high", "medium", "low"].map((severity) => (
              <Button
                key={severity}
                variant={selectedSeverity === severity ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedSeverity(severity)}
              >
                {severity === "all" ? "All Severity" : severity}
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Updates List */}
      <div className="space-y-3">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-12">
              <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
              <span className="ml-2 text-slate-600">Loading regulatory updates...</span>
            </CardContent>
          </Card>
        ) : filteredUpdates.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-slate-600">No regulatory updates found</p>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="text-sm text-slate-600 mb-2">
              Showing {filteredUpdates.length} of {updates.length} updates
            </div>
            {filteredUpdates.map((update) => (
              <RegulatoryCard key={update.id} {...update} onMarkRead={handleMarkRead} />
            ))}
          </>
        )}
      </div>
    </div>
  )
}
