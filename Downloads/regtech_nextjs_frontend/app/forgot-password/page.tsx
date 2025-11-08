"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguageContext } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Shield, ArrowLeft, Mail } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguageContext()
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (!email) {
        throw new Error(t("forgotPassword.emailRequired") || "Email is required")
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(t("forgotPassword.invalidEmail") || "Please enter a valid email")
      }

      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("forgotPassword.failed") || "Failed to send reset email")
      }

      setSubmitted(true)
      toast({
        title: t("forgotPassword.success") || "Email sent",
        description: t("forgotPassword.checkEmail") || "Check your email for password reset instructions",
      })
    } catch (err: any) {
      toast({
        title: t("forgotPassword.error") || "Error",
        description: err.message,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      <div className="fixed top-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-between z-10 bg-white/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
          <div className="w-7 sm:w-8 h-7 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
          </div>
          <span className="hidden sm:inline">VEXIM GLOBAL</span>
        </Link>
        <LanguageSwitcher />
      </div>

      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 md:pt-8">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 pb-6 sm:pb-8">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Mail className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-center">
                {t("forgotPassword.title") || "Reset Password"}
              </CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                {t("forgotPassword.subtitle") || "Enter your email to receive password reset instructions"}
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6">
              {submitted ? (
                <div className="space-y-4 text-center">
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-sm text-green-800">
                      {t("forgotPassword.checkInbox") || "Check your email for reset instructions"}
                    </p>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600">
                    {t("forgotPassword.noEmail") || "Didn't receive an email?"}
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)} className="w-full text-sm">
                    {t("forgotPassword.tryAgain") || "Try another email"}
                  </Button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="block text-xs sm:text-sm font-medium text-slate-900">
                      {t("forgotPassword.email") || "Email address"}
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                      <Input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm"
                        placeholder={t("forgotPassword.emailPlaceholder") || "your@email.com"}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="inline-block animate-spin mr-2">↻</span>
                        {t("forgotPassword.sending") || "Sending..."}
                      </>
                    ) : (
                      t("forgotPassword.sendReset") || "Send Reset Link"
                    )}
                  </Button>
                </form>
              )}

              <div className="pt-4 border-t border-slate-200">
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  <ArrowLeft className="w-4 h-4" />
                  {t("forgotPassword.backToLogin") || "Back to login"}
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
