"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AlertCircle, CheckCircle } from "lucide-react"

interface ApprovalFormProps {
  workflowId: string
  currentStep: number
  totalSteps: number
  documentName: string
  onApprove: (comment: string, signature: string) => Promise<void>
  onReject: (reason: string) => Promise<void>
}

export function ApprovalForm({
  workflowId,
  currentStep,
  totalSteps,
  documentName,
  onApprove,
  onReject,
}: ApprovalFormProps) {
  const [action, setAction] = useState<"approve" | "reject" | null>(null)
  const [comment, setComment] = useState("")
  const [signature, setSignature] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const handleApprove = async () => {
    if (!signature) {
      setError("Electronic signature is required")
      return
    }

    setIsSubmitting(true)
    try {
      await onApprove(comment, signature)
    } catch (err) {
      setError("Failed to submit approval")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleReject = async () => {
    if (!comment) {
      setError("Reason for rejection is required")
      return
    }

    setIsSubmitting(true)
    try {
      await onReject(comment)
    } catch (err) {
      setError("Failed to submit rejection")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Document Approval</span>
          <Badge variant="outline">
            Step {currentStep} of {totalSteps}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Document Info */}
        <div className="p-4 bg-slate-50 rounded-lg border">
          <p className="text-sm text-slate-600">Document</p>
          <p className="font-semibold text-slate-900 mt-1">{documentName}</p>
        </div>

        {/* Action Selection */}
        <div className="space-y-3">
          <p className="font-semibold text-slate-900">Take Action</p>
          <div className="flex gap-3">
            <Button
              variant={action === "approve" ? "default" : "outline"}
              onClick={() => {
                setAction("approve")
                setError("")
              }}
              className="flex-1"
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve
            </Button>
            <Button
              variant={action === "reject" ? "destructive" : "outline"}
              onClick={() => {
                setAction("reject")
                setError("")
              }}
              className="flex-1"
            >
              <AlertCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
          </div>
        </div>

        {/* Approval Form */}
        {action === "approve" && (
          <div className="space-y-4 p-4 bg-green-50 rounded-lg border border-green-200">
            <div>
              <label className="text-sm font-medium text-slate-900">Comment (Optional)</label>
              <Textarea
                placeholder="Add any comments..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
                rows={3}
              />
            </div>

            <div>
              <label className="text-sm font-medium text-slate-900">Electronic Signature</label>
              <Input
                type="password"
                placeholder="Enter your e-signature password"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="mt-2"
              />
              <p className="text-xs text-slate-600 mt-1">
                Your signature confirms this document meets all requirements.
              </p>
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}

            <Button onClick={handleApprove} disabled={isSubmitting} className="w-full bg-green-600 hover:bg-green-700">
              {isSubmitting ? "Approving..." : "Approve Document"}
            </Button>
          </div>
        )}

        {/* Rejection Form */}
        {action === "reject" && (
          <div className="space-y-4 p-4 bg-red-50 rounded-lg border border-red-200">
            <div>
              <label className="text-sm font-medium text-slate-900">Reason for Rejection</label>
              <Textarea
                placeholder="Please provide a detailed reason for rejection..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-2"
                rows={4}
              />
            </div>

            {error && <div className="p-3 bg-red-100 border border-red-300 rounded text-red-800 text-sm">{error}</div>}

            <Button onClick={handleReject} disabled={isSubmitting} className="w-full bg-red-600 hover:bg-red-700">
              {isSubmitting ? "Rejecting..." : "Reject Document"}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
