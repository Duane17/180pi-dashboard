import { AlertCircle } from "lucide-react"

interface ValidationSummaryProps {
  errors: string[]
}

export function ValidationSummary({ errors }: ValidationSummaryProps) {
  if (errors.length === 0) return null

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4" role="alert" aria-live="polite">
      <div className="flex items-start gap-3">
        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        <div>
          <h3 className="text-sm font-medium text-red-800 mb-2">Please fix the following errors:</h3>
          <ul className="text-sm text-red-700 space-y-1">
            {errors.map((error, index) => (
              <li key={index}>• {error}</li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
