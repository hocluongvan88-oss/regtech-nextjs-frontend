"use client"

import { Badge } from "@/components/ui/badge"
import { CheckCircle2, Clock, AlertCircle } from "lucide-react"

interface ApprovalStep {
  id: string
  stepNumber: number
  title: string
  description: string
  status: "pending" | "approved" | "rejected" | "in-progress"
  approver: string
  approverEmail: string
  dueDate?: string
  approvedDate?: string
  comment?: string
}

interface ApprovalTimelineProps {
  steps: ApprovalStep[]
  currentStep: number
}

export function ApprovalTimeline({ steps, currentStep }: ApprovalTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle2 className="w-6 h-6 text-green-600" />
      case "in-progress":
        return <Clock className="w-6 h-6 text-blue-600" />
      case "rejected":
        return <AlertCircle className="w-6 h-6 text-red-600" />
      default:
        return <Clock className="w-6 h-6 text-slate-400" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "in-progress":
        return "bg-blue-100 text-blue-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="relative">
      {/* Timeline Line */}
      <div className="absolute left-3 top-12 bottom-0 w-0.5 bg-slate-200" />

      {/* Steps */}
      <div className="space-y-6">
        {steps.map((step, idx) => (
          <div key={step.id} className="relative pl-12">
            {/* Icon */}
            <div className="absolute -left-3 top-0">{getStatusIcon(step.status)}</div>

            {/* Content */}
            <div
              className={`p-4 rounded-lg border-2 ${
                step.status === "in-progress"
                  ? "border-blue-300 bg-blue-50"
                  : step.status === "approved"
                    ? "border-green-300 bg-green-50"
                    : step.status === "rejected"
                      ? "border-red-300 bg-red-50"
                      : "border-slate-200 bg-slate-50"
              }`}
            >
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h4 className="font-semibold text-slate-900">
                    Step {step.stepNumber}: {step.title}
                  </h4>
                  <p className="text-sm text-slate-600 mt-1">{step.description}</p>
                </div>
                <Badge className={getStatusBadge(step.status)}>{step.status}</Badge>
              </div>

              <div className="text-sm text-slate-600 mt-3 space-y-1">
                <p>
                  <strong>Approver:</strong> {step.approver} ({step.approverEmail})
                </p>
                {step.dueDate && (
                  <p>
                    <strong>Due:</strong> {new Date(step.dueDate).toLocaleDateString()}
                  </p>
                )}
                {step.approvedDate && (
                  <p>
                    <strong>Approved:</strong> {new Date(step.approvedDate).toLocaleDateString()}
                  </p>
                )}
              </div>

              {step.comment && (
                <div className="mt-3 p-2 bg-white rounded border-l-2 border-blue-500">
                  <p className="text-sm text-slate-700">
                    <strong>Comment:</strong> {step.comment}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
