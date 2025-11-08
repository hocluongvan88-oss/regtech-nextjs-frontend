"use client"

import { createContext, useContext, useState, useEffect, type ReactNode } from "react"
import { ROLE_PERMISSIONS } from "@/lib/constants/roles"
import { setAuthContext, clearAuthContext } from "@/lib/api-client"

interface User {
  id: string
  email: string
  name: string
  clientId: string
  roles: string[]
  isSystemAdmin: boolean
  isServiceManager: boolean
  isTenantAdmin: boolean
}

interface AuthContextType {
  user: User | null
  loading: boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  hasRole: (role: string) => boolean
  canAccessResource: (resourceClientId: string) => boolean
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCurrentUser()
  }, [])

  const fetchCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/me")
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)

        setAuthContext({
          clientId: data.user.clientId,
          userId: data.user.id,
          roles: data.user.roles,
          isSystemAdmin: data.user.isSystemAdmin,
          isServiceManager: data.user.isServiceManager,
        })
      }
    } catch (error) {
      console.error("[v0] Error fetching current user:", error)
    } finally {
      setLoading(false)
    }
  }

  const hasPermission = (permission: string): boolean => {
    if (!user) return false

    if (user.isSystemAdmin) return true

    return user.roles.some((role) => {
      const permissions = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS]
      return permissions?.includes(permission)
    })
  }

  const hasAnyPermission = (permissions: string[]): boolean => {
    return permissions.some((permission) => hasPermission(permission))
  }

  const hasRole = (role: string): boolean => {
    if (!user) return false
    return user.roles.includes(role)
  }

  const canAccessResource = (resourceClientId: string): boolean => {
    if (!user) return false

    if (user.isSystemAdmin || user.isServiceManager) return true

    return user.clientId === resourceClientId
  }

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      setUser(null)
      clearAuthContext()
      window.location.href = "/login"
    } catch (error) {
      console.error("[v0] Error logging out:", error)
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        hasPermission,
        hasAnyPermission,
        hasRole,
        canAccessResource,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export function usePermission(permission: string) {
  const { hasPermission } = useAuth()
  return hasPermission(permission)
}

export function useRole(role: string) {
  const { hasRole } = useAuth()
  return hasRole(role)
}
