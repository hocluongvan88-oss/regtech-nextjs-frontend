"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Clock, AlertCircle } from "lucide-react"

interface SignatureRecord {
  id: string
  signer_name: string
  signer_email: string
  status: "signed" | "pending" | "rejected"
  signed_at?: string
  signature_method: "electronic" | "digital" | "manual"
  ip_address?: string
}

interface SignatureTimelineProps {
  signatures: SignatureRecord[]
}

export function SignatureTimeline({ signatures }: SignatureTimelineProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case "signed":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "pending":
        return <Clock className="w-5 h-5 text-yellow-600" />
      case "rejected":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      default:
        return null
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "signed":
        return "bg-green-100 text-green-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      default:
        return "bg-slate-100 text-slate-800"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Signature Timeline</CardTitle>
        <CardDescription>Document approval and signature history</CardDescription>
      </CardHeader>
      <CardContent>
        {signatures.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No signatures yet</p>
          </div>
        ) : (
          <div className="space-y-6">
            {signatures.map((sig, index) => (
              <div key={sig.id} className="flex gap-4">
                {/* Timeline line */}
                <div className="flex flex-col items-center">
                  {getStatusIcon(sig.status)}
                  {index < signatures.length - 1 && <div className="w-0.5 h-12 bg-slate-200 mt-2" />}
                </div>

                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="font-semibold text-slate-900">{sig.signer_name}</p>
                      <p className="text-sm text-slate-600">{sig.signer_email}</p>
                    </div>
                    <Badge className={getStatusColor(sig.status)}>
                      {sig.status.charAt(0).toUpperCase() + sig.status.slice(1)}
                    </Badge>
                  </div>

                  {sig.signed_at && (
                    <div className="mt-3 space-y-1 text-sm text-slate-600">
                      <p>
                        <strong>Signed:</strong> {new Date(sig.signed_at).toLocaleString()}
                      </p>
                      <p>
                        <strong>Method:</strong>{" "}
                        {sig.signature_method.charAt(0).toUpperCase() + sig.signature_method.slice(1)} Signature
                      </p>
                      {sig.ip_address && (
                        <p>
                          <strong>IP Address:</strong> {sig.ip_address}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
