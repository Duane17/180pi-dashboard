"use client"

export function SkipNavigation() {
  return (
    <a
      href="#main-content"
      className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-[100] px-4 py-2 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-[#3270a1]"
    >
      Skip to main content
    </a>
  )
}
