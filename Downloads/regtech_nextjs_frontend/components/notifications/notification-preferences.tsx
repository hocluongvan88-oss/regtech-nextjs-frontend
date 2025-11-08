"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"

interface NotificationPreferencesProps {
  onSave?: () => void
}

export function NotificationPreferences({ onSave }: NotificationPreferencesProps) {
  const [preferences, setPreferences] = useState({
    emailNotifications: true,
    pushNotifications: true,
    inAppNotifications: true,
    renewalAlerts: true,
    complianceAlerts: true,
    systemAlerts: false,
    serviceUpdates: true,
    frequency: "immediate",
    email: "user@example.com",
  })

  const handleSave = async () => {
    try {
      await fetch("/api/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(preferences),
      })
      onSave?.()
    } catch (error) {
      console.error("[v0] Error saving preferences:", error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Notification Preferences</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Channel Selection */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Notification Channels</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="email"
                checked={preferences.emailNotifications}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    emailNotifications: e.target.checked,
                  })
                }
              />
              <Label htmlFor="email" className="font-normal">
                Email Notifications
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="push"
                checked={preferences.pushNotifications}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    pushNotifications: e.target.checked,
                  })
                }
              />
              <Label htmlFor="push" className="font-normal">
                Push Notifications
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="inapp"
                checked={preferences.inAppNotifications}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    inAppNotifications: e.target.checked,
                  })
                }
              />
              <Label htmlFor="inapp" className="font-normal">
                In-App Notifications
              </Label>
            </div>
          </div>
        </div>

        {/* Notification Types */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Notification Types</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="renewal"
                checked={preferences.renewalAlerts}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    renewalAlerts: e.target.checked,
                  })
                }
              />
              <Label htmlFor="renewal" className="font-normal">
                Renewal Alerts
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="compliance"
                checked={preferences.complianceAlerts}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    complianceAlerts: e.target.checked,
                  })
                }
              />
              <Label htmlFor="compliance" className="font-normal">
                Compliance Alerts
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="system"
                checked={preferences.systemAlerts}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    systemAlerts: e.target.checked,
                  })
                }
              />
              <Label htmlFor="system" className="font-normal">
                System Alerts
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="service"
                checked={preferences.serviceUpdates}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    serviceUpdates: e.target.checked,
                  })
                }
              />
              <Label htmlFor="service" className="font-normal">
                Service Updates
              </Label>
            </div>
          </div>
        </div>

        {/* Frequency */}
        <div className="space-y-3">
          <h3 className="font-semibold text-slate-900">Notification Frequency</h3>
          <RadioGroup
            value={preferences.frequency}
            onValueChange={(value) => setPreferences({ ...preferences, frequency: value })}
          >
            <div className="flex items-center gap-2">
              <RadioGroupItem value="immediate" id="immediate" />
              <Label htmlFor="immediate" className="font-normal cursor-pointer">
                Immediate
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="daily" id="daily" />
              <Label htmlFor="daily" className="font-normal cursor-pointer">
                Daily Digest
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <RadioGroupItem value="weekly" id="weekly" />
              <Label htmlFor="weekly" className="font-normal cursor-pointer">
                Weekly Summary
              </Label>
            </div>
          </RadioGroup>
        </div>

        {/* Email Address */}
        <div className="space-y-2">
          <Label htmlFor="email-addr" className="font-semibold">
            Primary Email Address
          </Label>
          <Input
            id="email-addr"
            type="email"
            value={preferences.email}
            onChange={(e) => setPreferences({ ...preferences, email: e.target.value })}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Preferences
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
