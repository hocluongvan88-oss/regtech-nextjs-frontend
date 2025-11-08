"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useLanguageContext } from "@/lib/i18n/context"
import { NotificationItem } from "@/components/notifications/notification-item"
import { NotificationPreferences } from "@/components/notifications/notification-preferences"
import { Bell, Settings } from "lucide-react"

interface Notification {
  id: string
  type: "alert" | "success" | "info" | "warning"
  title: string
  description: string
  timestamp: string
  isRead: boolean
  actionLabel?: string
}

export default function NotificationsPage() {
  const { t } = useLanguageContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [showPreferences, setShowPreferences] = useState(false)

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/notifications")
        const data = await response.json()
        setNotifications(data.notifications || [])
      } catch (error) {
        console.error("[v0] Error fetching notifications:", error)
        setNotifications([])
      } finally {
        setLoading(false)
      }
    }

    fetchNotifications()
  }, [])

  const handleMarkAsRead = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}/read`, { method: "POST" })
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)))
    } catch (error) {
      console.error("[v0] Error marking as read:", error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await fetch(`/api/notifications/${id}`, { method: "DELETE" })
      setNotifications((prev) => prev.filter((n) => n.id !== id))
    } catch (error) {
      console.error("[v0] Error deleting notification:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await fetch("/api/notifications/mark-all-read", { method: "POST" })
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })))
    } catch (error) {
      console.error("[v0] Error marking all as read:", error)
    }
  }

  const handleDeleteAll = async () => {
    try {
      await fetch("/api/notifications", { method: "DELETE" })
      setNotifications([])
    } catch (error) {
      console.error("[v0] Error deleting all:", error)
    }
  }

  const unreadCount = notifications.filter((n) => !n.isRead).length
  const alertCount = notifications.filter((n) => n.type === "alert").length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{t("notifications.notificationCenter.title")}</h1>
          <p className="text-slate-600 mt-1">{t("notifications.notificationCenter.subtitle")}</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("notifications.notificationCenter.total")}</p>
                <p className="text-2xl font-bold text-slate-900 mt-1">{notifications.length}</p>
              </div>
              <Bell className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("notifications.notificationCenter.unread")}</p>
                <p className="text-2xl font-bold text-orange-600 mt-1">{unreadCount}</p>
              </div>
              <Bell className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">{t("notifications.notificationCenter.alerts")}</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{alertCount}</p>
              </div>
              <Bell className="w-8 h-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="notifications" className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="notifications">{t("notifications.notificationCenter.title")}</TabsTrigger>
          <TabsTrigger value="preferences" onClick={() => setShowPreferences(true)}>
            <Settings className="w-4 h-4 mr-2" />
            {t("notifications.notificationCenter.preferences")}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-4">
          {/* Action Buttons */}
          <div className="flex gap-2">
            {unreadCount > 0 && (
              <Button variant="outline" size="sm" onClick={handleMarkAllAsRead}>
                {t("notifications.notificationCenter.markAllAsRead")}
              </Button>
            )}
            {notifications.length > 0 && (
              <Button variant="outline" size="sm" onClick={handleDeleteAll}>
                {t("notifications.notificationCenter.deleteAll")}
              </Button>
            )}
          </div>

          {/* Notifications List */}
          {loading ? (
            <Card>
              <CardContent className="text-center py-12 text-slate-600">
                {t("notifications.notificationCenter.loadingNotifications")}
              </CardContent>
            </Card>
          ) : notifications.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <p className="text-slate-600">{t("notifications.notificationCenter.noNotifications")}</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  {...notification}
                  onRead={handleMarkAsRead}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="preferences">
          <NotificationPreferences onSave={() => alert("Preferences saved!")} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
