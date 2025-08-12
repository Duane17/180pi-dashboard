"use client"

interface SectionHeaderProps {
  title: string
  description?: string
  className?: string
}

export function SectionHeader({ title, description, className }: SectionHeaderProps) {
  return (
    <div className={`mb-6 ${className || ""}`}>
      <h2 className="text-xl font-bold bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-text text-transparent mb-2">
        {title}
      </h2>
      {description && <p className="text-[#4a4a4a] text-sm">{description}</p>}
    </div>
  )
}
