"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface FeePaymentStatusProps {
  id: string
  feeType: "mdufa" | "pdufa"
  facilityName: string
  amount: number
  paymentStatus: "paid" | "pending" | "overdue"
  dueDate: string
  pinValidated: boolean
  fiscalYear: number
}

export function FeePaymentStatus({
  id,
  feeType,
  facilityName,
  amount,
  paymentStatus,
  dueDate,
  pinValidated,
  fiscalYear,
}: FeePaymentStatusProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "overdue":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="font-semibold text-slate-900">{feeType === "mdufa" ? "MDUFA" : "PDUFA"}</h3>
              <Badge className={getStatusColor(paymentStatus)}>{paymentStatus}</Badge>
            </div>

            <p className="text-sm text-slate-600 mb-3">{facilityName}</p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-slate-600">Amount</p>
                <p className="font-medium text-slate-900">${amount}</p>
              </div>
              <div>
                <p className="text-slate-600">Due Date</p>
                <p className="font-medium text-slate-900">{new Date(dueDate).toLocaleDateString()}</p>
              </div>
              <div>
                <p className="text-slate-600">PIN/PCN</p>
                <p className="font-medium text-slate-900">{pinValidated ? "Validated" : "Pending"}</p>
              </div>
              <div>
                <p className="text-slate-600">Year</p>
                <p className="font-medium text-slate-900">{fiscalYear}</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
