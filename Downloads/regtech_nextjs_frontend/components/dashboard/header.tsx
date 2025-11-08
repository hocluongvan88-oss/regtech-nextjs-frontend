"use client"

import { Button } from "@/components/ui/button"
import { Bell, User, LogOut, Menu, X } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import { useLanguageContext } from "@/lib/i18n/context"
import { LanguageSwitcher } from "@/components/language-switcher"
import { SearchCommand } from "@/components/search-command"

interface Notification {
  id: string
  title: string
  description: string
  type: string
  created_at: string
  is_read: boolean
}

interface HeaderProps {
  onMenuToggle?: () => void
  sidebarOpen?: boolean
}

export function Header({ onMenuToggle, sidebarOpen }: HeaderProps) {
  const router = useRouter()
  const { t } = useLanguageContext()
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    fetchNotifications()
  }, [])

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/notifications")
      if (response.ok) {
        const data = await response.json()
        setNotifications(data.notifications || [])
        setUnreadCount(data.unreadCount || 0)
      }
    } catch (error) {
      console.error("Failed to fetch notifications:", error)
    }
  }

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/api/auth/logout", {
        method: "POST",
      })

      if (response.ok) {
        router.push("/login")
      } else {
        console.error("Logout failed")
        setIsLoggingOut(false)
      }
    } catch (error) {
      console.error("Logout error:", error)
      setIsLoggingOut(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/notifications/${notificationId}/read`, {
        method: "POST",
      })
      fetchNotifications()
    } catch (error) {
      console.error("Failed to mark notification as read:", error)
    }
  }

  return (
    <header className="bg-white border-b border-slate-200 px-3 sm:px-4 md:px-6 lg:px-8 py-3 md:py-4 flex items-center justify-between gap-2 sm:gap-4">
      {/* Left: Menu button (mobile) + Search */}
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <Button variant="ghost" size="icon" className="md:hidden flex-shrink-0" onClick={onMenuToggle}>
          {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </Button>

        <div className="hidden sm:flex flex-1 max-w-md relative">
          <SearchCommand />
        </div>
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4 flex-shrink-0">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
              {unreadCount > 0 && (
                <Badge
                  variant="destructive"
                  className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
                >
                  {unreadCount > 9 ? "9+" : unreadCount}
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80">
            <DropdownMenuLabel>{t("header.notifications")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {notifications.length === 0 ? (
              <div className="p-4 text-center text-sm text-slate-500">{t("header.noNotifications")}</div>
            ) : (
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <DropdownMenuItem
                    key={notification.id}
                    className="flex flex-col items-start p-3 cursor-pointer"
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start justify-between w-full">
                      <div className="flex-1">
                        <p
                          className={`text-sm font-medium ${
                            !notification.is_read ? "text-slate-900" : "text-slate-600"
                          }`}
                        >
                          {notification.title}
                        </p>
                        <p className="text-xs text-slate-500 mt-1">{notification.description}</p>
                        <p className="text-xs text-slate-400 mt-1">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      {!notification.is_read && <div className="w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1"></div>}
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            )}
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Language Switcher */}
        <div className="hidden sm:block">
          <LanguageSwitcher />
        </div>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="w-4 sm:w-5 h-4 sm:h-5 text-slate-600" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t("header.myAccount")}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
              {t("common.settings")}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => router.push("/dashboard/settings?tab=profile")}>
              {t("common.profile")}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Logout Button - Icon only on mobile, text on desktop */}
        <Button variant="ghost" size="sm" onClick={handleLogout} disabled={isLoggingOut} className="hidden sm:flex">
          <LogOut className="w-4 h-4 mr-2" />
          {isLoggingOut ? t("common.loading") : t("common.logout")}
        </Button>

        {/* Logout Icon - Mobile only */}
        <Button variant="ghost" size="icon" onClick={handleLogout} disabled={isLoggingOut} className="sm:hidden">
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </header>
  )
}
