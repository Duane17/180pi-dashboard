// components/upload/wizard/wizard-nav.tsx
"use client";

import React from "react";
import type { WizardStep } from "@/types/esg-wizard.types";

export type WizardNavProps = {
  current: WizardStep;
  completedSteps?: Set<number>; // optional, for future styling if needed
  onJump: (step: WizardStep) => void;
};

/**
 * WizardNav
 * - Flat, minimal nav (no extra glass layer)
 * - Active step gets gradient text + gradient ring
 * - Free navigation: users can jump to any step
 */
export default function WizardNav({ current, onJump }: WizardNavProps) {
  const steps: Array<{ n: WizardStep; label: string }> = [
    { n: 1, label: "General" },
    { n: 2, label: "Environment" },
    { n: 3, label: "Social" },
    { n: 4, label: "Governance" },
  ];

  return (
    <nav aria-label="Wizard Progress" className="flex flex-wrap items-center gap-2">
      {steps.map((s) => {
        const isActive = s.n === current;

        return (
          <button
            key={s.n}
            type="button"
            aria-current={isActive ? "step" : undefined}
            onClick={() => onJump(s.n)}
            className={[
              "rounded-full px-4 py-1.5 text-sm transition",
              "border border-transparent bg-white/50 backdrop-blur-sm",
              "text-gray-800 hover:bg-white/40",
              isActive ? "ring-1 ring-offset-0" : "",
            ].join(" ")}
            style={
              isActive
                ? {
                    backgroundImage:
                      "linear-gradient(white, white), linear-gradient(90deg, #3270a1, #7e509c, #8dcddb)",
                    backgroundOrigin: "border-box",
                    backgroundClip: "padding-box, border-box",
                  }
                : undefined
            }
          >
            <span
              className={
                isActive
                  ? "bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent font-medium"
                  : "font-medium"
              }
            >
              {s.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
