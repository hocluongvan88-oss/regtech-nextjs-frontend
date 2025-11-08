"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Send, RefreshCw, AlertCircle, CheckCircle } from "lucide-react"

interface FDAActionsProps {
  submissionId: string
  fdaSubmissionId?: string
  clientId: string
  submissionStatus: string
}

export function FDAActions({ submissionId, fdaSubmissionId, clientId, submissionStatus }: FDAActionsProps) {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const handleSubmitToFDA = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch("/api/fda/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          clientId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      setMessage("Successfully submitted to FDA!")
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleCheckStatus = async () => {
    setLoading(true)
    setError("")
    setMessage("")

    try {
      const response = await fetch(
        `/api/fda/status?submission_id=${submissionId}&fda_submission_id=${fdaSubmissionId}&client_id=${clientId}`,
      )

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      setMessage(`FDA Status: ${data.status?.toUpperCase()}`)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardContent className="p-4 space-y-4">
        <div>
          <h3 className="font-semibold text-slate-900 mb-3">FDA Actions</h3>

          {message && (
            <div className="mb-3 p-3 bg-green-50 border border-green-200 rounded-lg flex gap-2">
              <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="mb-3 p-3 bg-red-50 border border-red-200 rounded-lg flex gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <div className="space-y-2">
            {submissionStatus === "draft" && (
              <Button onClick={handleSubmitToFDA} disabled={loading} className="w-full">
                <Send className="w-4 h-4 mr-2" />
                Submit to FDA
              </Button>
            )}

            {fdaSubmissionId && (
              <Button
                onClick={handleCheckStatus}
                disabled={loading}
                variant="outline"
                className="w-full bg-transparent"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Check FDA Status
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
