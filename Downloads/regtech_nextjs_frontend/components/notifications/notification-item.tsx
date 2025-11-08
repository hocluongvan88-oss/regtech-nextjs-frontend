"use client"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"

export type NotificationType = "alert" | "success" | "info" | "warning"

interface NotificationItemProps {
  id: string
  type: NotificationType
  title: string
  description: string
  timestamp: string
  isRead: boolean
  actionLabel?: string
  onRead?: (id: string) => void
  onDelete?: (id: string) => void
  onAction?: () => void
}

export function NotificationItem({
  id,
  type,
  title,
  description,
  timestamp,
  isRead,
  actionLabel,
  onRead,
  onDelete,
  onAction,
}: NotificationItemProps) {
  const getIcon = (t: NotificationType) => {
    switch (t) {
      case "alert":
        return <AlertCircle className="w-5 h-5 text-red-600" />
      case "success":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-yellow-600" />
      default:
        return <Info className="w-5 h-5 text-blue-600" />
    }
  }

  const getBackgroundColor = (t: NotificationType) => {
    switch (t) {
      case "alert":
        return isRead ? "bg-slate-50" : "bg-red-50"
      case "success":
        return isRead ? "bg-slate-50" : "bg-green-50"
      case "warning":
        return isRead ? "bg-slate-50" : "bg-yellow-50"
      default:
        return isRead ? "bg-slate-50" : "bg-blue-50"
    }
  }

  const getBorderColor = (t: NotificationType) => {
    switch (t) {
      case "alert":
        return "border-red-200"
      case "success":
        return "border-green-200"
      case "warning":
        return "border-yellow-200"
      default:
        return "border-blue-200"
    }
  }

  return (
    <div
      className={`p-4 border rounded-lg transition-all hover:shadow-md ${getBackgroundColor(type)} ${getBorderColor(type)} ${
        !isRead ? "border-l-4" : ""
      }`}
    >
      <div className="flex gap-3">
        {/* Icon */}
        <div className="flex-shrink-0 pt-1">{getIcon(type)}</div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className={`font-semibold text-sm ${!isRead ? "font-bold" : ""} text-slate-900`}>{title}</h4>
              <p className="text-sm text-slate-600 mt-1">{description}</p>
            </div>
            {!isRead && <div className="w-2 h-2 rounded-full bg-blue-600 flex-shrink-0 mt-1" />}
          </div>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-slate-500">{new Date(timestamp).toLocaleString()}</span>

            <div className="flex gap-1">
              {!isRead && (
                <Button variant="ghost" size="sm" onClick={() => onRead?.(id)} className="text-xs h-7">
                  Mark as read
                </Button>
              )}
              {actionLabel && (
                <Button
                  variant="default"
                  size="sm"
                  onClick={onAction}
                  className="text-xs h-7 bg-blue-600 hover:bg-blue-700"
                >
                  {actionLabel}
                </Button>
              )}
              <Button variant="ghost" size="sm" onClick={() => onDelete?.(id)} className="text-xs h-7 text-slate-600">
                <X className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
