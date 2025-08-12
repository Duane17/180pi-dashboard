import type { ReactNode } from "react"

interface LandingShellProps {
  children: ReactNode
}

export function LandingShell({ children }: LandingShellProps) {
  return (
    <div className="min-h-screen bg-white">
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">{children}</main>
    </div>
  )
}
