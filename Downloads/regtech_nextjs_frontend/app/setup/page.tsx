"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, XCircle, Loader2, Database, AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function SetupPage() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [details, setDetails] = useState<any>(null)

  const initializeDatabase = async () => {
    setStatus("loading")
    setMessage("Initializing database...")

    try {
      const response = await fetch("/api/admin/init-db", {
        method: "POST",
      })

      const data = await response.json()

      if (data.success) {
        setStatus("success")
        setMessage("Database initialized successfully!")
        setDetails(data)
      } else {
        setStatus("error")
        setMessage(data.error || "Failed to initialize database")
      }
    } catch (error: any) {
      setStatus("error")
      setMessage(error.message || "An error occurred")
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
            <Database className="w-8 h-8 text-blue-600" />
          </div>
          <CardTitle className="text-3xl">FDA RegTech SaaS Setup</CardTitle>
          <CardDescription className="text-base mt-2">
            Initialize your database to get started with the FDA Registration System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {status === "idle" && (
            <>
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Before you begin</AlertTitle>
                <AlertDescription>
                  Make sure you have configured your MySQL database connection in your environment variables:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>MYSQL_HOST</li>
                    <li>MYSQL_USER</li>
                    <li>MYSQL_PASSWORD</li>
                    <li>MYSQL_DATABASE</li>
                  </ul>
                </AlertDescription>
              </Alert>

              <div className="bg-slate-50 rounded-lg p-4 space-y-2">
                <h3 className="font-semibold text-sm">What will be created:</h3>
                <ul className="text-sm space-y-1 text-slate-600">
                  <li>✓ 14 database tables for complete FDA compliance tracking</li>
                  <li>✓ Multi-tenant architecture with row-level security</li>
                  <li>✓ Default system roles (Admin, Compliance Officer, Submitter, Viewer)</li>
                  <li>✓ Audit logging and FDA API integration tables</li>
                </ul>
              </div>

              <Button onClick={initializeDatabase} className="w-full" size="lg">
                Initialize Database
              </Button>
            </>
          )}

          {status === "loading" && (
            <div className="text-center py-8">
              <Loader2 className="w-12 h-12 animate-spin mx-auto text-blue-600 mb-4" />
              <p className="text-lg font-medium">{message}</p>
              <p className="text-sm text-slate-500 mt-2">This may take a few moments...</p>
            </div>
          )}

          {status === "success" && (
            <div className="text-center py-8 space-y-4">
              <CheckCircle2 className="w-16 h-16 mx-auto text-green-600" />
              <div>
                <h3 className="text-xl font-semibold text-green-600 mb-2">{message}</h3>
                {details && (
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Database: {details.database}</p>
                    <p>Tables created: {details.tablesCreated}</p>
                  </div>
                )}
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-left">
                <h4 className="font-semibold text-green-800 mb-2">Next Steps:</h4>
                <ol className="list-decimal list-inside space-y-2 text-sm text-green-700">
                  <li>Go to the registration page to create your first account</li>
                  <li>You'll be assigned as an admin user automatically</li>
                  <li>Start adding facilities and products</li>
                  <li>Configure FDA API credentials in settings</li>
                </ol>
              </div>

              <div className="flex gap-3">
                <Button onClick={() => (window.location.href = "/register")} className="flex-1" size="lg">
                  Go to Registration
                </Button>
                <Button onClick={() => (window.location.href = "/")} variant="outline" className="flex-1" size="lg">
                  Go to Home
                </Button>
              </div>
            </div>
          )}

          {status === "error" && (
            <div className="text-center py-8 space-y-4">
              <XCircle className="w-16 h-16 mx-auto text-red-600" />
              <div>
                <h3 className="text-xl font-semibold text-red-600 mb-2">Setup Failed</h3>
                <p className="text-sm text-slate-600">{message}</p>
              </div>

              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Common Issues</AlertTitle>
                <AlertDescription className="text-sm space-y-2">
                  <p>1. Check your database credentials in .env.local</p>
                  <p>2. Ensure MySQL server is running</p>
                  <p>3. Verify the database user has CREATE TABLE permissions</p>
                  <p>4. Check the console for detailed error messages</p>
                </AlertDescription>
              </Alert>

              <Button onClick={initializeDatabase} variant="outline" className="w-full bg-transparent">
                Try Again
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
