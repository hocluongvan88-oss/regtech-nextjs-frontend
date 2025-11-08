"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useLanguageContext } from "@/lib/i18n/context"
import { ArrowLeft, Shield, Check, AlertCircle } from "lucide-react"

export default function TwoFactorAuthPage() {
  const [step, setStep] = useState<"intro" | "setup" | "verify" | "complete">("intro")
  const [secret, setSecret] = useState("")
  const [qrCode, setQrCode] = useState("")
  const [verificationCode, setVerificationCode] = useState("")
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const { t } = useLanguageContext()

  const handleStartSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (!response.ok) {
        throw new Error("Failed to generate 2FA secret")
      }

      const data = await response.json()
      setSecret(data.secret)
      setQrCode(data.qrCode)
      setStep("setup")
    } catch (error: any) {
      toast({
        title: t("common.error"),
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  const handleVerify = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({
        title: t("twoFactorAuth.invalidCode"),
        description: t("twoFactorAuth.enterSixDigitCodeError"),
      })
      return
    }

    setLoading(true)
    try {
      const response = await fetch("/api/auth/2fa/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          secret,
          code: verificationCode,
        }),
      })

      if (!response.ok) {
        throw new Error("Invalid verification code")
      }

      const data = await response.json()
      setBackupCodes(data.backupCodes)
      setStep("complete")

      toast({
        title: t("twoFactorAuth.twoFactorEnabled"),
        description: t("twoFactorAuth.accountProtected"),
      })
    } catch (error: any) {
      toast({
        title: t("twoFactorAuth.verificationFailed"),
        description: error.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/dashboard/settings">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            {t("common.back")}
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("twoFactorAuth.title")}</h1>
          <p className="text-slate-600 mt-1">{t("twoFactorAuth.subtitle")}</p>
        </div>
      </div>

      {/* Introduction Step */}
      {step === "intro" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("twoFactorAuth.enableTwoFactor")}</CardTitle>
            <CardDescription>{t("twoFactorAuth.addExtraLayerSecurity")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex gap-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <Shield className="w-6 h-6 text-blue-600 flex-shrink-0" />
                <div>
                  <h4 className="font-semibold text-blue-900 mb-1">{t("twoFactorAuth.whyUseTwoFactor")}</h4>
                  <p className="text-sm text-blue-800">{t("twoFactorAuth.twoFactorDescription")}</p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-slate-900">{t("twoFactorAuth.requirements")}</h4>
                <ul className="text-sm text-slate-600 space-y-2">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {t("twoFactorAuth.authenticatorApp")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {t("twoFactorAuth.backupCodesRecovery")}
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-green-600" />
                    {t("twoFactorAuth.sixDigitCode")}
                  </li>
                </ul>
              </div>
            </div>

            <Button onClick={handleStartSetup} disabled={loading} className="w-full bg-blue-600 hover:bg-blue-700">
              {loading ? t("twoFactorAuth.preparing") : t("twoFactorAuth.startTwoFactorSetup")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Setup Step */}
      {step === "setup" && (
        <Card>
          <CardHeader>
            <CardTitle>{t("twoFactorAuth.scanQRCode")}</CardTitle>
            <CardDescription>{t("twoFactorAuth.scanQRDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex justify-center p-6 bg-slate-50 rounded-lg border border-slate-200">
              {qrCode ? (
                <img
                  src={qrCode || "/placeholder.svg"}
                  alt="2FA QR Code"
                  className="w-64 h-64 border-2 border-slate-300 rounded-lg"
                />
              ) : (
                <div className="w-64 h-64 bg-slate-200 rounded-lg flex items-center justify-center">
                  <p className="text-slate-500">{t("twoFactorAuth.loadingQRCode")}</p>
                </div>
              )}
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
              <div className="text-sm text-amber-900">
                <p className="font-semibold mb-1">{t("twoFactorAuth.cannotScan")}</p>
                <p>
                  {t("twoFactorAuth.enterCodeManually")}{" "}
                  <code className="font-mono text-xs bg-white px-2 py-1 rounded">{secret}</code>
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-900 mb-2">
                {t("twoFactorAuth.enterSixDigitCode")}
              </label>
              <Input
                type="text"
                maxLength={6}
                placeholder="000000"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
                className="text-center text-2xl tracking-widest"
              />
            </div>

            <Button
              onClick={handleVerify}
              disabled={loading || verificationCode.length !== 6}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              {loading ? t("twoFactorAuth.verifying") : t("twoFactorAuth.verifyAndContinue")}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Complete Step */}
      {step === "complete" && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-600">
              <Check className="w-6 h-6" />
              {t("twoFactorAuth.twoFactorEnabled")}
            </CardTitle>
            <CardDescription>{t("twoFactorAuth.accountProtected")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-sm text-green-800">{t("twoFactorAuth.keepBackupCodesInSafePlace")}</p>
            </div>

            <div>
              <h4 className="font-semibold text-slate-900 mb-3">{t("twoFactorAuth.backupCodes")}</h4>
              <div className="grid grid-cols-2 gap-2 p-4 bg-slate-50 rounded-lg border border-slate-200">
                {backupCodes.map((code, index) => (
                  <code key={index} className="text-sm font-mono text-slate-700">
                    {code}
                  </code>
                ))}
              </div>
              <p className="text-xs text-slate-600 mt-2">{t("twoFactorAuth.eachCodeUsedOnce")}</p>
            </div>

            <div className="flex gap-3">
              <Button variant="outline" className="flex-1 bg-transparent">
                {t("twoFactorAuth.downloadCodes")}
              </Button>
              <Button onClick={() => setStep("intro")} className="flex-1 bg-blue-600 hover:bg-blue-700">
                {t("twoFactorAuth.done")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
