"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Shield,
  CheckCircle2,
  TrendingUp,
  Users,
  FileCheck,
  BarChart3,
  Zap,
  Lock,
  Globe,
  Clock,
  ArrowRight,
  Star,
  Building2,
} from "lucide-react"
import { useLanguageContext } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"

export default function Home() {
  const { t } = useLanguageContext()

  return (
    <main className="min-h-screen bg-white">
      {/* Navigation Bar */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-900">VEXIM GLOBAL</span>
            </div>
            <div className="hidden lg:flex items-center gap-6">
              <a href="#features" className="text-sm text-slate-600 hover:text-slate-900 transition">
                Features
              </a>
              <a href="#solutions" className="text-sm text-slate-600 hover:text-slate-900 transition">
                Solutions
              </a>
              <a href="#pricing" className="text-sm text-slate-600 hover:text-slate-900 transition">
                Pricing
              </a>
              <a href="#customers" className="text-sm text-slate-600 hover:text-slate-900 transition">
                Customers
              </a>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <Link href="/login">
              <Button variant="ghost" size="sm">
                {t("home.login")}
              </Button>
            </Link>
            <Link href="/register">
              <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section - Inspired by Vercel */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 border border-blue-200">
              <Star className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-900 font-medium">Trusted by 500+ pharmaceutical companies</span>
            </div>

            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-slate-900 leading-tight tracking-tight">
              The complete platform for{" "}
              <span className="bg-gradient-to-r from-blue-600 to-blue-400 bg-clip-text text-transparent">
                FDA compliance
              </span>
            </h1>

            <p className="text-xl text-slate-600 leading-relaxed max-w-3xl mx-auto">
              Streamline regulatory submissions, facility registrations, and compliance tracking. Built for
              pharmaceutical manufacturers and medical device companies requiring FDA oversight.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <Link href="/register">
                <Button
                  size="lg"
                  className="bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-xl transition-all text-lg px-8"
                >
                  Start Free Trial
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/dashboard">
                <Button
                  size="lg"
                  variant="outline"
                  className="shadow-lg hover:shadow-xl transition-all text-lg px-8 bg-transparent"
                >
                  View Demo
                </Button>
              </Link>
            </div>

            <p className="text-sm text-slate-500">No credit card required • 30-day free trial • Setup in minutes</p>
          </div>

          <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-5xl mx-auto">
            {[
              { value: "500+", label: "Organizations", sublabel: "Active clients" },
              { value: "98%", label: "Compliance Rate", sublabel: "First-time approval" },
              { value: "60%", label: "Time Saved", sublabel: "On submissions" },
              { value: "24/7", label: "Support", sublabel: "Enterprise SLA" },
            ].map((stat, idx) => (
              <div key={idx} className="text-center">
                <div className="text-4xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-medium text-slate-900">{stat.label}</div>
                <div className="text-xs text-slate-500">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-slate-500 mb-8 uppercase tracking-wider">
            Trusted by industry leaders
          </p>
          <div className="flex flex-wrap items-center justify-center gap-12 opacity-50">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="flex items-center gap-2">
                <Building2 className="w-6 h-6 text-slate-400" />
                <span className="text-lg font-semibold text-slate-600">Company {i + 1}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-4">
              Everything you need for regulatory excellence
            </h2>
            <p className="text-lg text-slate-600">Comprehensive FDA compliance management in one unified platform</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: FileCheck,
                title: "Facility Management",
                description: "Register and manage FDA facilities with automated FEI tracking and renewal alerts",
                color: "blue",
              },
              {
                icon: Shield,
                title: "Product Registration",
                description: "Track product listings, NDCs, and maintain complete registration histories",
                color: "green",
              },
              {
                icon: TrendingUp,
                title: "Submission Tracking",
                description: "Monitor 510(k), PMA, and other FDA submissions with real-time status updates",
                color: "purple",
              },
              {
                icon: Lock,
                title: "Document Control",
                description: "Secure document management with version control and e-signature workflows",
                color: "orange",
              },
              {
                icon: BarChart3,
                title: "Compliance Analytics",
                description: "Real-time dashboards and reporting for regulatory compliance metrics",
                color: "red",
              },
              {
                icon: Users,
                title: "Multi-Tenant Architecture",
                description: "Separate workspaces for clients with role-based access control",
                color: "indigo",
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                className="group p-8 bg-white rounded-2xl border border-slate-200 hover:border-blue-300 hover:shadow-xl transition-all duration-300"
              >
                <div
                  className={`w-12 h-12 rounded-xl bg-${feature.color}-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                >
                  <feature.icon className={`w-6 h-6 text-${feature.color}-600`} />
                </div>
                <h3 className="text-xl font-semibold text-slate-900 mb-2">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="solutions" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-sm font-medium mb-4">
                <Zap className="w-4 h-4" />
                Faster compliance
              </div>
              <h2 className="text-4xl font-bold text-slate-900 mb-6">Accelerate your regulatory submissions</h2>
              <p className="text-lg text-slate-600 mb-8">
                Our platform reduces submission preparation time by 60% through automated document generation,
                intelligent form filling, and built-in FDA requirement checklists.
              </p>
              <ul className="space-y-4">
                {[
                  "Automated 510(k) and PMA submission packages",
                  "Pre-filled forms with regulatory database sync",
                  "Real-time validation against FDA requirements",
                  "Collaborative review workflows with audit trails",
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                    <span className="text-slate-700">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-gradient-to-br from-blue-600 to-blue-400 rounded-3xl p-12 shadow-2xl">
              <div className="bg-white rounded-2xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <span className="text-sm font-medium text-slate-600">Submission Success Rate</span>
                  <span className="text-sm font-bold text-green-600">+150%</span>
                </div>
                <div className="h-48 flex items-end gap-2">
                  {[40, 55, 65, 80, 95].map((height, i) => (
                    <div
                      key={i}
                      className="flex-1 bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-lg"
                      style={{ height: `${height}%` }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="customers" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Trusted by regulatory professionals worldwide</h2>
            <p className="text-lg text-slate-600">See what our customers have to say</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote:
                  "VEXIM reduced our 510(k) submission time from 6 months to 2 months. The automated workflows are a game-changer.",
                author: "Sarah Chen",
                role: "VP Regulatory Affairs",
                company: "MedTech Innovations",
              },
              {
                quote:
                  "The compliance dashboard gives us real-time visibility across all our facilities. No more spreadsheet chaos.",
                author: "Michael Rodriguez",
                role: "Compliance Director",
                company: "Global Pharma Corp",
              },
              {
                quote:
                  "Best investment we made. The platform paid for itself within the first quarter through time savings alone.",
                author: "Emily Thompson",
                role: "Quality Manager",
                company: "BioHealth Systems",
              },
            ].map((testimonial, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl border border-slate-200 shadow-lg">
                <div className="flex gap-1 mb-4">
                  {[...Array(5)].map((_, j) => (
                    <Star key={j} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-slate-700 mb-6 leading-relaxed">"{testimonial.quote}"</p>
                <div>
                  <div className="font-semibold text-slate-900">{testimonial.author}</div>
                  <div className="text-sm text-slate-600">{testimonial.role}</div>
                  <div className="text-sm text-slate-500">{testimonial.company}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-900 mb-4">Choose the right plan for your organization</h2>
            <p className="text-lg text-slate-600">All plans include 30-day free trial</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {[
              {
                name: "Starter",
                price: "$499",
                period: "/month",
                description: "For small organizations starting with FDA compliance",
                features: [
                  "Up to 5 users",
                  "5 facility registrations",
                  "Basic submission tracking",
                  "Email support",
                  "Core compliance features",
                ],
                cta: "Start Free Trial",
                popular: false,
              },
              {
                name: "Professional",
                price: "$1,499",
                period: "/month",
                description: "For growing companies with multiple products",
                features: [
                  "Up to 25 users",
                  "Unlimited facilities",
                  "Advanced analytics",
                  "Priority support",
                  "API access",
                  "Custom workflows",
                ],
                cta: "Start Free Trial",
                popular: true,
              },
              {
                name: "Enterprise",
                price: "Custom",
                period: "",
                description: "For large organizations with complex needs",
                features: [
                  "Unlimited users",
                  "Dedicated account manager",
                  "Custom integrations",
                  "24/7 phone support",
                  "SLA guarantee",
                  "On-premise option",
                ],
                cta: "Contact Sales",
                popular: false,
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative bg-white rounded-2xl p-8 ${plan.popular ? "border-2 border-blue-600 shadow-2xl scale-105" : "border border-slate-200"}`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="mb-6">
                  <h3 className="text-2xl font-bold text-slate-900 mb-2">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mb-2">
                    <span className="text-4xl font-bold text-slate-900">{plan.price}</span>
                    <span className="text-slate-600">{plan.period}</span>
                  </div>
                  <p className="text-slate-600">{plan.description}</p>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-slate-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button
                  className={`w-full ${plan.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-900 hover:bg-slate-800"}`}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">Ready to transform your FDA compliance?</h2>
          <p className="text-xl text-blue-100 mb-8">
            Join 500+ organizations already streamlining their regulatory operations
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50 shadow-xl text-lg px-8">
                Start Free Trial
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-white text-white hover:bg-white/10 text-lg px-8 bg-transparent"
              >
                Schedule Demo
              </Button>
            </Link>
          </div>
          <p className="text-sm text-blue-200 mt-6">No credit card required • Setup in minutes • Cancel anytime</p>
        </div>
      </section>

      <footer className="bg-slate-900 text-slate-400 py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            <div className="col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="font-bold text-xl text-white">VEXIM GLOBAL</span>
              </div>
              <p className="text-sm mb-4">Enterprise-grade FDA compliance and regulatory management platform</p>
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  <span>SOC 2 Certified</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="w-4 h-4" />
                  <span>HIPAA Compliant</span>
                </div>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#features" className="hover:text-white transition">
                    Features
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-white transition">
                    Pricing
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    API
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Security
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    About
                  </a>
                </li>
                <li>
                  <a href="#customers" className="hover:text-white transition">
                    Customers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Careers
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Contact
                  </a>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a href="#" className="hover:text-white transition">
                    Documentation
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Help Center
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="#" className="hover:text-white transition">
                    Terms of Service
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm">© 2025 VEXIM GLOBAL. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <LanguageSwitcher />
              <div className="flex items-center gap-2 text-sm">
                <Globe className="w-4 h-4" />
                <span>Global Support</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Clock className="w-4 h-4" />
                <span>24/7 Uptime</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </main>
  )
}
