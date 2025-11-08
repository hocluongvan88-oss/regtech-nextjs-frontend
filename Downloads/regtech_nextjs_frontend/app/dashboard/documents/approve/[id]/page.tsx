"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ApprovalTimeline } from "@/components/approvals/approval-timeline"
import { ApprovalForm } from "@/components/approvals/approval-form"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft } from "lucide-react"

interface ApprovalWorkflowPageProps {
  params: {
    id: string
  }
}

export default function ApprovalWorkflowPage({ params }: ApprovalWorkflowPageProps) {
  const router = useRouter()
  const [workflow, setWorkflow] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkflow = async () => {
      try {
        const response = await fetch(`/api/documents/approval/${params.id}`)
        const data = await response.json()
        setWorkflow(data)
      } catch (error) {
        console.error("[v0] Error fetching workflow:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchWorkflow()
  }, [params.id])

  const handleApprove = async (comment: string, signature: string) => {
    try {
      const response = await fetch(`/api/documents/approval/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "approve",
          comment,
          signature,
        }),
      })

      if (response.ok) {
        alert("Document approved successfully")
        router.push("/dashboard/documents/approvals")
      }
    } catch (error) {
      console.error("[v0] Error approving:", error)
      throw error
    }
  }

  const handleReject = async (reason: string) => {
    try {
      const response = await fetch(`/api/documents/approval/${params.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "reject",
          reason,
        }),
      })

      if (response.ok) {
        alert("Document rejected")
        router.push("/dashboard/documents/approvals")
      }
    } catch (error) {
      console.error("[v0] Error rejecting:", error)
      throw error
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading workflow...</p>
      </div>
    )
  }

  if (!workflow) {
    return (
      <div className="space-y-4">
        <p className="text-red-600">Workflow not found</p>
        <Link href="/dashboard/documents/approvals">
          <Button variant="outline">Back to Approvals</Button>
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/documents/approvals">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Document Approval Workflow</h1>
          <p className="text-slate-600 mt-1">{workflow.documentName}</p>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Timeline - Left Column */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Approval Timeline</CardTitle>
            </CardHeader>
            <CardContent>
              <ApprovalTimeline steps={workflow.steps || []} currentStep={workflow.currentStep || 1} />
            </CardContent>
          </Card>
        </div>

        {/* Approval Form - Right Column */}
        <div>
          <ApprovalForm
            workflowId={params.id}
            currentStep={workflow.currentStep || 1}
            totalSteps={workflow.totalSteps || 3}
            documentName={workflow.documentName}
            onApprove={handleApprove}
            onReject={handleReject}
          />
        </div>
      </div>

      {/* Document Preview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Document Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border rounded-lg p-8 bg-slate-50 text-center text-slate-600">
            <p>Document preview would be displayed here</p>
            <p className="text-sm mt-2">File: {workflow.documentUrl || "preview.pdf"}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
