/**
 * API Route Helpers with Built-in RLS Enforcement
 * Wraps Next.js API routes to automatically enforce tenant isolation
 */

import { type NextRequest, NextResponse } from "next/server"
import { setRLSContext, clearRLSContext, verifyRecordOwnership, logRLSViolation } from "./rls-enforcement"

/**
 * Extract client context from request
 */
export function extractClientContext(request: NextRequest) {
  const clientId = request.headers.get("x-client-id")
  const userId = request.headers.get("x-user-id")
  const roles = request.headers.get("x-user-roles")
  const isSystemAdmin = request.headers.get("x-is-system-admin") === "true"
  const isServiceManager = request.headers.get("x-is-service-manager") === "true"

  return {
    clientId: clientId || "",
    userId: userId || "",
    roles: roles ? JSON.parse(roles) : [],
    isSystemAdmin,
    isServiceManager,
  }
}

/**
 * Verify RLS authorization for accessing a specific resource
 */
export async function verifyResourceAccess(
  resourceTable: string,
  resourceId: string,
  clientId: string,
  userId: string,
  isSystemAdmin: boolean,
): Promise<{ authorized: boolean; error?: string }> {
  if (isSystemAdmin) {
    return { authorized: true }
  }

  const owns = await verifyRecordOwnership(resourceTable, resourceId, clientId)

  if (!owns) {
    await logRLSViolation({
      clientId,
      userId,
      attemptedClientId: clientId, // In reality, would extract from resource
      table: resourceTable,
      recordId: resourceId,
      action: "unauthorized_access",
    })

    return {
      authorized: false,
      error: "You do not have permission to access this resource (RLS violation)",
    }
  }

  return { authorized: true }
}

/**
 * Wrap an API handler with RLS enforcement
 * Usage: export const POST = withRLSEnforcement(myHandler)
 */
export function withRLSEnforcement(
  handler: (
    request: NextRequest,
    context: {
      clientId: string
      userId: string
      roles: string[]
      isSystemAdmin: boolean
      isServiceManager: boolean
    },
  ) => Promise<Response>,
) {
  return async (request: NextRequest) => {
    try {
      const context = extractClientContext(request)

      if (!context.clientId || !context.userId) {
        return NextResponse.json({ error: "Missing authentication context" }, { status: 401 })
      }

      await setRLSContext({
        clientId: context.clientId,
        userId: context.userId,
        isSystemAdmin: context.isSystemAdmin,
        isServiceManager: context.isServiceManager,
      })

      const response = await handler(request, context)

      await clearRLSContext()

      return response
    } catch (error) {
      console.error("[v0] RLS enforcement error:", error)
      await clearRLSContext()
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }
}

/**
 * Create a protected GET endpoint with RLS
 */
export function createRLSGetHandler(
  handler: (request: NextRequest, params: any) => Promise<any>,
  options?: {
    requiredRoles?: string[]
    requiresOCApproval?: boolean
  },
) {
  return withRLSEnforcement(async (request, context) => {
    if (options?.requiredRoles && options.requiredRoles.length > 0) {
      const hasRole = options.requiredRoles.some((role) => context.roles.includes(role))
      const isAdmin = context.isSystemAdmin || context.isServiceManager

      if (!hasRole && !isAdmin) {
        console.error("[v0] Role check failed:", {
          requiredRoles: options.requiredRoles,
          userRoles: context.roles,
          isAdmin,
        })
        return NextResponse.json(
          {
            error: "Insufficient permissions",
            details: `Required roles: ${options.requiredRoles.join(", ")}`,
          },
          { status: 403 },
        )
      }
    }

    try {
      const data = await handler(request, { context })
      return NextResponse.json(data)
    } catch (error: any) {
      console.error("[v0] Handler error:", error)
      return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
  })
}

/**
 * Create a protected POST endpoint with RLS
 */
export function createRLSPostHandler(
  handler: (request: NextRequest, body: any, params: any) => Promise<any>,
  options?: {
    requiredRoles?: string[]
    requiresAudit?: boolean
  },
) {
  return withRLSEnforcement(async (request, context) => {
    if (options?.requiredRoles) {
      const hasRole = options.requiredRoles.some((role) => context.roles.includes(role))

      if (!hasRole) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    try {
      const body = await request.json()
      const data = await handler(request, body, { context })
      return NextResponse.json(data)
    } catch (error: any) {
      console.error("[v0] Handler error:", error)
      return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
  })
}

/**
 * Create a protected PUT endpoint with RLS
 */
export function createRLSPutHandler(
  handler: (request: NextRequest, body: any, params: any) => Promise<any>,
  options?: {
    requiredRoles?: string[]
    requiresAudit?: boolean
  },
) {
  return withRLSEnforcement(async (request, context) => {
    if (options?.requiredRoles) {
      const hasRole = options.requiredRoles.some((role) => context.roles.includes(role))

      if (!hasRole) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    try {
      const body = await request.json()
      const data = await handler(request, body, { context })
      return NextResponse.json(data)
    } catch (error: any) {
      console.error("[v0] Handler error:", error)
      return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
  })
}

/**
 * Create a protected DELETE endpoint with RLS
 */
export function createRLSDeleteHandler(
  handler: (request: NextRequest, params: any) => Promise<any>,
  options?: {
    requiredRoles?: string[]
    requiresAudit?: boolean
  },
) {
  return withRLSEnforcement(async (request, context) => {
    if (options?.requiredRoles) {
      const hasRole = options.requiredRoles.some((role) => context.roles.includes(role))

      if (!hasRole) {
        return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
      }
    }

    try {
      const data = await handler(request, { context })
      return NextResponse.json(data)
    } catch (error: any) {
      console.error("[v0] Handler error:", error)
      return NextResponse.json({ error: error.message || "Internal server error" }, { status: 500 })
    }
  })
}
