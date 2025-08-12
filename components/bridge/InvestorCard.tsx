"use client"
import { MapPin, DollarSign, Eye, Heart, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { MatchScoreBadge } from "./MatchScoreBadge"
import { MatchExplainerTooltip } from "./MatchExplainerTooltip"

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

interface InvestorCardProps {
  investor: Investor
  matchScore?: number
  onView: () => void
  onSave: () => void
  onContact: () => void
  isSelected?: boolean
  onSelect?: (selected: boolean) => void
  className?: string
}

export function InvestorCard({
  investor,
  matchScore,
  onView,
  onSave,
  onContact,
  isSelected = false,
  onSelect,
  className,
}: InvestorCardProps) {
  const formatAUM = (aum: number) => {
    if (aum >= 1000000000) return `$${(aum / 1000000000).toFixed(1)}B`
    if (aum >= 1000000) return `$${(aum / 1000000).toFixed(0)}M`
    return `$${aum.toLocaleString()}`
  }

  const formatTicketSize = (ticket?: { min?: number; max?: number }) => {
    if (!ticket) return null
    if (ticket.min && ticket.max) {
      return `$${(ticket.min / 1000).toFixed(0)}K - $${(ticket.max / 1000000).toFixed(1)}M`
    }
    if (ticket.min) return `$${(ticket.min / 1000).toFixed(0)}K+`
    if (ticket.max) return `Up to $${(ticket.max / 1000000).toFixed(1)}M`
    return null
  }

  return (
    <div
      className={`group relative rounded-2xl border border-gray-100 bg-white/60 backdrop-blur-sm p-6 shadow-lg shadow-[#3270a1]/5 transition-all duration-200 hover:shadow-xl hover:shadow-[#3270a1]/10 hover:scale-[1.02] ${
        isSelected ? "ring-2 ring-[#3270a1] ring-opacity-50" : ""
      } ${className}`}
    >
      {/* Selection Checkbox */}
      {onSelect && (
        <div className="absolute top-4 left-4">
          <input
            type="checkbox"
            checked={isSelected}
            onChange={(e) => onSelect(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-[#3270a1] focus:ring-[#3270a1] focus:ring-offset-0"
            aria-label={`Select ${investor.name}`}
          />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <Avatar className="h-12 w-12">
            <AvatarImage src={investor.logoUrl || "/placeholder.svg"} alt={`${investor.name} logo`} />
            <AvatarFallback className="bg-gradient-to-br from-[#8dcddb]/10 to-[#7e509c]/10 text-[#3270a1] font-semibold">
              {investor.name
                .split(" ")
                .map((word) => word[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <h3 className="font-semibold text-gray-900 group-hover:text-[#3270a1] transition-colors">
              {investor.name}
            </h3>
            {investor.aum && (
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                {formatAUM(investor.aum)} AUM
              </p>
            )}
          </div>
        </div>

        {/* Match Score */}
        {matchScore && (
          <div className="flex items-center gap-2">
            <MatchScoreBadge score={matchScore} size="sm" />
            <MatchExplainerTooltip score={matchScore} />
          </div>
        )}
      </div>

      {/* Investment Details */}
      <div className="space-y-3 mb-4">
        {/* Stages */}
        {investor.stages.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {investor.stages.slice(0, 3).map((stage) => (
              <Badge key={stage} variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                {stage}
              </Badge>
            ))}
            {investor.stages.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-gray-100 text-gray-700">
                +{investor.stages.length - 3}
              </Badge>
            )}
          </div>
        )}

        {/* Ticket Size */}
        {investor.ticket && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <DollarSign className="h-3 w-3" />
            {formatTicketSize(investor.ticket)}
          </p>
        )}

        {/* Geography */}
        {investor.geos.length > 0 && (
          <p className="text-sm text-gray-600 flex items-center gap-1">
            <MapPin className="h-3 w-3" />
            {investor.geos.slice(0, 2).join(", ")}
            {investor.geos.length > 2 && ` +${investor.geos.length - 2}`}
          </p>
        )}
      </div>

      {/* Themes */}
      {investor.themes.length > 0 && (
        <div className="mb-4">
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
              <Badge variant="outline" className="text-xs border-gray-200 text-gray-600">
                +{investor.themes.length - 3}
              </Badge>
            )}
          </div>
        </div>
      )}

      {/* Description */}
      {investor.blurb && <p className="text-sm text-gray-600 mb-6 line-clamp-2 leading-relaxed">{investor.blurb}</p>}

      {/* Actions */}
      <div className="flex gap-2">
        <Button
          onClick={onView}
          className="flex-1 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white hover:shadow-lg hover:shadow-[#3270a1]/25 transition-all duration-200"
        >
          <Eye className="mr-2 h-4 w-4" />
          View Profile
        </Button>
        <Button onClick={onSave} variant="outline" size="icon" className="bg-white/60 backdrop-blur-sm">
          <Heart className="h-4 w-4" />
          <span className="sr-only">Save investor</span>
        </Button>
        <Button onClick={onContact} variant="outline" size="icon" className="bg-white/60 backdrop-blur-sm">
          <Mail className="h-4 w-4" />
          <span className="sr-only">Contact investor</span>
        </Button>
      </div>
    </div>
  )
}
