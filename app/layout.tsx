import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "Quiz Application",
  description: "A responsive quiz application built with Next.js",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <div className="geometric-background">
            <div className="geo-shapes">
              <div className="geometric-shape"></div>
              <div className="geometric-shape triangle"></div>
              <div className="geometric-shape square"></div>
              <div className="geometric-shape"></div>
              <div className="geometric-shape hexagon"></div>
            </div>
            <main>{children}</main>
            <Toaster />
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}



import './globals.css'