"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { AlertCircle, CheckCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function NewCOEPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [step, setStep] = useState("validate")
  const [loading, setLoading] = useState(false)
  const [facilities, setFacilities] = useState<any[]>([])
  const [products, setProducts] = useState<any[]>([])
  const [validation, setValidation] = useState<any>(null)
  const [form, setForm] = useState({
    facilityId: "",
    productIds: [] as string[],
    exportingCountry: "US",
    recipientCountry: "",
    certificationStatement: "",
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [facilitiesRes, productsRes] = await Promise.all([fetch("/api/facilities"), fetch("/api/products")])

        const facilitiesData = await facilitiesRes.json()
        const productsData = await productsRes.json()

        setFacilities(facilitiesData || [])
        setProducts(productsData || [])
      } catch (error) {
        console.error("[v0] Error fetching data:", error)
        toast({
          title: "Error loading data",
          description: "Failed to load facilities and products",
        })
      }
    }

    fetchData()
  }, [toast])

  const handleValidate = async () => {
    if (!form.facilityId || form.productIds.length === 0) {
      toast({
        title: "Missing selection",
        description: "Please select facility and products",
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/coe/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          facilityId: form.facilityId,
          productId: form.productIds[0],
          clientId: "current-client-id",
        }),
      })

      const data = await response.json()
      setValidation(data)

      if (data.valid) {
        setStep("fill")
        toast({
          title: "Validation passed",
          description: "Ready to complete COE information",
        })
      } else if (data.errors.length > 0) {
        toast({
          title: "Validation failed",
          description: data.errors[0] || "Please check requirements",
        })
      }
    } catch (error) {
      console.error("[v0] Validation error:", error)
      toast({
        title: "Validation error",
        description: "Failed to validate requirements",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!form.recipientCountry || !form.certificationStatement) {
      toast({
        title: "Missing information",
        description: "Please complete all required fields",
      })
      return
    }

    setLoading(true)
    try {
      const createRes = await fetch("/api/coe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId: "current-client-id",
          facilityId: form.facilityId,
          productIds: form.productIds,
          exportingCountry: form.exportingCountry,
          certificationStatement: form.certificationStatement,
        }),
      })

      if (!createRes.ok) throw new Error("Failed to create COE")

      const coeData = await createRes.json()

      const submitRes = await fetch(`/api/coe/${coeData.id}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          exportingCountry: form.exportingCountry,
          recipientCountry: form.recipientCountry,
          certificationDate: new Date().toISOString().split("T")[0],
          submittedBy: "current-user-id",
        }),
      })

      if (submitRes.ok) {
        const result = await submitRes.json()
        toast({
          title: "COE submitted",
          description: "Certificate of Export submitted successfully",
        })
        router.push(`/dashboard/coe/${result.submissionId}`)
      }
    } catch (error) {
      console.error("[v0] Submit error:", error)
      toast({
        title: "Submission failed",
        description: "Failed to submit COE",
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleProduct = (productId: string) => {
    setForm((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }))
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Certificate of Export (COE)</h1>
        <p className="text-slate-600 mt-1">
          Step {step === "validate" ? 1 : 2}: {step === "validate" ? "Validate Requirements" : "Complete Form"}
        </p>
      </div>

      {/* Validation Step */}
      {step === "validate" && (
        <Card>
          <CardHeader>
            <CardTitle>COE Pre-Validation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-900">
                COE can only be issued for registered facilities with listed products that are not under recall.
              </p>
            </div>

            {/* Facility Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Select Facility *</label>
              <select
                value={form.facilityId}
                onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="">Choose a facility...</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.facility_name} - {f.registration_status}
                  </option>
                ))}
              </select>
            </div>

            {/* Product Selection */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Select Products *</label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-slate-300 rounded-md p-3">
                {products.map((p) => (
                  <label key={p.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.productIds.includes(p.id)}
                      onChange={() => toggleProduct(p.id)}
                      className="rounded"
                    />
                    <span className="text-sm text-slate-900">{p.product_name}</span>
                  </label>
                ))}
              </div>
            </div>

            {validation && (
              <div className="space-y-3">
                {validation.errors.length > 0 && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                      <h4 className="font-semibold text-red-900">Validation Errors:</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-red-800">
                      {validation.errors.map((error: string, i: number) => (
                        <li key={i}>{error}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.warnings.length > 0 && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                    <div className="flex gap-2 mb-2">
                      <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0" />
                      <h4 className="font-semibold text-yellow-900">Warnings:</h4>
                    </div>
                    <ul className="list-disc list-inside space-y-1 text-sm text-yellow-800">
                      {validation.warnings.map((warning: string, i: number) => (
                        <li key={i}>{warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {validation.readyForSubmission && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <p className="text-sm text-green-800">All requirements met. Ready to proceed.</p>
                  </div>
                )}
              </div>
            )}

            <div className="flex gap-3 justify-end pt-6 border-t">
              <Link href="/dashboard/coe">
                <Button variant="outline">Cancel</Button>
              </Link>
              <Button onClick={handleValidate} disabled={loading}>
                {loading ? "Validating..." : "Validate & Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Step */}
      {step === "fill" && (
        <Card>
          <CardHeader>
            <CardTitle>Complete COE Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-900">
                Facility and product information will be auto-filled from your registration data.
              </p>
            </div>

            {/* Exporting Country */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Exporting Country</label>
              <select
                value={form.exportingCountry}
                onChange={(e) => setForm({ ...form, exportingCountry: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              >
                <option value="US">United States</option>
                <option value="OTHER">Other Country</option>
              </select>
            </div>

            {/* Recipient Country */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Recipient Country *</label>
              <Input
                type="text"
                value={form.recipientCountry}
                onChange={(e) => setForm({ ...form, recipientCountry: e.target.value })}
                placeholder="Country receiving the product"
                required
              />
            </div>

            {/* Certification Statement */}
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">Certification Statement *</label>
              <textarea
                value={form.certificationStatement}
                onChange={(e) => setForm({ ...form, certificationStatement: e.target.value })}
                placeholder="Official certification statement per FDA regulations"
                rows={5}
                className="w-full px-3 py-2 border border-slate-300 rounded-md"
              />
            </div>

            <div className="flex gap-3 justify-end pt-6 border-t">
              <Button variant="outline" onClick={() => setStep("validate")}>
                Back
              </Button>
              <Button onClick={handleSubmit} disabled={loading}>
                {loading ? "Submitting..." : "Submit COE"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
