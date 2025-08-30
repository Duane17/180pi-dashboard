"use client";

import { useEffect, useMemo, useState } from "react";
import type { WizardStep } from "@/types/esg-wizard.types";

export type WizardFooterProps = {
  current: WizardStep;
  isLast: boolean;
  dirty: boolean;
  submitting: boolean; // includes saving when passed from parent
  saving: boolean;     // explicit saving flag for button label
  savedText?: string;  // e.g., "Saved to cloud • 14:36"
  onBack: () => void;
  onNext: () => void;
  onSaveDraft: () => void; // the only action we use for saving/submitting
};

export default function WizardFooter({
  current,
  isLast,
  dirty,
  submitting,
  saving,
  savedText,
  onBack,
  onNext,
  onSaveDraft,
}: WizardFooterProps) {
  const [recentlySaved, setRecentlySaved] = useState(false);

  useEffect(() => {
    setRecentlySaved(Boolean(savedText));
  }, [savedText]);

  useEffect(() => {
    if (dirty) setRecentlySaved(false);
  }, [dirty]);

  const handleSave = () => onSaveDraft();
  const saveLabel = saving ? "Saving…" : isLast ? "Save & Submit" : "Save";

  const showUnsaved = useMemo(
    () => dirty && !saving && !recentlySaved,
    [dirty, saving, recentlySaved]
  );

  const primaryBtnClass =
    "rounded-lg px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50";
  const primaryBg = {
    background: "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)",
  };
  const secondaryBtnClass =
    "rounded-lg border border-gray-300/70 bg-white/60 px-4 py-2 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80 disabled:cursor-not-allowed disabled:opacity-50";

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="text-xs text-gray-700 flex items-center gap-2">
        <span className="font-medium">Step {current} of 4</span>

        {showUnsaved && (
          <span className="ml-1 rounded-full bg-amber-100 px-2 py-0.5 text-amber-800">
            Unsaved
          </span>
        )}

        {savedText && (
          <span
            className="ml-1 inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-emerald-800"
            aria-live="polite"
          >
            <svg aria-hidden="true" viewBox="0 0 24 24" className="h-3 w-3" fill="currentColor">
              <path d="M9 16.2 4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4z" />
            </svg>
            {savedText}
          </span>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onBack}
          disabled={current === 1 || submitting}
          className={secondaryBtnClass}
        >
          Back
        </button>

        {!isLast && (
          <button
            type="button"
            onClick={onNext}
            disabled={submitting}
            className={primaryBtnClass}
            style={primaryBg}
          >
            Next
          </button>
        )}

        {/* Save is the only “submit-like” action */}
        <button
          type="button"
          onClick={handleSave}
          disabled={submitting}
          className={isLast ? primaryBtnClass : secondaryBtnClass}
          style={isLast ? primaryBg : undefined}
          aria-live="polite"
        >
          {saveLabel}
        </button>
      </div>
    </div>
  );
}
