/**
 * Security headers and middleware for TLS/HTTPS enforcement
 * Complies with FDA data protection requirements
 */

/**
 * Generate security headers for all responses
 */
export function getSecurityHeaders(): Record<string, string> {
  return {
    // Enforce HTTPS
    "Strict-Transport-Security": "max-age=31536000; includeSubDomains; preload",

    // Prevent MIME type sniffing
    "X-Content-Type-Options": "nosniff",

    // Enable XSS protection
    "X-XSS-Protection": "1; mode=block",

    // Clickjacking protection
    "X-Frame-Options": "DENY",

    // Referrer policy
    "Referrer-Policy": "strict-origin-when-cross-origin",

    "Content-Security-Policy":
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com; connect-src 'self' https://vitals.vercel-insights.com; style-src 'self' 'unsafe-inline'",

    // Permissions policy
    "Permissions-Policy": "geolocation=(), microphone=(), camera=()",
  }
}

/**
 * Check if request is over HTTPS (in production)
 */
export function isSecureConnection(request: Request): boolean {
  const protocol = request.headers.get("x-forwarded-proto") || (typeof window === "undefined" ? "https" : "https")

  // Allow HTTP only in development
  const isDevelopment = process.env.NODE_ENV === "development"

  return isDevelopment || protocol === "https"
}

/**
 * Enforce HTTPS middleware
 */
export function enforceHTTPS(request: Request): Response | null {
  if (!isSecureConnection(request) && process.env.NODE_ENV === "production") {
    const url = new URL(request.url)
    url.protocol = "https:"
    return new Response("", { status: 301, headers: { Location: url.toString() } })
  }
  return null
}
