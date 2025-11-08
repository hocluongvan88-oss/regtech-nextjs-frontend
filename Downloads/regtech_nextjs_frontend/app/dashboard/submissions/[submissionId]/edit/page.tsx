"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function EditSubmissionPage() {
  const router = useRouter()
  const params = useParams()
  const submissionId = params.submissionId as string

  const [loading, setLoading] = useState(false)
  const [fetching, setFetching] = useState(true)
  const [submission, setSubmission] = useState<any>(null)
  const [products, setProducts] = useState<any[]>([])
  const [form, setForm] = useState({
    comments: "",
    status: "draft",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [submissionRes, productsRes] = await Promise.all([
          fetch(`/api/submissions/${submissionId}`),
          fetch("/api/products"),
        ])

        const submissionData = await submissionRes.json()
        const productsData = await productsRes.json()

        setSubmission(submissionData)
        setProducts(productsData || [])
        setForm({
          comments: submissionData.comments || "",
          status: submissionData.submission_status || "draft",
        })
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
      } finally {
        setFetching(false)
      }
    }

    fetchData()
  }, [submissionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/submissions/${submissionId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          comments: form.comments,
          submission_status: form.status,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update submission")
      }

      router.push(`/dashboard/submissions/${submissionId}`)
    } catch (error) {
      console.error("[v0] Error updating submission:", error)
      alert("Error updating submission")
    } finally {
      setLoading(false)
    }
  }

  if (fetching) {
    return <div className="text-center py-12">Loading submission...</div>
  }

  if (!submission) {
    return <div className="text-center py-12">Submission not found</div>
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit Submission</h1>
          <p className="text-slate-600 mt-1">{submission.submission_number || "Draft"}</p>
        </div>
        <Link href={`/dashboard/submissions/${submissionId}`}>
          <Button variant="outline">Cancel</Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Submission Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm({ ...form, status: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="draft">Draft</option>
                <option value="submitted">Submitted</option>
                <option value="pending_review">Pending Review</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>

            {/* Comments */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Comments</label>
              <textarea
                value={form.comments}
                onChange={(e) => setForm({ ...form, comments: e.target.value })}
                placeholder="Add any additional comments or special instructions..."
                rows={4}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href={`/dashboard/submissions/${submissionId}`}>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
