"use client"

import { useEffect, useState } from "react"
import { CheckCircle, X } from "lucide-react"

interface SaveToastProps {
  show: boolean
  message: string
  onClose: () => void
  duration?: number
}

export function SaveToast({ show, message, onClose, duration = 3000 }: SaveToastProps) {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    if (show) {
      setIsVisible(true)
      const timer = setTimeout(() => {
        setIsVisible(false)
        setTimeout(onClose, 200) // Wait for fade out animation
      }, duration)
      return () => clearTimeout(timer)
    }
  }, [show, duration, onClose])

  if (!show && !isVisible) return null

  return (
    <div className="fixed top-4 right-4 z-50">
      <div
        className={`
          glass-card px-4 py-3 rounded-lg border border-white/20 shadow-lg
          flex items-center gap-3 min-w-[280px]
          transition-all duration-200 ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"}
        `}
        role="alert"
        aria-live="polite"
      >
        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
        <span className="text-[#1a1a1a] text-sm font-medium flex-1">{message}</span>
        <button
          onClick={() => {
            setIsVisible(false)
            setTimeout(onClose, 200)
          }}
          className="text-[#4a4a4a] hover:text-[#1a1a1a] transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}
