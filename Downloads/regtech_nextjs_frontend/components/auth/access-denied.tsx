import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"

interface AccessDeniedProps {
  requiredPermission?: string
  requiredRole?: string
  message?: string
}

export function AccessDenied({ requiredPermission, requiredRole, message }: AccessDeniedProps) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <ShieldAlert className="w-6 h-6 text-red-600" />
          </div>
          <CardTitle className="text-2xl">Access Denied</CardTitle>
          <CardDescription>{message || "You don't have permission to access this resource"}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {requiredPermission && (
            <div className="bg-slate-50 p-3 rounded-lg text-sm">
              <p className="text-slate-600">Required Permission:</p>
              <p className="font-mono text-slate-900">{requiredPermission}</p>
            </div>
          )}

          {requiredRole && (
            <div className="bg-slate-50 p-3 rounded-lg text-sm">
              <p className="text-slate-600">Required Role:</p>
              <p className="font-mono text-slate-900">{requiredRole}</p>
            </div>
          )}

          <div className="flex flex-col gap-2 pt-4">
            <Link href="/dashboard">
              <Button className="w-full" variant="default">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Return to Dashboard
              </Button>
            </Link>

            <Link href="/dashboard/support">
              <Button className="w-full bg-transparent" variant="outline">
                <Mail className="w-4 h-4 mr-2" />
                Contact Administrator
              </Button>
            </Link>
          </div>

          <p className="text-xs text-center text-slate-500 pt-4">
            If you believe this is an error, please contact your system administrator
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
