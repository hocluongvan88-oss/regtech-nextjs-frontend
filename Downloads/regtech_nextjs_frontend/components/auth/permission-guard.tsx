"use client"

import { useAuth } from "@/lib/hooks/use-auth"
import { AccessDenied } from "./access-denied"
import type { ReactNode } from "react"

interface PermissionGuardProps {
  permission?: string
  role?: string
  anyPermissions?: string[]
  fallback?: ReactNode
  children: ReactNode
}

export function PermissionGuard({ permission, role, anyPermissions, fallback, children }: PermissionGuardProps) {
  const { hasPermission, hasRole, hasAnyPermission, loading } = useAuth()

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // Check permission
  if (permission && !hasPermission(permission)) {
    return fallback || <AccessDenied requiredPermission={permission} />
  }

  // Check role
  if (role && !hasRole(role)) {
    return fallback || <AccessDenied requiredRole={role} />
  }

  // Check any permissions
  if (anyPermissions && !hasAnyPermission(anyPermissions)) {
    return fallback || <AccessDenied message="You need one of the required permissions" />
  }

  return <>{children}</>
}
