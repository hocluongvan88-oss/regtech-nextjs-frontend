"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { useLanguageContext } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { Shield, ArrowRight, Building2, User, Mail, Lock, CheckCircle2, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { RegisterSchema, type RegisterInput } from "@/lib/validation/schemas"

export default function RegisterPage() {
  const [step, setStep] = useState(1)
  const router = useRouter()
  const { t } = useLanguageContext()
  const { toast } = useToast()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterInput>({
    resolver: zodResolver(RegisterSchema),
  })

  const password = watch("password")

  const onSubmit = async (data: RegisterInput) => {
    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organization_name: data.organization_name,
          email: data.email,
          first_name: data.first_name,
          last_name: data.last_name,
          password: data.password,
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Registration failed")
      }

      toast({
        title: t("register.success") || "Account created",
        description: t("register.successDesc") || "Redirecting to dashboard...",
      })

      router.push("/dashboard")
    } catch (err: any) {
      toast({
        title: t("register.error") || "Registration failed",
        description: err.message,
      })
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
      <div className="flex-1 flex items-center justify-center p-3 sm:p-4 md:p-6 lg:p-8 pt-20 sm:pt-24 md:pt-8">
        <div className="w-full max-w-md space-y-4 sm:space-y-6">
          {/* Card */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-2 pb-4 sm:pb-6 md:pb-8">
              <div className="flex justify-center mb-2 sm:mb-3 md:mb-4">
                <div className="w-10 sm:w-12 h-10 sm:h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-5 sm:w-6 h-5 sm:h-6 text-blue-600" />
                </div>
              </div>
              <CardTitle className="text-xl sm:text-2xl text-center">Create Your Account</CardTitle>
              <CardDescription className="text-center text-xs sm:text-sm">
                Register your organization and start managing compliance
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4 sm:space-y-6">
              {/* Progress Indicator */}
              <div className="flex items-center justify-between px-1 sm:px-2 gap-1 sm:gap-2">
                <div className={`flex flex-col items-center gap-1 ${step >= 1 ? "text-blue-600" : "text-slate-400"}`}>
                  <div
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm ${
                      step >= 1 ? "bg-blue-600 text-white" : "bg-slate-200"
                    }`}
                  >
                    {step > 1 ? <CheckCircle2 className="w-4 h-4" /> : "1"}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">Org</span>
                </div>
                <div className={`flex-1 h-0.5 sm:h-1 mx-1 rounded ${step >= 2 ? "bg-blue-600" : "bg-slate-200"}`}></div>
                <div className={`flex flex-col items-center gap-1 ${step >= 2 ? "text-blue-600" : "text-slate-400"}`}>
                  <div
                    className={`w-7 sm:w-8 h-7 sm:h-8 rounded-full flex items-center justify-center flex-shrink-0 text-xs sm:text-sm ${
                      step >= 2 ? "bg-blue-600 text-white" : "bg-slate-200"
                    }`}
                  >
                    {step > 2 ? <CheckCircle2 className="w-4 h-4" /> : "2"}
                  </div>
                  <span className="text-xs font-medium hidden sm:inline">Account</span>
                </div>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
                {/* Error Message */}
                {errors.root && (
                  <div className="p-3 sm:p-4 bg-red-50 border border-red-200 rounded-lg text-xs sm:text-sm text-red-700 flex items-start gap-2 sm:gap-3">
                    <span className="text-lg flex-shrink-0">⚠️</span>
                    <span>{errors.root.message}</span>
                  </div>
                )}

                {/* Step 1: Organization Details */}
                {step === 1 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-900">Organization Name</label>
                      <div className="relative">
                        <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                        <Input
                          {...register("organization_name")}
                          type="text"
                          className={`pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm ${errors.organization_name ? "border-red-500" : ""}`}
                          placeholder="Your organization name"
                        />
                      </div>
                      {errors.organization_name && (
                        <div className="flex items-center gap-2 text-red-600 text-xs">
                          <AlertCircle className="w-3 h-3" />
                          {errors.organization_name.message}
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-slate-900">First Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                          <Input
                            {...register("first_name")}
                            type="text"
                            className={`pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm ${errors.first_name ? "border-red-500" : ""}`}
                            placeholder="First"
                          />
                        </div>
                        {errors.first_name && (
                          <p className="text-red-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.first_name.message}
                          </p>
                        )}
                      </div>

                      <div className="space-y-1.5 sm:space-y-2">
                        <label className="block text-xs sm:text-sm font-medium text-slate-900">Last Name</label>
                        <div className="relative">
                          <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                          <Input
                            {...register("last_name")}
                            type="text"
                            className={`pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm ${errors.last_name ? "border-red-500" : ""}`}
                            placeholder="Last"
                          />
                        </div>
                        {errors.last_name && (
                          <p className="text-red-600 text-xs flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            {errors.last_name.message}
                          </p>
                        )}
                      </div>
                    </div>

                    <Button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-sm"
                    >
                      Continue
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                )}

                {/* Step 2: Account Details */}
                {step === 2 && (
                  <div className="space-y-3 sm:space-y-4">
                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-900">Email Address</label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                        <Input
                          {...register("email")}
                          type="email"
                          className={`pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm ${errors.email ? "border-red-500" : ""}`}
                          placeholder="you@company.com"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-red-600 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.email.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-900">Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                        <Input
                          {...register("password")}
                          type="password"
                          className={`pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm ${errors.password ? "border-red-500" : ""}`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.password ? (
                        <p className="text-red-600 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.password.message}
                        </p>
                      ) : (
                        <p className="text-xs text-slate-500">Must be at least 8 characters</p>
                      )}
                    </div>

                    <div className="space-y-1.5 sm:space-y-2">
                      <label className="block text-xs sm:text-sm font-medium text-slate-900">Confirm Password</label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-slate-400" />
                        <Input
                          {...register("confirmPassword")}
                          type="password"
                          className={`pl-9 sm:pl-10 h-9 sm:h-10 border-slate-200 text-sm ${errors.confirmPassword ? "border-red-500" : ""}`}
                          placeholder="••••••••"
                        />
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-600 text-xs flex items-center gap-1">
                          <AlertCircle className="w-3 h-3" />
                          {errors.confirmPassword.message}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-1 sm:pt-2">
                      <Button
                        type="button"
                        onClick={() => setStep(1)}
                        variant="outline"
                        className="flex-1 h-9 sm:h-10 text-sm"
                      >
                        Back
                      </Button>
                      <Button
                        type="submit"
                        className="flex-1 h-9 sm:h-10 bg-blue-600 hover:bg-blue-700 text-sm"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <span className="inline-block animate-spin mr-2">↻</span>
                            Creating...
                          </>
                        ) : (
                          <>
                            Create Account
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </form>

              {/* Sign In Link */}
              <div className="text-center text-xs sm:text-sm">
                <span className="text-slate-600">
                  Already have an account?
                  <span> </span>
                </span>
                <Link href="/login" className="font-medium text-blue-600 hover:text-blue-700">
                  Sign in
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Footer Help */}
          <div className="text-center text-xs text-slate-500">
            <p>
              By creating an account, you agree to our{" "}
              <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                Terms of Service
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
