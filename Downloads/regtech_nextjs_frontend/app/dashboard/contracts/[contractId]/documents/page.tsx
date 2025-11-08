"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { ChevronLeft, Plus, FileText, Trash2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Document {
  id: string
  document_name: string
  document_type: string
  file_size: number
  upload_date: string
  uploaded_by_email: string
}

export default function ContractDocumentsPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)
  const [contract, setContract] = useState<any>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const contractRes = await fetch(`/api/contracts/service/${params.contractId}`)
        if (!contractRes.ok) {
          throw new Error("Failed to fetch contract")
        }
        const contractData = await contractRes.json()
        setContract(contractData.data)

        if (contractData.data?.client_id) {
          const docsRes = await fetch(`/api/documents?clientId=${contractData.data.client_id}`)
          if (docsRes.ok) {
            const docsData = await docsRes.json()
            setDocuments(Array.isArray(docsData) ? docsData : [])
          }
        }
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        toast({
          title: "Error",
          description: "Failed to load contract or documents.",
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [params.contractId, toast])

  const handleDelete = async (docId: string) => {
    if (!confirm("Are you sure you want to delete this document?")) return

    try {
      const response = await fetch(`/api/documents/${docId}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete document")
      }

      setDocuments(documents.filter((d) => d.id !== docId))
      toast({
        title: "Success",
        description: "Document deleted successfully.",
      })
    } catch (error) {
      console.error("[v0] Error deleting document:", error)
      toast({
        title: "Error",
        description: "Failed to delete document.",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-slate-600">Loading documents...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Contract Documents</h1>
          <p className="text-slate-600 mt-1">
            {contract?.contract_type ? `Documents for ${contract.contract_type}` : "Contract documents"}
          </p>
        </div>
      </div>

      {/* Documents List */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <CardTitle>Document Catalog</CardTitle>
          <Link href="/dashboard/documents/upload">
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Upload Document
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <p className="text-slate-600">No documents found for this contract</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Document Name</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Type</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Size</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Uploaded</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Uploaded By</th>
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
                      <td className="px-4 py-3 text-sm text-slate-600">{(doc.file_size / 1024).toFixed(2)} KB</td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {new Date(doc.upload_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">{doc.uploaded_by_email || "—"}</td>
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
