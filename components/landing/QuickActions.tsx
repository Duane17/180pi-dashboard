import Link from "next/link"
import type { LucideIcon } from "lucide-react"

interface QuickAction {
  label: string
  icon?: LucideIcon
  href: string
}

interface QuickActionsProps {
  items: QuickAction[]
}

export function QuickActions({ items }: QuickActionsProps) {
  return (
    <section className="mb-12">
      <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">Quick Actions</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => {
          const Icon = item.icon

          return (
            <Link
              key={index}
              href={item.href}
              className="group rounded-2xl bg-gradient-to-br from-white/15 via-white/10 to-white/5 backdrop-blur-sm border border-white/20 p-6 transition-all duration-200 hover:shadow-lg hover:border-[#3270a1]/30 focus:outline-none focus:ring-2 focus:ring-[#3270a1] focus:ring-offset-2"
            >
              <div className="flex items-center space-x-3">
                {Icon && (
                  <div className="flex-shrink-0">
                    <Icon className="w-6 h-6 text-[#3270a1] group-hover:text-[#7e509c] transition-colors duration-200" />
                  </div>
                )}
                <div className="font-medium text-[#1a1a1a] group-hover:text-[#3270a1] transition-colors duration-200">
                  {item.label}
                </div>
              </div>
            </Link>
          )
        })}
      </div>
    </section>
  )
}
