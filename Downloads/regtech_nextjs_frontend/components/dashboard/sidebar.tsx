"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useLanguageContext } from "@/lib/i18n/context"
import { ChevronDown } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"

export function Sidebar() {
  const pathname = usePathname()
  const { t } = useLanguageContext()
  const [expandedSections, setExpandedSections] = useState<string[]>([""])

  const toggleSection = (section: string) => {
    setExpandedSections((prev) => (prev.includes(section) ? prev.filter((s) => s !== section) : [...prev, section]))
  }

  const navSections = [
    {
      id: "dashboard",
      label: t("sidebar.dashboard"),
      icon: "📊",
      href: "/dashboard",
      type: "link",
    },
    {
      id: "regulatory",
      label: t("sidebar.regulatory"),
      icon: "📋",
      type: "section",
      items: [
        { href: "/dashboard/rcm", label: t("sidebar.rcm"), icon: "🔍" },
        { href: "/dashboard/rcm/mapping", label: t("sidebar.mapping"), icon: "🗺️" },
        { href: "/dashboard/compliance", label: t("sidebar.compliance"), icon: "✓" },
        { href: "/dashboard/renewals", label: t("sidebar.renewals"), icon: "🔄" },
      ],
    },
    {
      id: "facilities",
      label: t("sidebar.facilityProducts"),
      icon: "🏭",
      type: "section",
      items: [
        { href: "/dashboard/clients", label: t("sidebar.clients"), icon: "🏢" },
        { href: "/dashboard/facilities", label: t("sidebar.facilities"), icon: "🏭" },
        { href: "/dashboard/products", label: t("sidebar.products"), icon: "📦" },
        { href: "/dashboard/risk", label: t("sidebar.risk"), icon: "📊" },
      ],
    },
    {
      id: "documents",
      label: t("sidebar.documentsApprovals"),
      icon: "📄",
      type: "section",
      items: [
        { href: "/dashboard/documents", label: t("sidebar.documents"), icon: "📄" },
        { href: "/dashboard/documents/approvals", label: "Approvals", icon: "✅" },
        { href: "/dashboard/submissions", label: t("sidebar.submissions"), icon: "📋" },
      ],
    },
    {
      id: "billing",
      label: t("sidebar.serviceBilling"),
      icon: "💰",
      type: "section",
      items: [
        { href: "/dashboard/contracts", label: t("sidebar.contracts"), icon: "📑" },
        { href: "/dashboard/contracts/consent", label: t("sidebar.consent"), icon: "✋" },
        { href: "/dashboard/fees", label: t("sidebar.fees"), icon: "💵" },
        { href: "/dashboard/fees/invoices", label: t("sidebar.invoices"), icon: "🧾" },
      ],
    },
    {
      id: "analytics",
      label: t("sidebar.monitoringAnalytics"),
      icon: "📈",
      type: "section",
      items: [
        { href: "/dashboard/analytics", label: t("sidebar.analytics"), icon: "📈" },
        { href: "/dashboard/notifications", label: t("notificationCenter.title"), icon: "🔔" },
        { href: "/dashboard/audit-log", label: t("sidebar.auditLog"), icon: "📝" },
      ],
    },
    {
      id: "admin",
      label: t("sidebar.administration"),
      icon: "⚙️",
      type: "section",
      items: [
        { href: "/dashboard/coe/new", label: t("sidebar.coe"), icon: "✏️" },
        { href: "/dashboard/settings", label: t("sidebar.settings"), icon: "⚙️" },
      ],
    },
  ]

  return (
    <div className="w-full h-full bg-slate-900 text-white flex flex-col overflow-hidden">
      {/* Logo */}
      <div className="p-4 sm:p-6 border-b border-slate-700 flex-shrink-0">
        <div className="flex flex-col gap-1">
          <h1 className="text-base sm:text-lg font-bold">VEXIM GLOBAL</h1>
          <p className="text-xs text-slate-400">{t("sidebar.platform")}</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 sm:px-4 py-4 sm:py-6 space-y-1 overflow-y-auto">
        {navSections.map((section) => {
          if (section.type === "link") {
            return (
              <Link
                key={section.id}
                href={section.href}
                className={cn(
                  "flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm min-h-[44px] font-medium",
                  pathname === section.href
                    ? "bg-blue-600 text-white"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white",
                )}
              >
                <span className="text-lg flex-shrink-0">{section.icon}</span>
                <span className="hidden sm:inline">{section.label}</span>
              </Link>
            )
          }

          if (section.type === "section") {
            const isExpanded = expandedSections.includes(section.id)
            const isActive = section.items?.some((item) => pathname === item.href)

            return (
              <div key={section.id}>
                <button
                  onClick={() => toggleSection(section.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-colors text-sm font-medium min-h-[44px]",
                    isActive ? "bg-slate-800 text-white" : "text-slate-300 hover:bg-slate-800 hover:text-white",
                  )}
                >
                  <span className="text-lg flex-shrink-0">{section.icon}</span>
                  <span className="hidden sm:inline flex-1 text-left">{section.label}</span>
                  <ChevronDown
                    className={cn(
                      "w-4 h-4 hidden sm:block transition-transform flex-shrink-0",
                      isExpanded && "rotate-180",
                    )}
                  />
                </button>

                {isExpanded && (
                  <div className="mt-1 space-y-1 ml-2 pl-2 border-l border-slate-700">
                    {section.items?.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-xs sm:text-sm min-h-[40px]",
                          pathname === item.href
                            ? "bg-blue-600 text-white font-medium"
                            : "text-slate-400 hover:bg-slate-800 hover:text-slate-200",
                        )}
                      >
                        <span className="text-base flex-shrink-0">{item.icon}</span>
                        <span className="hidden sm:inline">{item.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          }
        })}
      </nav>

      {/* Footer */}
      <div className="p-3 sm:p-4 border-t border-slate-700 flex-shrink-0">
        <Button className="w-full bg-slate-700 hover:bg-slate-600 text-xs sm:text-sm font-medium min-h-[44px]">
          {t("common.logout")}
        </Button>
      </div>
    </div>
  )
}
