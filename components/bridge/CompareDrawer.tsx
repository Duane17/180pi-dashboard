"use client"
import { useState, useEffect } from "react"
import { X, ChevronUp, ChevronDown, MapPin, DollarSign, Building2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MatchScoreBadge } from "./MatchScoreBadge"
import { cn } from "@/lib/utils"

interface Investor {
  id: string
  name: string
  logoUrl?: string
  aum?: number
  stages: string[]
  ticket?: { min?: number; max?: number }
  geos: string[]
  themes: string[]
  blurb?: string
}

interface CompareDrawerProps {
  open: boolean
  items: Investor[]
  onClose: () => void
  matchScores?: Record<string, number>
  onRemoveItem?: (id: string) => void
  className?: string
}

export function CompareDrawer({ open, items, onClose, matchScores, onRemoveItem, className }: CompareDrawerProps) {
  const [isMinimized, setIsMinimized] = useState(false)

  // Focus management
  useEffect(() => {
    if (open) {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          onClose()
        }
      }
      document.addEventListener("keydown", handleEscape)
      return () => document.removeEventListener("keydown", handleEscape)
    }
  }, [open, onClose])

  const formatAUM = (aum: number) => {
    if (aum >= 1000000000) return `$${(aum / 1000000000).toFixed(1)}B`
    if (aum >= 1000000) return `$${(aum / 1000000).toFixed(0)}M`
    return `$${aum.toLocaleString()}`
  }

  const formatTicketSize = (ticket?: { min?: number; max?: number }) => {
    if (!ticket) return "Not specified"
    if (ticket.min && ticket.max) {
      return `$${(ticket.min / 1000).toFixed(0)}K - $${(ticket.max / 1000000).toFixed(1)}M`
    }
    if (ticket.min) return `$${(ticket.min / 1000).toFixed(0)}K+`
    if (ticket.max) return `Up to $${(ticket.max / 1000000).toFixed(1)}M`
    return "Not specified"
  }

  if (!open || items.length === 0) return null

  return (
    <div
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 transform transition-transform duration-300 ease-out",
        isMinimized ? "translate-y-[calc(100%-4rem)]" : "translate-y-0",
        className,
      )}
      role="dialog"
      aria-modal="true"
      aria-label="Compare investors"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-t-2xl border border-b-0 border-gray-100 bg-white/90 backdrop-blur-lg shadow-2xl shadow-[#3270a1]/10">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-gray-100 p-4">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsMinimized(!isMinimized)}
                className="flex items-center gap-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
                aria-label={isMinimized ? "Expand comparison" : "Minimize comparison"}
              >
                {isMinimized ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                Compare Investors ({items.length})
              </button>
            </div>

            <Button onClick={onClose} variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
              <X className="h-4 w-4" />
              <span className="sr-only">Close comparison</span>
            </Button>
          </div>

          {/* Content */}
          {!isMinimized && (
            <div className="max-h-96 overflow-y-auto p-6">
              <div className="grid gap-6" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 3)}, 1fr)` }}>
                {items.slice(0, 3).map((investor) => (
                  <div key={investor.id} className="space-y-4">
                    {/* Header */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={investor.logoUrl || "/placeholder.svg"} alt={`${investor.name} logo`} />
                          <AvatarFallback className="bg-gradient-to-br from-[#8dcddb]/10 to-[#7e509c]/10 text-[#3270a1] font-semibold text-xs">
                            {investor.name
                              .split(" ")
                              .map((word) => word[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold text-gray-900 text-sm">{investor.name}</h3>
                          {investor.aum && (
                            <p className="text-xs text-gray-600 flex items-center gap-1">
                              <DollarSign className="h-3 w-3" />
                              {formatAUM(investor.aum)}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {matchScores?.[investor.id] && <MatchScoreBadge score={matchScores[investor.id]} size="sm" />}
                        {onRemoveItem && (
                          <Button
                            onClick={() => onRemoveItem(investor.id)}
                            variant="ghost"
                            size="sm"
                            className="h-6 w-6 p-0 text-gray-400 hover:text-gray-600"
                          >
                            <X className="h-3 w-3" />
                            <span className="sr-only">Remove from comparison</span>
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Details */}
                    <div className="space-y-3 text-sm">
                      {/* Investment Stages */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          Stages
                        </h4>
                        <div className="flex flex-wrap gap-1">
                          {investor.stages.slice(0, 3).map((stage) => (
                            <Badge key={stage} variant="secondary" className="text-xs">
                              {stage}
                            </Badge>
                          ))}
                          {investor.stages.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{investor.stages.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Ticket Size */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          Ticket Size
                        </h4>
                        <p className="text-gray-600">{formatTicketSize(investor.ticket)}</p>
                      </div>

                      {/* Geography */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Geography
                        </h4>
                        <p className="text-gray-600">
                          {investor.geos.slice(0, 2).join(", ")}
                          {investor.geos.length > 2 && ` +${investor.geos.length - 2}`}
                        </p>
                      </div>

                      {/* Themes */}
                      <div>
                        <h4 className="font-medium text-gray-700 mb-1">Impact Themes</h4>
                        <div className="flex flex-wrap gap-1">
                          {investor.themes.slice(0, 3).map((theme) => (
                            <Badge
                              key={theme}
                              variant="outline"
                              className="text-xs border-[#3270a1]/20 text-[#3270a1] bg-gradient-to-r from-[#8dcddb]/5 to-[#7e509c]/5"
                            >
                              {theme}
                            </Badge>
                          ))}
                          {investor.themes.length > 3 && (
                            <Badge variant="outline" className="text-xs">
                              +{investor.themes.length - 3}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Description */}
                      {investor.blurb && (
                        <div>
                          <h4 className="font-medium text-gray-700 mb-1">Description</h4>
                          <p className="text-gray-600 text-xs leading-relaxed line-clamp-3">{investor.blurb}</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {items.length > 3 && (
                <div className="mt-6 pt-4 border-t border-gray-100 text-center">
                  <p className="text-sm text-gray-500">Showing first 3 investors. {items.length - 3} more selected.</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
