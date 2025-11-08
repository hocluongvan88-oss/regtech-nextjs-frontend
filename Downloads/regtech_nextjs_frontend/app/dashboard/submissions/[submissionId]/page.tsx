"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Download, FileUp } from "lucide-react"

export default function SubmissionDetailPage() {
  const params = useParams()
  const submissionId = params.submissionId as string
  const [submission, setSubmission] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showStatusModal, setShowStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [submissionRes, productsRes, docsRes] = await Promise.all([
          fetch(`/api/submissions/${submissionId}`),
          fetch(`/api/submissions/${submissionId}/products`),
          fetch(`/api/submissions/${submissionId}/documents`),
        ])

        const submissionData = await submissionRes.json()
        const productsData = await productsRes.json()
        const docsData = await docsRes.json()

        setSubmission(submissionData)
        setProducts(productsData)
        setDocuments(docsData)
        setNewStatus(submissionData.submission_status)
      } catch (error) {
        console.error("[v0] Error fetching submission:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [submissionId])

  const handleStatusUpdate = async () => {
    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ submission_status: newStatus }),
      })

      if (response.ok) {
        const updated = await response.json()
        setSubmission(updated)
        setShowStatusModal(false)
      }
    } catch (error) {
      console.error("[v0] Error updating submission:", error)
    }
  }

  if (loading) {
    return <div className="text-center py-12">Loading submission details...</div>
  }

  if (!submission) {
    return <div className="text-center py-12">Submission not found</div>
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "submitted":
        return "bg-blue-100 text-blue-800"
      case "pending_review":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Link href="/dashboard/submissions">
        <Button variant="outline" size="sm">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Submissions
        </Button>
      </Link>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            {submission.submission_type.charAt(0).toUpperCase() + submission.submission_type.slice(1)}
          </h1>
          <p className="text-slate-600 mt-1">Submission #{submission.submission_number}</p>
        </div>
        <Button onClick={() => setShowStatusModal(true)}>Update Status</Button>
      </div>

      {/* Main Details */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Submission Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Status */}
            <div>
              <p className="text-sm text-slate-600 mb-2">Current Status</p>
              <span
                className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(submission.submission_status)}`}
              >
                {submission.submission_status.replace("_", " ")}
              </span>
            </div>

            {/* Timeline */}
            <div className="space-y-3 border-t border-slate-200 pt-6">
              {submission.submitted_date && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Submitted Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(submission.submitted_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {submission.reviewed_date && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Reviewed Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(submission.reviewed_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {submission.approval_date && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Approval Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(submission.approval_date).toLocaleDateString()}
                  </span>
                </div>
              )}

              {submission.expiration_date && (
                <div className="flex justify-between">
                  <span className="text-slate-600">Expiration Date</span>
                  <span className="font-medium text-slate-900">
                    {new Date(submission.expiration_date).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>

            {/* Comments */}
            {submission.comments && (
              <div className="border-t border-slate-200 pt-6">
                <p className="text-sm text-slate-600 mb-2">Comments</p>
                <p className="text-slate-900 whitespace-pre-wrap">{submission.comments}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Compliance Status */}
        <Card>
          <CardHeader>
            <CardTitle>Compliance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                Status is tracked automatically based on submission state and regulatory requirements.
              </p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-900">Required Documents</p>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>✓ Product Labeling</li>
                <li>✓ Manufacturing Information</li>
                <li>✓ Stability Data</li>
                <li>✓ Safety & Efficacy Report</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Products */}
      <Card>
        <CardHeader>
          <CardTitle>Associated Products</CardTitle>
          <CardDescription>{products.length} product(s) included</CardDescription>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <p className="text-slate-600 text-sm">No products in this submission</p>
          ) : (
            <div className="space-y-2">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="flex items-center justify-between p-3 border border-slate-200 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-slate-900">{product.product_name}</p>
                    <p className="text-sm text-slate-600">{product.product_code}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Documents */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Documents</CardTitle>
            <CardDescription>{documents.length} document(s) uploaded</CardDescription>
          </div>
          <Button size="sm">
            <FileUp className="w-4 h-4 mr-2" />
            Upload
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <p className="text-slate-600 text-sm">No documents uploaded yet</p>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{doc.document_name}</p>
                    <p className="text-sm text-slate-600">{doc.document_type}</p>
                  </div>
                  <Button size="sm" variant="ghost">
                    <Download className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Status Update Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <Card className="w-96">
            <CardHeader>
              <CardTitle>Update Submission Status</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value)}
                className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>

              <div className="flex gap-3">
                <Button onClick={() => setShowStatusModal(false)} variant="outline" className="flex-1">
                  Cancel
                </Button>
                <Button onClick={handleStatusUpdate} className="flex-1">
                  Update
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
