"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus, Trash2, FileText, Clock, CheckCircle } from "lucide-react"

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filterType, setFilterType] = useState("all")

  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        let url = "/api/documents"
        if (filterType !== "all") {
          url += `?docType=${filterType}`
        }
        const response = await fetch(url)
        const data = await response.json()
        setDocuments(data || [])
      } catch (error) {
        console.error("[v0] Error fetching documents:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDocuments()
  }, [filterType])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <FileText className="w-5 h-5 text-slate-600" />
    }
  }

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      })
      setDocuments(documents.filter((d) => d.id !== docId))
    } catch (error) {
      console.error("[v0] Error deleting document:", error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Documents</h1>
          <p className="text-slate-600 mt-1">Manage technical files and submissions</p>
        </div>
        <Link href="/dashboard/documents/upload">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        {[
          { value: "all", label: "All" },
          { value: "tech_file", label: "Technical File" },
          { value: "sop", label: "SOP" },
          { value: "label", label: "Label" },
          { value: "other", label: "Other" },
        ].map((filter) => (
          <Button
            key={filter.value}
            variant={filterType === filter.value ? "default" : "outline"}
            onClick={() => setFilterType(filter.value)}
          >
            {filter.label}
          </Button>
        ))}
      </div>

      {/* Documents Table */}
      <Card>
        <CardHeader>
          <CardTitle>Document Catalog</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading documents...</div>
          ) : documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No documents found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Document Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Versions</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Uploaded</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {documents.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        <Link href={`/dashboard/documents/${doc.id}`} className="hover:text-blue-600">
                          {doc.document_name}
                        </Link>
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{doc.document_type || "—"}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">{doc.version_count || 1}</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm flex gap-2">
                        <Link href={`/dashboard/documents/${doc.id}`}>
                          <Button size="sm" variant="outline">
                            <FileText className="w-4 h-4" />
                          </Button>
                        </Link>
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-red-600 hover:text-red-700 bg-transparent"
                          onClick={() => handleDelete(doc.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
