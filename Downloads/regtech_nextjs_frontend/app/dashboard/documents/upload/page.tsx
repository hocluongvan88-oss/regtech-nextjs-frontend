"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Upload, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useLanguageContext } from "@/lib/i18n/context"

export default function DocumentUploadPage() {
  const router = useRouter()
  const { t } = useLanguageContext()
  const [uploading, setUploading] = useState(false)
  const [formData, setFormData] = useState({
    documentName: "",
    documentType: "tech_file",
    clientId: "",
    submissionId: "",
    facilityId: "",
    file: null as File | null,
    notes: "",
  })

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({ ...formData, file: e.target.files[0] })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.file || !formData.documentName) {
      alert(t("documents.uploadError", "Please fill in all required fields"))
      return
    }

    setUploading(true)

    try {
      // In a real implementation, you would upload the file to storage first
      // For now, we'll simulate with a file path
      const filePath = `/uploads/${Date.now()}_${formData.file.name}`

      const response = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          documentName: formData.documentName,
          documentType: formData.documentType,
          clientId: formData.clientId || null,
          submissionId: formData.submissionId || null,
          facilityId: formData.facilityId || null,
          filePath: filePath,
          fileSize: formData.file.size,
          fileMimeType: formData.file.type,
          uploadedBy: "current-user-id", // Replace with actual user ID from auth
          isRequired: false,
        }),
      })

      if (response.ok) {
        const result = await response.json()
        alert(t("documents.uploadSuccess", "Document uploaded successfully!"))
        router.push(`/dashboard/documents/${result.id}`)
      } else {
        throw new Error("Upload failed")
      }
    } catch (error) {
      console.error("[v0] Error uploading document:", error)
      alert(t("documents.uploadError", "Failed to upload document"))
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 p-4 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
            {t("documents.uploadDocument", "Upload Document")}
          </h1>
          <p className="text-slate-600 mt-1">
            {t("documents.uploadDescription", "Upload a new document to the system")}
          </p>
        </div>
        <Link href="/dashboard/documents">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back", "Back")}
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t("documents.documentDetails", "Document Details")}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Document Name */}
            <div className="space-y-2">
              <Label htmlFor="documentName">
                {t("documents.documentName", "Document Name")} <span className="text-red-500">*</span>
              </Label>
              <Input
                id="documentName"
                placeholder={t("documents.documentNamePlaceholder", "Enter document name")}
                value={formData.documentName}
                onChange={(e) => setFormData({ ...formData, documentName: e.target.value })}
                required
              />
            </div>

            {/* Document Type */}
            <div className="space-y-2">
              <Label htmlFor="documentType">
                {t("documents.documentType", "Document Type")} <span className="text-red-500">*</span>
              </Label>
              <Select
                value={formData.documentType}
                onValueChange={(value) => setFormData({ ...formData, documentType: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tech_file">{t("documents.types.techFile", "Technical File")}</SelectItem>
                  <SelectItem value="sop">{t("documents.types.sop", "SOP")}</SelectItem>
                  <SelectItem value="label">{t("documents.types.label", "Label")}</SelectItem>
                  <SelectItem value="coe">{t("documents.types.coe", "Certificate of Export")}</SelectItem>
                  <SelectItem value="other">{t("documents.types.other", "Other")}</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Optional IDs */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clientId">
                  {t("documents.clientId", "Client ID")} ({t("common.optional", "Optional")})
                </Label>
                <Input
                  id="clientId"
                  placeholder="123"
                  value={formData.clientId}
                  onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="submissionId">
                  {t("documents.submissionId", "Submission ID")} ({t("common.optional", "Optional")})
                </Label>
                <Input
                  id="submissionId"
                  placeholder="456"
                  value={formData.submissionId}
                  onChange={(e) => setFormData({ ...formData, submissionId: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="facilityId">
                  {t("documents.facilityId", "Facility ID")} ({t("common.optional", "Optional")})
                </Label>
                <Input
                  id="facilityId"
                  placeholder="789"
                  value={formData.facilityId}
                  onChange={(e) => setFormData({ ...formData, facilityId: e.target.value })}
                />
              </div>
            </div>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="file">
                {t("documents.selectFile", "Select File")} <span className="text-red-500">*</span>
              </Label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-slate-400 transition-colors">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-3" />
                <Input id="file" type="file" onChange={handleFileChange} className="max-w-xs mx-auto" required />
                {formData.file && (
                  <p className="text-sm text-slate-600 mt-2">
                    {t("documents.selectedFile", "Selected")}: {formData.file.name} (
                    {(formData.file.size / 1024).toFixed(2)} KB)
                  </p>
                )}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">
                {t("documents.notes", "Notes")} ({t("common.optional", "Optional")})
              </Label>
              <Textarea
                id="notes"
                placeholder={t("documents.notesPlaceholder", "Add any additional notes about this document")}
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={uploading} className="flex-1">
                <Upload className="w-4 h-4 mr-2" />
                {uploading
                  ? t("documents.uploading", "Uploading...")
                  : t("documents.uploadDocument", "Upload Document")}
              </Button>
              <Link href="/dashboard/documents" className="flex-1">
                <Button type="button" variant="outline" className="w-full bg-transparent">
                  {t("common.cancel", "Cancel")}
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
