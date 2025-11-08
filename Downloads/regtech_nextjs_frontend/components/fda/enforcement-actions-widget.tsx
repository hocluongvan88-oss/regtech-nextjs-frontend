"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertTriangle, Loader2 } from "lucide-react"

interface EnforcementAction {
  enforcement_id: string
  product_description: string
  reason_for_recall: string
  classification: string
  recall_initiation_date: string
}

interface Props {
  clientId: string
}

export function EnforcementActionsWidget({ clientId }: Props) {
  const [actions, setActions] = useState<EnforcementAction[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchActions = async () => {
      try {
        const response = await fetch(`/api/fda/enforcement-actions?client_id=${clientId}&limit=5`)
        const data = await response.json()
        setActions(data.data || [])
      } catch (error) {
        console.error("[v0] Error fetching enforcement actions:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchActions()
  }, [clientId])

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600" />
            FDA Enforcement Actions
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-slate-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-600" />
          Recent FDA Enforcement Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.length === 0 ? (
          <p className="text-sm text-slate-500">No recent enforcement actions</p>
        ) : (
          actions.map((action) => (
            <div key={action.enforcement_id} className="p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div className="flex justify-between items-start gap-2">
                <div>
                  <p className="font-medium text-sm text-slate-900">{action.product_description}</p>
                  <p className="text-xs text-slate-600 mt-1">{action.reason_for_recall}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    Classification: <span className="font-medium">{action.classification}</span>
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
