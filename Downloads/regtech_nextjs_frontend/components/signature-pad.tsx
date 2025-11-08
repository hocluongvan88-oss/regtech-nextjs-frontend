"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RotateCcw, Download } from "lucide-react"

interface SignaturePadProps {
  onSave?: (signature: string) => void
  disabled?: boolean
}

export function SignaturePad({ onSave, disabled = false }: SignaturePadProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [isEmpty, setIsEmpty] = useState(true)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas size
    canvas.width = canvas.offsetWidth
    canvas.height = canvas.offsetHeight

    // Set white background
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.strokeStyle = "#000"
    ctx.lineWidth = 2
    ctx.lineCap = "round"
    ctx.lineJoin = "round"
  }, [])

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    setIsDrawing(true)
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.beginPath()
    ctx.moveTo(x, y)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || disabled) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    ctx.lineTo(x, y)
    ctx.stroke()
    setIsEmpty(false)
  }

  const stopDrawing = () => {
    setIsDrawing(false)
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setIsEmpty(true)
  }

  const saveSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    const signatureDataUrl = canvas.toDataURL("image/png")
    onSave?.(signatureDataUrl)
  }

  const downloadSignature = () => {
    const canvas = canvasRef.current
    if (!canvas || isEmpty) return

    const link = document.createElement("a")
    link.href = canvas.toDataURL("image/png")
    link.download = `signature-${new Date().getTime()}.png`
    link.click()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Digital Signature</CardTitle>
        <CardDescription>Draw your signature in the box below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border-2 border-dashed border-slate-300 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className={`w-full h-64 block ${disabled ? "cursor-not-allowed opacity-50" : "cursor-crosshair"}`}
          />
        </div>

        <p className="text-xs text-slate-500">Use your mouse to draw your signature</p>

        <div className="flex gap-3">
          <Button type="button" variant="outline" onClick={clearCanvas} disabled={isEmpty || disabled}>
            <RotateCcw className="w-4 h-4 mr-2" />
            Clear
          </Button>
          <Button type="button" variant="outline" onClick={downloadSignature} disabled={isEmpty || disabled}>
            <Download className="w-4 h-4 mr-2" />
            Download
          </Button>
          <Button
            type="button"
            onClick={saveSignature}
            disabled={isEmpty || disabled}
            className="ml-auto bg-blue-600 hover:bg-blue-700"
          >
            Save Signature
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
