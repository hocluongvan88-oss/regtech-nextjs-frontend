"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, Loader2 } from "lucide-react"

interface Recall {
  recall_number: string
  product_description: string
  reason_for_recall: string
  classification: string
  recall_status: string
  recall_initiation_date: string
}

interface Props {
  clientId: string
}

export function RecallsAlertWidget({ clientId }: Props) {
  const [recalls, setRecalls] = useState<Recall[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRecalls = async () => {
      try {
        const response = await fetch(`/api/fda/recalls?client_id=${clientId}&status=Ongoing&limit=5`)
        const data = await response.json()
        setRecalls(data.data || [])
      } catch (error) {
        console.error("[v0] Error fetching recalls:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecalls()
  }, [clientId])

  if (loading) {
    return (
      <Card className="border-red-200 bg-red-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-900">
            <AlertCircle className="w-5 h-5" />
            Active Recalls
          </CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-red-400" />
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-red-200 bg-red-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-red-900">
          <AlertCircle className="w-5 h-5" />
          Active FDA Recalls ({recalls.length})
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recalls.length === 0 ? (
          <p className="text-sm text-red-700">No active recalls</p>
        ) : (
          recalls.map((recall) => (
            <div key={recall.recall_number} className="p-3 bg-white rounded-lg border border-red-300">
              <div className="flex justify-between items-start gap-2">
                <div className="flex-1">
                  <p className="font-semibold text-sm text-slate-900">{recall.recall_number}</p>
                  <p className="text-sm text-slate-700 mt-1">{recall.product_description}</p>
                  <div className="flex gap-3 mt-2 text-xs">
                    <span className="px-2 py-1 bg-red-100 text-red-700 rounded">{recall.classification}</span>
                    <span className="text-slate-600">{recall.recall_status}</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  )
}
