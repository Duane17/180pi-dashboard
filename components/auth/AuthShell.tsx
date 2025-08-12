import type { ReactNode } from "react"

interface AuthShellProps {
  children: ReactNode
  logo?: ReactNode
}

export function AuthShell({ children, logo }: AuthShellProps) {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-5 bg-gradient-to-br from-blue-400 to-purple-600"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-5 bg-gradient-to-tr from-teal-400 to-blue-600"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        {logo && <div className="text-center mb-8">{logo}</div>}

        <div className="glass-card rounded-2xl p-8 smooth-transition-250">{children}</div>
      </div>
    </div>
  )
}
