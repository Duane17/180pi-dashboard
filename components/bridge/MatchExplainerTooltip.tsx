import { HelpCircle } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

interface MatchExplainerTooltipProps {
  score: number
  factors?: {
    sector: number
    geography: number
    stage: number
    themes: number
    esg: number
  }
}

export function MatchExplainerTooltip({ score, factors }: MatchExplainerTooltipProps) {
  const defaultFactors = {
    sector: 85,
    geography: 90,
    stage: 75,
    themes: 80,
    esg: 70,
  }

  const matchFactors = factors || defaultFactors

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="How this match was computed"
          >
            <HelpCircle className="h-4 w-4" />
          </button>
        </TooltipTrigger>
        <TooltipContent side="left" className="max-w-xs p-4">
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-sm mb-2">Match Score: {score}%</h4>
              <p className="text-xs text-gray-600 mb-3">
                Based on alignment between your criteria and this investor's focus areas:
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Sector Alignment</span>
                <span className="text-xs font-medium">{matchFactors.sector}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Geographic Focus</span>
                <span className="text-xs font-medium">{matchFactors.geography}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Investment Stage</span>
                <span className="text-xs font-medium">{matchFactors.stage}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">Impact Themes</span>
                <span className="text-xs font-medium">{matchFactors.themes}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-gray-600">ESG Preferences</span>
                <span className="text-xs font-medium">{matchFactors.esg}%</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 pt-2 border-t border-gray-100">
              Higher scores indicate better alignment with your investment criteria.
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
