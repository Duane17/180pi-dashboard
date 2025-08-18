// components/upload/save-bar.tsx
"use client";

import React from "react";

export interface SaveBarProps {
  dirty: boolean;
  submitting: boolean;
  onSave: () => void;
  onCancel?: () => void;
}

/**
 * Bottom sticky bar with Save and Cancel.
 * - Glassmorphism container
 * - Gradient Save button (matches your reference)
 */
export function SaveBar({ dirty, submitting, onSave, onCancel }: SaveBarProps) {
  return (
    <div className="sticky bottom-0 left-0 right-0 z-40">
      <div className="mx-auto max-w-4xl px-4 pb-6">
        <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-xl shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end px-4 py-3">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-4 py-2 border border-transparent text-[#1a1a1a] font-medium rounded-lg hover:bg-white/50 transition-all duration-200"
                disabled={submitting}
              >
                Cancel
              </button>
            )}

            <button
              type="button"
              onClick={onSave}
              disabled={submitting || !dirty}
              className="px-4 py-2 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
            >
              {submitting ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
