"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Download, FileText } from "lucide-react"

interface Invoice {
  id: string
  invoiceNumber: string
  invoiceDate: string
  amount: number
  status: "paid" | "pending"
  downloadUrl: string
}

interface InvoiceViewerProps {
  invoices: Invoice[]
}

export function InvoiceViewer({ invoices }: InvoiceViewerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="w-5 h-5" />
          Invoices & Receipts
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Invoice #</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Date</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Amount</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-900">Status</th>
                <th className="text-center py-3 px-4 font-semibold text-slate-900">Action</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((invoice) => (
                <tr key={invoice.id} className="border-b hover:bg-slate-50">
                  <td className="py-3 px-4 font-medium text-slate-900">{invoice.invoiceNumber}</td>
                  <td className="py-3 px-4 text-slate-600">{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td className="py-3 px-4 font-medium text-slate-900">${invoice.amount}</td>
                  <td className="py-3 px-4">
                    <Badge
                      className={
                        invoice.status === "paid" ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"
                      }
                    >
                      {invoice.status}
                    </Badge>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <Button variant="ghost" size="sm">
                      <Download className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
