"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, CheckCircle } from "lucide-react"

interface PinPcnValidatorProps {
  feeId: string
  onValidate?: (pin: string, pcn: string) => Promise<boolean>
}

export function PinPcnValidator({ feeId, onValidate }: PinPcnValidatorProps) {
  const [pin, setPin] = useState("")
  const [pcn, setPcn] = useState("")
  const [validationResult, setValidationResult] = useState<"success" | "error" | null>(null)
  const [isValidating, setIsValidating] = useState(false)

  const handleValidate = async () => {
    if (!pin || !pcn) {
      setValidationResult("error")
      return
    }

    setIsValidating(true)
    try {
      const success = (await onValidate?.(pin, pcn)) || false
      setValidationResult(success ? "success" : "error")
    } catch (error) {
      setValidationResult("error")
    } finally {
      setIsValidating(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">PIN/PCN Validation</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="pin">Payment Identification Number (PIN)</Label>
          <Input
            id="pin"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="pcn">Payment Confirmation Number (PCN)</Label>
          <Input
            id="pcn"
            placeholder="Enter PCN"
            value={pcn}
            onChange={(e) => setPcn(e.target.value)}
            className="mt-1"
          />
        </div>

        {validationResult === "success" && (
          <div className="p-3 bg-green-100 border border-green-300 rounded flex items-center gap-2 text-green-800">
            <CheckCircle className="w-4 h-4" />
            <span className="text-sm">Payment verified successfully</span>
          </div>
        )}

        {validationResult === "error" && (
          <div className="p-3 bg-red-100 border border-red-300 rounded flex items-center gap-2 text-red-800">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">Invalid PIN/PCN combination</span>
          </div>
        )}

        <Button onClick={handleValidate} disabled={isValidating} className="w-full bg-blue-600 hover:bg-blue-700">
          {isValidating ? "Validating..." : "Validate Payment"}
        </Button>
      </CardContent>
    </Card>
  )
}
