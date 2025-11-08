"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { Button, type ButtonProps } from "@/components/ui/button"
import type { ReactNode } from "react"

interface PermissionButtonProps extends ButtonProps {
  permission: string
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionButton({ permission, fallback = null, children, ...props }: PermissionButtonProps) {
  const { hasPermission } = useAuth()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <Button {...props}>{children}</Button>
}
