import type { ReactNode } from "react"

interface AuthFooterNoteProps {
  children: ReactNode
}

export function AuthFooterNote({ children }: AuthFooterNoteProps) {
  return <p className="text-center text-sm text-gray-500 mt-6">{children}</p>
}
