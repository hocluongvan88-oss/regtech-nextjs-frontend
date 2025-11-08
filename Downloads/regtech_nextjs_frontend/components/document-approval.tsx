"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { SignaturePad } from "@/components/signature-pad"
import { SignatureTimeline } from "@/components/signature-timeline"
import { useToast } from "@/hooks/use-toast"
import { FileText, CheckCircle, X } from "lucide-react"

interface DocumentApprovalProps {
  documentId: string
  documentName: string
  status: "pending" | "approved" | "rejected"
  signatures: any[]
  onApprove?: (signature: string) => void
  onReject?: () => void
}

export function DocumentApproval({
  documentId,
  documentName,
  status,
  signatures,
  onApprove,
  onReject,
}: DocumentApprovalProps) {
  const [showSignaturePad, setShowSignaturePad] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleApprove = async (signature: string) => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ signature }),
      })

      if (!response.ok) throw new Error("Failed to approve document")

      toast({
        title: "Document approved",
        description: "Signature recorded successfully.",
      })

      onApprove?.(signature)
      setShowSignaturePad(false)
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) throw new Error("Failed to reject document")

      toast({
        title: "Document rejected",
        description: "Document marked as rejected.",
      })

      onReject?.()
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Document Info Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <FileText className="w-6 h-6" />
            {documentName}
          </CardTitle>
          <CardDescription>Document approval and signature</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-slate-700">Status:</span>
            <Badge
              className={`${
                status === "approved"
                  ? "bg-green-100 text-green-800"
                  : status === "rejected"
                    ? "bg-red-100 text-red-800"
                    : "bg-yellow-100 text-yellow-800"
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons - Only show if pending */}
      {status === "pending" && (
        <Card>
          <CardHeader>
            <CardTitle>Approval Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3">
              <Button
                onClick={() => setShowSignaturePad(true)}
                disabled={loading}
                className="bg-green-600 hover:bg-green-700"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Approve & Sign
              </Button>
              <Button
                onClick={handleReject}
                disabled={loading}
                variant="outline"
                className="text-red-600 hover:text-red-700 bg-transparent"
              >
                <X className="w-4 h-4 mr-2" />
                Reject Document
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Signature Pad */}
      {showSignaturePad && <SignaturePad onSave={handleApprove} disabled={loading} />}

      {/* Signature Timeline */}
      <SignatureTimeline signatures={signatures} />
    </div>
  )
}
