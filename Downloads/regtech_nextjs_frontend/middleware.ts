import { type NextRequest, NextResponse } from "next/server"
import { verifyTokenEdge } from "@/lib/edge-auth"
import { getSecurityHeaders, enforceHTTPS } from "@/lib/security-headers"

const protectedRoutes = [
  "/dashboard",
  "/api/clients",
  "/api/facilities",
  "/api/products",
  "/api/submissions",
  "/api/admin",
]
const publicRoutes = ["/", "/login", "/register"]

const systemAdminRoutes = ["/api/admin/system", "/dashboard/admin"]

export async function middleware(request: NextRequest) {
  const httpsCheck = enforceHTTPS(request)
  if (httpsCheck) return httpsCheck

  const pathname = request.nextUrl.pathname
  const token = request.cookies.get("auth-token")?.value

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route))
  const isSystemAdminRoute = systemAdminRoutes.some((route) => pathname.startsWith(route))

  if ((isProtected || isSystemAdminRoute) && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  if (token) {
    const payload = await verifyTokenEdge(token)

    if (payload) {
      if (isSystemAdminRoute) {
        const isSystemAdmin = payload.roles?.includes("system_administrator")
        const isServiceManager = payload.roles?.includes("service_manager")

        if (!isSystemAdmin && !isServiceManager) {
          return NextResponse.redirect(new URL("/dashboard", request.url))
        }
      }

      const requestHeaders = new Headers(request.headers)
      requestHeaders.set("x-user-id", (payload.userId as string) || "")
      requestHeaders.set("x-client-id", (payload.clientId as string) || "")
      requestHeaders.set("x-user-roles", JSON.stringify(payload.roles || []))
      requestHeaders.set(
        "x-is-system-admin",
        (payload.roles?.includes("system_administrator") ? "true" : "false") || "false",
      )
      requestHeaders.set(
        "x-is-service-manager",
        (payload.roles?.includes("service_manager") ? "true" : "false") || "false",
      )

      const response = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      })

      const securityHeaders = getSecurityHeaders()
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value)
      })

      return response
    }

    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
}
