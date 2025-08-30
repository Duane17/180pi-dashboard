"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import type { ESGWizardValues, WizardStep } from "@/types/esg-wizard.types";
import { DEFAULT_ESG_VALUES } from "@/constants/esg.constants";
import { zodResolver } from "@hookform/resolvers/zod";
import { ESGWizardSchema } from "@/schemas/esg-wizard-schema";
import { useFormDirtyPrompt } from "@/hooks/use-form-dirty-prompt";
import { useFormPersist } from "@/hooks/use-form-persist";
import { useToast } from "@/components/ui/use-toast";
import { GeneralStep } from "@/components/upload/steps/general-step";
import { EnvironmentStep } from "@/components/upload/steps/environment-step";
import { SocialStep } from "@/components/upload/steps/social-step";
import { GovernanceStep } from "../steps/governance-step";
import WizardNav from "@/components/upload/wizard/wizard-nav";
import WizardFooter from "@/components/upload/wizard/wizard-footer";
import { useAuth } from "@/contexts/auth-context";

/* NEW: centralized actions */
import {
  saveEsgDraft,
  submitEsgWizard,
  stripFilesForLocalSave,
} from "@/lib/workflows/esg-wizard.workflow";

export type ESGWizardProps = {
  onSubmit?: (values: ESGWizardValues) => void;
  initialValues?: Partial<ESGWizardValues>;
};

export function ESGWizard({ onSubmit, initialValues }: ESGWizardProps) {
  const { toast } = useToast();
  const { company, isReady, isAuthenticated } = useAuth();

  // Build defaults with optional prefill
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
    resolver: zodResolver(ESGWizardSchema),
  });
  const { handleSubmit, getValues, formState, watch, reset, setError } = form;

  // Warn on leave if dirty
  useFormDirtyPrompt(formState.isDirty);

  // Persist (local)
  useFormPersist("esg-wizard:v1", watch(), reset);

  // Step state
  const [current, setCurrent] = useState<WizardStep>(1);
  const isLast = current === 4;

  // Network flags
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Saved indicator state
  const [lastSaved, setLastSaved] = useState<null | { source: "local" | "cloud"; at: number }>(null);
  const savedText = useMemo(() => {
    if (!lastSaved) return undefined;
    const time = new Date(lastSaved.at).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return lastSaved.source === "cloud" ? `Saved to cloud • ${time}` : `Saved locally • ${time}`;
  }, [lastSaved]);

  // Smooth-scroll anchors
  const stepTopRef = useRef<HTMLDivElement | null>(null);
  const scrollToPageTopOrStep = useCallback(() => {
    const pageAnchor =
      (document.getElementById("esg-uploads-top") as HTMLElement | null) ||
      (document.querySelector("[data-scroll-anchor='esg-uploads']") as HTMLElement | null);
    if (pageAnchor) { pageAnchor.scrollIntoView({ behavior: "smooth", block: "start" }); return; }
    stepTopRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);
  useEffect(() => { scrollToPageTopOrStep(); }, [current, scrollToPageTopOrStep]);

  // Handlers: navigation
  const goTo = useCallback((step: WizardStep) => setCurrent(step), []);
  const onBack = useCallback(() => setCurrent((s) => (s > 1 ? ((s - 1) as WizardStep) : s)), []);
  const onNext = useCallback(() => setCurrent((s) => (s < 4 ? ((s + 1) as WizardStep) : s)), []);

  // --------------------------
  // Cloud SAVE (draft)
  // --------------------------
  const onSaveDraft = useCallback(async () => {
    const companyId = company?.id;

    if (!isReady || !isAuthenticated || !companyId) {
      // local-only fallback
      try {
        const values = getValues();
        localStorage.setItem("esg-wizard:v1", JSON.stringify(stripFilesForLocalSave(values)));
        setLastSaved({ source: "local", at: Date.now() });
        toast({ title: "Saved locally", description: "You’re not authenticated yet; saved on this device." });
      } catch {
        toast({ title: "Couldn’t save draft", description: "Local storage unavailable.", variant: "destructive" });
      }
      return;
    }

    setSaving(true);
    const values = getValues();
    const result = await saveEsgDraft(values, {
      companyId,
      mirrorToLocal: true,
      setLocal: (k, v) => localStorage.setItem(k, v),
    });

    if (result.ok) {
      setLastSaved({ source: "cloud", at: result.savedAt! });
      toast({ title: "Saved to cloud", description: "Your progress was stored on the server." });
    } else {
      // Surface server message if present and mirror locally anyway
      try {
        localStorage.setItem("esg-wizard:v1", JSON.stringify(stripFilesForLocalSave(values)));
        setLastSaved({ source: "local", at: Date.now() });
      } catch {}
      const msg = (result.errors as any)?.response?.data?.message ?? "Could not save draft.";
      toast({ title: "Save failed", description: String(msg), variant: "destructive" });
    }
    setSaving(false);
  }, [company?.id, getValues, isAuthenticated, isReady, toast]);

  // --------------------------
  // Final SUBMIT (validate all)
  // --------------------------
  const submitImpl = useCallback(async (values: ESGWizardValues) => {
    const companyId = company?.id;
    if (!isReady || !isAuthenticated || !companyId) {
      toast({ title: "Not ready", description: "Please sign in or wait for session to load.", variant: "destructive" });
      return;
    }

    setSubmitting(true);
    const result = await submitEsgWizard(values, {
      companyId,
      mirrorToLocal: true,
      setLocal: (k, v) => localStorage.setItem(k, v),
    });

    if (result.ok) {
      onSubmit?.(values);
      reset(values, { keepDirty: false, keepValues: true });
      setLastSaved({ source: "cloud", at: result.savedAt! });
      toast({ title: "Submitted", description: "General information saved to your company." });
    } else {
      // Map server field errors into RHF (general.*), if any
      const issues = (result.errors as any)?.response?.data?.issues?.fieldErrors as Record<string, string[]> | undefined;
      if (issues) {
        Object.entries(issues).forEach(([path, msgs]) => {
          if (!msgs?.length) return;
          const rhfPath = `general.${path}` as any;
          setError(rhfPath, { type: "server", message: msgs[0] });
        });
      }
      const msg = (result.errors as any)?.response?.data?.message ?? "Submission failed.";
      toast({ title: "Error", description: String(msg), variant: "destructive" });
    }
    setSubmitting(false);
  }, [company?.id, isAuthenticated, isReady, onSubmit, reset, setError, toast]);

  // RHF-wrapped final submit
  const onSubmitAll = useMemo(() => handleSubmit(submitImpl), [handleSubmit, submitImpl]);

  // (Optional) allow jumping anywhere for now
  const ALL_STEPS_COMPLETED = useMemo(() => new Set<number>([1, 2, 3, 4]), []);

  return (
    <FormProvider {...form}>
      <div className="w-full">
        <div className="mb-4">
          <WizardNav current={current} completedSteps={ALL_STEPS_COMPLETED} onJump={(step) => goTo(step)} />
          <div className="mt-2 h-px w-full bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb]" />
        </div>

        <div ref={stepTopRef} />

        <div className="p-1">
          {current === 1 && <GeneralStep />}
          {current === 2 && <EnvironmentStep />}
          {current === 3 && <SocialStep />}
          {current === 4 && <GovernanceStep />}
        </div>

        <div className="mt-6">
          <div className="h-px w-full bg-gradient-to-r from-[#8dcddb] via-[#7e509c] to-[#3270a1] opacity-60" />
          <WizardFooter
            current={current}
            isLast={isLast}
            dirty={formState.isDirty}
            submitting={submitting || saving || formState.isSubmitting}
            saving={saving}
            savedText={savedText}
            onBack={onBack}
            onNext={onNext}
            onSaveDraft={onSaveDraft}
          />
        </div>
      </div>
    </FormProvider>
  );
}
