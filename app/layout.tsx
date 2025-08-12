import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-inter",
  display: "swap",
})

export const metadata: Metadata = {
  title: "180Pi - ESG Climate Intelligence",
  description: "Bridge ESG data with meaningful climate action through investment simulation",
  generator: "v0.dev",
  icons: {
    icon: "/logo.svg", // Uses logo.svg from public/ as favicon
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* Fallback for browsers that don't handle metadata.icons */}
        <link rel="icon" href="/logo.svg" type="image/svg+xml" />
      </head>
      <body className={`${inter.className} antialiased`}>{children}</body>
    </html>
  )
}
