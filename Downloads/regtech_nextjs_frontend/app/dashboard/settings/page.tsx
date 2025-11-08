"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { useLanguageContext } from "@/lib/i18n/context"
import { Shield } from "lucide-react"

export default function SettingsPage() {
  const [currentTab, setCurrentTab] = useState("profile")
  const [saveStatus, setSaveStatus] = useState("")
  const { toast } = useToast()
  const { t } = useLanguageContext()

  const handleSave = () => {
    setSaveStatus(t("settings.settingsSaved"))
    toast({
      title: t("settings.settingsSaved"),
      description: t("settings.settingsUpdated"),
    })
    setTimeout(() => setSaveStatus(""), 3000)
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900">{t("settings.title")}</h1>
        <p className="text-slate-600 mt-1">{t("settings.subtitle")}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-slate-200">
        {[
          { id: "profile", label: t("settings.profile"), icon: "👤" },
          { id: "security", label: t("settings.security"), icon: "🔐" },
          { id: "notifications", label: t("settings.notifications"), icon: "🔔" },
          { id: "integrations", label: t("settings.integrations"), icon: "🔗" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCurrentTab(tab.id)}
            className={`px-4 py-3 font-medium transition-colors ${
              currentTab === tab.id ? "text-blue-600 border-b-2 border-blue-600" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Profile Settings */}
      {currentTab === "profile" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.profileInformation")}</CardTitle>
              <CardDescription>{t("settings.updatePersonalInfo")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t("settings.firstName")}</label>
                  <input
                    type="text"
                    placeholder={t("settings.firstNamePlaceholder")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{t("settings.lastName")}</label>
                  <input
                    type="text"
                    placeholder={t("settings.lastNamePlaceholder")}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("settings.email")}</label>
                <input
                  type="email"
                  placeholder={t("settings.emailPlaceholder")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("settings.role")}</label>
                <select className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Official Correspondent</option>
                  <option>U.S. Agent</option>
                  <option>Compliance Specialist</option>
                  <option>Executive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">{t("settings.organization")}</label>
                <input
                  type="text"
                  placeholder={t("settings.organizationPlaceholder")}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <Button onClick={handleSave} className="bg-blue-600">
                {t("settings.saveChanges")}
              </Button>
              {saveStatus && <p className="text-sm text-green-600">{saveStatus}</p>}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Security Settings */}
      {currentTab === "security" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.securitySettings")}</CardTitle>
              <CardDescription>{t("settings.manageAccountSecurity")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="font-semibold text-slate-900 mb-3">{t("settings.changePassword")}</h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t("settings.currentPassword")}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">{t("settings.newPassword")}</label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      {t("settings.confirmPassword")}
                    </label>
                    <input
                      type="password"
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              <hr />

              <div>
                <h3 className="font-semibold text-slate-900 mb-3">{t("settings.twoFactorAuth")}</h3>
                <p className="text-sm text-slate-600 mb-3">{t("settings.addExtraLayerSecurity")}</p>
                <Link href="/dashboard/settings/2fa">
                  <Button variant="outline">
                    <Shield className="w-4 h-4 mr-2" />
                    {t("twoFactorAuth.setupTwoFactor")}
                  </Button>
                </Link>
              </div>

              <Button onClick={handleSave} className="bg-blue-600">
                {t("settings.updateSecurity")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Notification Settings */}
      {currentTab === "notifications" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.notificationPreferences")}</CardTitle>
              <CardDescription>{t("settings.controlNotifications")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                {[
                  {
                    label: t("settings.complianceAlerts"),
                    desc: t("settings.criticalComplianceIssues"),
                  },
                  {
                    label: t("settings.deadlineReminders"),
                    desc: t("settings.renewalDeadlines"),
                  },
                  {
                    label: t("settings.submissionUpdates"),
                    desc: t("settings.fdaSubmissionStatus"),
                  },
                  {
                    label: t("settings.documentChanges"),
                    desc: t("settings.technicalFileModifications"),
                  },
                  {
                    label: t("settings.systemUpdates"),
                    desc: t("settings.platformUpdates"),
                  },
                ].map((notif) => (
                  <div key={notif.label} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{notif.label}</p>
                      <p className="text-xs text-slate-600">{notif.desc}</p>
                    </div>
                    <input type="checkbox" defaultChecked className="w-4 h-4" />
                  </div>
                ))}
              </div>

              <Button onClick={handleSave} className="bg-blue-600">
                {t("settings.savePreferences")}
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Integrations */}
      {currentTab === "integrations" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{t("settings.systemIntegrations")}</CardTitle>
              <CardDescription>{t("settings.manageConnectedServices")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {[
                { name: "FDA API", status: "connected", icon: "🏛️" },
                { name: "Email Service", status: "connected", icon: "📧" },
                { name: "Backup Service", status: "connected", icon: "💾" },
              ].map((integration) => (
                <div key={integration.name} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{integration.icon}</span>
                    <div>
                      <p className="font-medium text-slate-900">{integration.name}</p>
                      <p
                        className={`text-xs ${integration.status === "connected" ? "text-green-600" : "text-slate-600"}`}
                      >
                        {integration.status === "connected"
                          ? `✓ ${t("settings.connected")}`
                          : t("settings.notConfigured")}
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    {t("settings.configure")}
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
