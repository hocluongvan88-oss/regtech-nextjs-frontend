import type React from "react"
import type { Metadata } from "next"
import { Geist, Geist_Mono } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"
import { LanguageProvider } from "@/lib/i18n/context"
import { AuthProvider } from "@/lib/hooks/use-auth"
import "./globals.css"
import { APP_METADATA } from "@/lib/constants/branding"
import { Toaster } from "@/components/ui/sonner"

const geistSans = Geist({ subsets: ["latin"] })
const geistMono = Geist_Mono({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: APP_METADATA.title,
  description: APP_METADATA.description,
  keywords: APP_METADATA.keywords.join(", "),
  creator: APP_METADATA.author,
  generator: "v0.app",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.className} font-sans antialiased`}>
        <AuthProvider>
          <LanguageProvider>{children}</LanguageProvider>
        </AuthProvider>
        <Toaster />
        <Analytics />
      </body>
    </html>
  )
}
