// components/upload/wizard/wizard-footer.tsx
"use client";

import type { WizardStep } from "@/types/esg-wizard.types";

export type WizardFooterProps = {
  current: WizardStep;
  isLast: boolean;
  dirty: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void;
  onSubmit: () => void;
};

/**
 * WizardFooter
 * - Flat bar (no extra card); subtle divider lives in the parent
 * - Gradient primary CTA; secondary actions are frosted-outline
 * - Invokes handlers passed from the wizard
 */
export default function WizardFooter({
  current,
  isLast,
  dirty,
  submitting,
  onBack,
  onNext,
  onSaveDraft,
  onSubmit,
}: WizardFooterProps) {
  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-gray-700">
        <span className="font-medium">Step {current} of 4</span>
        {dirty && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
            Unsaved
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={current === 1 || submitting}
          className="rounded-lg border border-gray-300/70 bg-white/60 px-4 py-2 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Back
        </button>

        {!isLast ? (
          <button
            type="button"
            onClick={onNext}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background:
                "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)",
            }}
          >
            Next
          </button>
        ) : (
          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50"
            style={{
              background:
                "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)",
            }}
          >
            Submit
          </button>
        )}

        <button
          type="button"
          onClick={onSaveDraft}
          disabled={submitting}
          className="rounded-lg border border-gray-300/70 bg-white/60 px-4 py-2 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Save draft
        </button>
      </div>
    </div>
  );
}
