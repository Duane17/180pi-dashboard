// components/upload/wizard/esg-wizard.tsx
"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";

// Types (inferred from Zod via your types)
import type { ESGWizardValues, WizardStep } from "@/types/esg-wizard.types";

// Defaults aligned to schemas
import { DEFAULT_ESG_VALUES } from "@/constants/esg.constants";

// Validation (Zod)
import { zodResolver } from "@hookform/resolvers/zod";
// IMPORTANT: use the correct filename (".schema") to avoid creating a second module instance
import { ESGWizardSchema } from "@/schemas/esg-wizard-schema";

// Hooks: dirty prompt + persist
import { useFormDirtyPrompt } from "@/hooks/use-form-dirty-prompt";
import { useFormPersist } from "@/hooks/use-form-persist";

// Toast (adjust to your UI system)
import { useToast } from "@/components/ui/use-toast";

// Steps
import { GeneralStep } from "@/components/upload/steps/general-step";
import { EnvironmentStep } from "@/components/upload/steps/environment-step";
import { SocialStep } from "@/components/upload/steps/social-step"; // <- NEW

// Extracted UI
import WizardNav from "@/components/upload/wizard/wizard-nav";
import WizardFooter from "@/components/upload/wizard/wizard-footer";

export type ESGWizardProps = {
  onSubmit?: (values: ESGWizardValues) => void;
  initialValues?: Partial<ESGWizardValues>;
};

export function ESGWizard({ onSubmit, initialValues }: ESGWizardProps) {
  // Build defaults with optional prefill (slice-wise so nested defaults aren’t lost)
  const defaultValues = useMemo<ESGWizardValues>(() => {
    const base = DEFAULT_ESG_VALUES();
    return {
      general: initialValues?.general ?? base.general,
      environment: initialValues?.environment ?? base.environment,
      social: initialValues?.social ?? base.social,
      governance: initialValues?.governance ?? base.governance,
    };
  }, [initialValues]);

  const form = useForm<ESGWizardValues>({
    defaultValues,
    mode: "onChange",
    // Remove the explicit Resolver import/cast; let zodResolver infer the types
    resolver: zodResolver(ESGWizardSchema),
  });

  const { handleSubmit, getValues, formState, watch, reset } = form;

  // Warn on leave if dirty
  useFormDirtyPrompt(formState.isDirty);

  // Persist entire wizard (hydrate on mount, save on changes, cross-tab sync)
  useFormPersist("esg-wizard:v1", watch(), reset);

  const { toast } = useToast();

  // Step state
  const [current, setCurrent] = useState<WizardStep>(1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(() => new Set()); // kept for potential styling

  const isLast = current === 4;

  // Smooth-scroll anchors
  const stepTopRef = useRef<HTMLDivElement | null>(null);

  // Try scrolling to the page heading "Sustainabilty Intelligence Uploads" if present.
  // Add `id="esg-uploads-top"` or `data-scroll-anchor="esg-uploads"` on your <h1>.
  const scrollToPageTopOrStep = useCallback(() => {
    const pageAnchor =
      (document.getElementById("esg-uploads-top") as HTMLElement | null) ||
      (document.querySelector("[data-scroll-anchor='esg-uploads']") as HTMLElement | null);

    if (pageAnchor) {
      pageAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  // Scroll whenever the step changes (Next/Back/Nav jump)
  useEffect(() => {
    scrollToPageTopOrStep();
  }, [current, scrollToPageTopOrStep]);

  // Handlers
  const goTo = useCallback((step: WizardStep) => setCurrent(step), []);
  const onBack = useCallback(() => setCurrent((s) => (s > 1 ? ((s - 1) as WizardStep) : s)), []);

  // FREE NAV: do not gate Next with validation
  const onNext = useCallback(() => {
    setCompletedSteps((prev) => new Set(prev).add(current)); // optional: mark step as “visited”
    setCurrent((s) => (s < 4 ? ((s + 1) as WizardStep) : s));
  }, [current]);

  // Manual "Save draft": toast + force persist tick immediately
  const onSaveDraft = useCallback(() => {
    try {
      const values = getValues();
      localStorage.setItem("esg-wizard:v1", JSON.stringify(values)); // force immediate write
      toast({
        title: "Draft saved",
        description: "Your progress has been stored locally on this device.",
      });
    } catch {
      toast({
        title: "Couldn’t save draft",
        description: "Local storage is unavailable.",
        variant: "destructive",
      });
    }
  }, [getValues, toast]);

  // Final submit validates the entire form (resolver)
  const onSubmitAll = useMemo(
    () =>
      handleSubmit((values) => {
        if (onSubmit) onSubmit(values);
        else console.log("ESG Wizard submit (Phase 1):", values); // eslint-disable-line no-console
      }),
    [handleSubmit, onSubmit]
  );

  // Pass a fully completed set to WizardNav so it allows jumping anywhere without changing the nav component
  const ALL_STEPS_COMPLETED = useMemo(() => new Set<number>([1, 2, 3, 4]), []);

  return (
    <FormProvider {...form}>
      <div className="w-full">
        {/* Nav (flat) */}
        <div className="mb-4">
          <WizardNav
            current={current}
            // Enable free navigation by pretending every step is completed
            completedSteps={ALL_STEPS_COMPLETED}
            onJump={(step) => goTo(step)}
          />
          <div className="mt-2 h-px w-full bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb]" />
        </div>

        {/* Smooth-scroll anchor for step content (fallback if page anchor not found) */}
        <div ref={stepTopRef} />

        {/* Step outlet (flat; page provides glass) */}
        <div className="p-1">
          {current === 1 && <GeneralStep />}
          {current === 2 && <EnvironmentStep />}
          {current === 3 && <SocialStep />} {/* ← mount the real Social step */}
          {current === 4 && <StepPlaceholder title="Step 4 — Governance" />}
        </div>

        {/* Footer (flat) */}
        <div className="mt-6">
          <div className="h-px w-full bg-gradient-to-r from-[#8dcddb] via-[#7e509c] to-[#3270a1] opacity-60" />
          <WizardFooter
            current={current}
            isLast={isLast}
            dirty={formState.isDirty}
            submitting={formState.isSubmitting}
            onBack={onBack}
            onNext={onNext}
            onSaveDraft={onSaveDraft}
            onSubmit={onSubmitAll}
          />
        </div>
      </div>
    </FormProvider>
  );
}

/* ------------------------------ Placeholder ------------------------------ */
function StepPlaceholder({ title }: { title: string }) {
  return (
    <div className="text-sm">
      <h2 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
        {title}
      </h2>
      <p className="mt-1 text-gray-700">This is a placeholder. You’ll mount the real step here.</p>
    </div>
  );
}
