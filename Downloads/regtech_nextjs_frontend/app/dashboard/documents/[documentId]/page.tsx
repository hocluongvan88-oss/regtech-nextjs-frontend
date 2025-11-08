"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, CheckCircle, Clock } from "lucide-react"

export default function DocumentDetailPage() {
  const params = useParams()
  const documentId = params.documentId as string

  const [document, setDocument] = useState<any>(null)
  const [versions, setVersions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [docRes, versionsRes] = await Promise.all([
          fetch(`/api/documents/${documentId}`),
          fetch(`/api/documents/${documentId}/versions`),
        ])

        const docData = await docRes.json()
        const versionsData = await versionsRes.json()

        setDocument(docData)
        setVersions(versionsData || [])
      } catch (error) {
        console.error("[v0] Error fetching document:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [documentId])

  const handleUploadVersion = async () => {
    const filePath = prompt("Enter new version file path:")
    if (!filePath) return

    setUploading(true)
    try {
      const response = await fetch(`/api/documents/${documentId}/versions`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filePath,
          uploadedBy: "current-user-id",
          changeNotes: prompt("Version notes:") || "",
        }),
      })

      if (response.ok) {
        const versionsRes = await fetch(`/api/documents/${documentId}/versions`)
        const versionsData = await versionsRes.json()
        setVersions(versionsData)
      }
    } catch (error) {
      console.error("[v0] Error uploading version:", error)
    } finally {
      setUploading(false)
    }
  }

  const handleApproveVersion = async (versionId: string) => {
    try {
      await fetch(`/api/documents/${documentId}/versions/${versionId}/approve`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          approvedBy: "current-user-id",
          approvalNotes: prompt("Approval notes:") || "",
        }),
      })

      const versionsRes = await fetch(`/api/documents/${documentId}/versions`)
      const versionsData = await versionsRes.json()
      setVersions(versionsData)
    } catch (error) {
      console.error("[v0] Error approving version:", error)
    }
  }

  if (loading) return <div className="text-center py-12">Loading document...</div>
  if (!document) return <div className="text-center py-12">Document not found</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{document.document_name}</h1>
          <p className="text-slate-600 mt-1">Type: {document.document_type}</p>
        </div>
        <Link href="/dashboard/documents">
          <Button variant="outline">Back</Button>
        </Link>
      </div>

      {/* Document Info */}
      <Card>
        <CardHeader>
          <CardTitle>Document Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-slate-600">Uploaded By</p>
              <p className="font-medium text-slate-900">{document.uploaded_by_email || "—"}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Upload Date</p>
              <p className="font-medium text-slate-900">{new Date(document.upload_date).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">File Size</p>
              <p className="font-medium text-slate-900">{(document.file_size / 1024).toFixed(2)} KB</p>
            </div>
            <div>
              <p className="text-sm text-slate-600">Status</p>
              <p className="font-medium text-slate-900">{document.document_type || "Active"}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Versions */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <CardTitle>Version History (21 CFR Part 11 Compliant)</CardTitle>
          <Button onClick={handleUploadVersion} disabled={uploading} size="sm">
            <Plus className="w-4 h-4 mr-2" />
            New Version
          </Button>
        </CardHeader>
        <CardContent>
          {versions.length === 0 ? (
            <p className="text-slate-600">No versions found</p>
          ) : (
            <div className="space-y-3">
              {versions.map((version) => (
                <div key={version.id} className="border border-slate-200 rounded-lg p-4 hover:bg-slate-50">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-900">Version {version.version_number}</h4>
                        {version.approval_status === "approved" ? (
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        ) : (
                          <Clock className="w-4 h-4 text-yellow-600" />
                        )}
                        <span
                          className={`text-xs px-2 py-1 rounded-full ${
                            version.approval_status === "approved"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {version.approval_status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 mt-1">{version.change_notes}</p>
                      <p className="text-xs text-slate-500 mt-1">
                        Uploaded by {version.uploaded_by_email} on {new Date(version.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {version.approval_status !== "approved" && (
                      <Button
                        onClick={() => handleApproveVersion(version.id)}
                        size="sm"
                        variant="outline"
                        className="ml-2"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Approve
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
