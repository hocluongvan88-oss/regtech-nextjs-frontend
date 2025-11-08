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
import { Shield, ArrowRight, Mail, Lock } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { t } = useLanguageContext()
  const { toast } = useToast()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      if (!email || !password) {
        throw new Error(t("login.requiredFields") || "Email and password are required")
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        throw new Error(t("login.invalidEmail") || "Please enter a valid email")
      }

      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || t("login.loginFailed"))
      }

      toast({
        title: t("login.success") || "Login successful",
        description: t("login.redirecting") || "Redirecting to dashboard...",
      })

      router.push("/dashboard")
    } catch (err: any) {
      const errorMsg = err.message
      setError(errorMsg)
      toast({
        title: t("login.error") || "Login failed",
        description: errorMsg,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex flex-col">
      {/* Header */}
      <div className="fixed top-0 left-0 right-0 p-3 sm:p-4 md:p-6 lg:p-8 flex items-center justify-between z-10 bg-white/50 backdrop-blur-sm md:bg-transparent md:backdrop-blur-none">
        <Link href="/" className="flex items-center gap-2 font-bold text-slate-900 text-sm sm:text-base">
          <div className="w-7 sm:w-8 h-7 sm:h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <Shield className="w-4 sm:w-5 h-4 sm:h-5 text-white" />
          </div>
          <span className="hidden sm:inline">VEXIM GLOBAL</span>
        </Link>
        <LanguageSwitcher />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 pt-20 sm:pt-24 md:pt-8">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 pb-6 sm:pb-8">
              <div className="flex justify-center mb-3 sm:mb-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-center">{t("login.title")}</CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">{t("login.subtitle")}</CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6">
              <form onSubmit={handleLogin} className="space-y-3 sm:space-y-4">
                {/* Error Message */}
                {error && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700 flex items-start gap-2 sm:gap-3">
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <span>{error}</span>
                  </div>
                )}

                {/* Email Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <label className="block text-xs sm:text-sm font-medium text-slate-900">{t("login.email")}</label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                    <Input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm"
                      placeholder={t("login.emailPlaceholder")}
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-1.5 sm:space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs sm:text-sm font-medium text-slate-900">{t("login.password")}</label>
                    <Link
                      href="/forgot-password"
                      className="text-xs sm:text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Forgot?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                    <Input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm"
                      placeholder={t("login.passwordPlaceholder")}
                      required
                    />
                  </div>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-white font-medium text-sm"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="inline-block animate-spin mr-2">↻</span>
                      {t("login.signingIn")}
                    </>
                  ) : (
                    <>
                      {t("login.signIn")}
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              </form>

              {/* Divider */}
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200"></div>
                </div>
                <div className="relative flex justify-center text-xs">
                  <span className="px-2 bg-white text-slate-500">or</span>
                </div>
              </div>

              {/* Register Link */}
              <div className="text-center space-y-2 sm:space-y-3">
                <p className="text-xs sm:text-sm text-slate-600">
                  {t("login.noAccount")}
                  <span> </span>
                </p>
                <Link href="/register" className="block">
                  <Button variant="outline" className="w-full h-9 sm:h-10 bg-transparent text-sm">
                    {t("login.register")}
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer Help */}
          <div className="text-center text-xs text-slate-500">
            <p>
              Need help?{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Contact support
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
