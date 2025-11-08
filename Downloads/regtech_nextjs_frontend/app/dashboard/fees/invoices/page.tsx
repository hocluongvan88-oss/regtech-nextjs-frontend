"use client"

import { useState, useEffect } from "react"
import { useLanguageContext } from "@/lib/i18n/context"
import { useToast } from "@/hooks/use-toast"
import { apiClient } from "@/lib/api-client"
import { InvoiceViewer } from "@/components/dashboard/fees/invoice-viewer"
import { EmptyState } from "@/components/empty-state"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ChevronLeft, AlertCircle, FileText } from "lucide-react"

export default function InvoicesPage() {
  const { t } = useLanguageContext()
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchInvoices = async () => {
      try {
        setError(null)
        const response = await apiClient("/api/fees/invoices")

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch invoices`)
        }

        const data = await response.json()
        const invoiceArray = Array.isArray(data) ? data : data?.invoices || []
        setInvoices(invoiceArray)
      } catch (error: any) {
        const errorMsg = error?.message || "Failed to load invoices"
        console.error("[v0] Error fetching invoices:", error)
        setError(errorMsg)
        toast({
          title: "Error",
          description: errorMsg,
          variant: "destructive",
        })
      } finally {
        setLoading(false)
      }
    }

    fetchInvoices()
  }, [toast])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/dashboard/fees">
          <Button variant="outline" size="sm">
            <ChevronLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("fees.invoices")}</h1>
          <p className="text-slate-600 mt-1">View and download your payment receipts</p>
        </div>
      </div>

      {/* Content */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <p className="text-slate-600">Loading invoices...</p>
        </div>
      )}

      {error && !loading && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <div>
            <h3 className="font-semibold text-red-900">Failed to load invoices</h3>
            <p className="text-sm text-red-800 mt-1">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3 bg-transparent"
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        </div>
      )}

      {!loading && !error && invoices.length === 0 && (
        <EmptyState
          icon={FileText}
          title="No invoices yet"
          description="Your invoices and payment receipts will appear here once you submit your fees"
          action={{ label: "Go to Fees", href: "/dashboard/fees" }}
        />
      )}

      {!loading && !error && invoices.length > 0 && <InvoiceViewer invoices={invoices} />}
    </div>
  )
}
