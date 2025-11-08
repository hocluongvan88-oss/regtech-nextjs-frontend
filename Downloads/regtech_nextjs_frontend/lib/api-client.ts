/**
 * API Client with automatic RLS header injection
 * All API calls should use this instead of raw fetch
 */

interface FetchOptions extends RequestInit {
  skipAuth?: boolean
}

export async function apiClient(url: string, options: FetchOptions = {}) {
  const { skipAuth, ...fetchOptions } = options

  // Get auth context from localStorage (set by useAuth)
  const authContext = !skipAuth ? getAuthContext() : null

  const headers = new Headers(fetchOptions.headers)

  // Add RLS headers if authenticated
  if (authContext) {
    headers.set("x-client-id", authContext.clientId)
    headers.set("x-user-id", authContext.userId)
    headers.set("x-user-roles", JSON.stringify(authContext.roles))
    headers.set("x-is-system-admin", authContext.isSystemAdmin.toString())
    headers.set("x-is-service-manager", authContext.isServiceManager.toString())
  }

  // Add content-type if not set
  if (!headers.has("Content-Type") && fetchOptions.body) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(url, {
    ...fetchOptions,
    headers,
  })

  return response
}

function getAuthContext() {
  if (typeof window === "undefined") return null

  try {
    const stored = localStorage.getItem("auth_context")
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

export function setAuthContext(context: {
  clientId: string
  userId: string
  roles: string[]
  isSystemAdmin: boolean
  isServiceManager: boolean
}) {
  if (typeof window === "undefined") return
  localStorage.setItem("auth_context", JSON.stringify(context))
}

export function clearAuthContext() {
  if (typeof window === "undefined") return
  localStorage.removeItem("auth_context")
}
