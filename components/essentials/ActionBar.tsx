"use client"

import { Button } from "@/components/ui/button"
import { Loader2, Save } from "lucide-react"
import { ValidationButton } from "@/components/validation/ValidationButton"

interface ActionBarProps {
  onValidate?: () => Promise<void>
  onSaveDraft?: () => Promise<void>
  onSubmit?: () => Promise<void>
  isValidating?: boolean
  isSaving?: boolean
  isSubmitting?: boolean
  validationState?: "idle" | "loading" | "success" | "error" | "disabled"
  lastSaved?: Date
  className?: string
}

export function ActionBar({
  onValidate,
  onSaveDraft,
  onSubmit,
  isValidating = false,
  isSaving = false,
  isSubmitting = false,
  validationState = "idle",
  lastSaved,
  className,
}: ActionBarProps) {
  const formatLastSaved = (date: Date) => {
    const now = new Date()
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))

    if (diffInMinutes < 1) return "Just now"
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`
    return date.toLocaleDateString()
  }

  return (
    <div className={`glass-card p-4 rounded-2xl border border-white/20 sticky bottom-4 z-10 ${className || ""}`}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        {/* Last Saved Indicator */}
        <div className="flex items-center gap-2 text-sm text-[#4a4a4a]">
          {lastSaved && (
            <>
              <Save className="w-4 h-4" />
              <span>Last saved {formatLastSaved(lastSaved)}</span>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {onValidate && (
            <ValidationButton
              state={validationState}
              onClick={onValidate}
              size="md"
              disabled={isSaving || isSubmitting}
            />
          )}

          {onSaveDraft && (
            <Button
              type="button"
              variant="outline"
              onClick={onSaveDraft}
              disabled={isSaving || isValidating || isSubmitting}
              className="border-2 border-transparent bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] bg-clip-border text-[#1a1a1a] font-medium px-6 py-2 rounded-lg transition-all duration-200 hover:bg-gradient-to-r hover:from-[#8dcddb]/10 hover:via-[#3270a1]/10 hover:to-[#7e509c]/10 disabled:opacity-50"
              style={{
                background: "white",
                backgroundClip: "padding-box",
                border: "2px solid transparent",
                backgroundImage: "linear-gradient(white, white), linear-gradient(135deg, #8dcddb, #3270a1, #7e509c)",
                backgroundOrigin: "border-box",
              }}
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save as Draft
                </>
              )}
            </Button>
          )}

          {onSubmit && (
            <Button
              type="submit"
              disabled={isSubmitting || isValidating || isSaving}
              className="bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] hover:opacity-90 text-white font-medium px-6 py-2 rounded-lg transition-all duration-200 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Submitting...
                </>
              ) : (
                "Submit"
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
