"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { CompanyWizardShell } from "@/components/onboarding/CompanyWizardShell";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";

import { useAuth } from "@/contexts/auth-context";

// Intent types & friendly labels
import type {
  OnboardingIntentData,
  OnboardingProfileUpsertRequest,
  HelpFocus,
  ReportingObligation,
  StakeholderGroup,
} from "@/types/onboarding-profile";
import {
  HelpFocusLabels,
  ReportingObligationLabels,
  StakeholderGroupLabels,
} from "@/types/onboarding-profile";

// Profile API hooks
import { useGetOnboardingProfile } from "@/api/onboarding-profile/queries";
import { useUpsertOnboardingProfile } from "@/api/onboarding-profile/mutations";

// New step components
import { StepHelpFocus } from "@/components/onboarding/StepHelpFocus";
import { StepReportingObligation } from "@/components/onboarding/StepReportingObligation";
import { StepStakeholderGroup } from "@/components/onboarding/StepStakeholderGroup";

import { isApiErrorResponse } from "@/types/api";

/* ----------------------------------------------------------------
   Local types (wizard state/errors)
---------------------------------------------------------------- */
interface FormData {
  onboardingIntent: OnboardingIntentData;
}

interface FormErrors {
  onboardingIntent?: Partial<Record<keyof OnboardingIntentData, string>>;
}

/* ----------------------------------------------------------------
   Steps metadata (per spec)
---------------------------------------------------------------- */
const steps = [
  {
    id: 1,
    title: "How can we help?",
    description: "Choose what you want to achieve first",
  },
  {
    id: 2,
    title: "Are you subject to reporting?",
    description: "Tell us if your disclosures are mandatory or voluntary",
  },
  {
    id: 3,
    title: "Your stakeholder group",
    description: "Who you represent helps tailor recommendations",
  },
  {
    id: 4,
    title: "Review & confirm",
    description: "Confirm your choices",
  },
];

/* ----------------------------------------------------------------
   Label helpers for review
---------------------------------------------------------------- */
function labelHelpFocus(v: HelpFocus | ""): string {
  return (v && HelpFocusLabels[v as HelpFocus]) || (v || "Not specified");
}
function labelReportingObligation(v: ReportingObligation | ""): string {
  return (v && ReportingObligationLabels[v as ReportingObligation]) || (v || "Not specified");
}
function labelStakeholderGroup(v: StakeholderGroup | ""): string {
  return (v && StakeholderGroupLabels[v as StakeholderGroup]) || (v || "Not specified");
}

/* ----------------------------------------------------------------
   Component
---------------------------------------------------------------- */
export default function OnboardingPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { company: authCompany, isAuthenticated, isLoading } = useAuth();

  // ---------- AUTH GUARD ----------
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/auth");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null; // prevent render while redirecting/loading
  }

  const activeCompanyId = authCompany?.id ?? null;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    onboardingIntent: {
      helpFocus: "",
      reportingObligation: "",
      stakeholderGroup: "",
    },
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [savedOnce, setSavedOnce] = useState(false);

  // Smooth-scroll sentinel
  const stepTopRef = useRef<HTMLDivElement | null>(null);

  // ---------- Prefill from server (if profile exists) ----------
  const {
    data: profile,
    isLoading: isProfileLoading,
  } = useGetOnboardingProfile(activeCompanyId ?? "");

  useEffect(() => {
    if (!profile) return;
    setFormData({
      onboardingIntent: {
        helpFocus: profile.helpFocus,
        reportingObligation: profile.reportingObligation,
        stakeholderGroup: profile.stakeholderGroup,
      },
    });
  }, [profile]);

  // ---------- Mutation to upsert profile after Step 3 ----------
  const upsertProfile = useUpsertOnboardingProfile(activeCompanyId ?? "");

  // Smooth scroll to top whenever the step changes
  useEffect(() => {
    const el = stepTopRef.current;
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  /* ----------------------------------------------------------------
     Validation
  ---------------------------------------------------------------- */
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = { ...errors };

    if (step === 1 || step === 2 || step === 3) {
      const e: Partial<Record<keyof OnboardingIntentData, string>> = {};

      if (step === 1 && !formData.onboardingIntent.helpFocus) {
        e.helpFocus = "Please select a focus.";
      }
      if (step === 2 && !formData.onboardingIntent.reportingObligation) {
        e.reportingObligation = "Please select your reporting obligation.";
      }
      if (step === 3 && !formData.onboardingIntent.stakeholderGroup) {
        e.stakeholderGroup = "Please select your stakeholder group.";
      }

      newErrors.onboardingIntent = e;
    }

    setErrors(newErrors);

    if (step >= 1 && step <= 3) {
      const stepErrors = newErrors.onboardingIntent || {};
      return Object.keys(stepErrors).length === 0;
    }

    // Review step doesn’t gate
    return true;
  };

  const canProceed = (): boolean => {
    if (currentStep === 4) return true;
    if (currentStep === 1) return !!formData.onboardingIntent.helpFocus;
    if (currentStep === 2) return !!formData.onboardingIntent.reportingObligation;
    if (currentStep === 3) return !!formData.onboardingIntent.stakeholderGroup;
    return false;
  };

  /* ----------------------------------------------------------------
     Navigation
  ---------------------------------------------------------------- */
  const handleNext = async () => {
    if (!validateStep(currentStep)) return;

    // On completing Step 3, persist immediately (idempotent upsert)
    if (currentStep === 3 && activeCompanyId) {
      const { helpFocus, reportingObligation, stakeholderGroup } = formData.onboardingIntent;
      if (!helpFocus || !reportingObligation || !stakeholderGroup) return;

      const payload: OnboardingProfileUpsertRequest = {
        helpFocus,
        reportingObligation,
        stakeholderGroup,
      };

      try {
        await upsertProfile.mutateAsync(payload);
        setSavedOnce(true);

        // Keep cache hot
        await queryClient.invalidateQueries({
          queryKey: ["companies", "onboarding-profile", activeCompanyId],
        });

        toast.success("Your preferences were saved.");
      } catch (err: any) {
        // Inline errors (fieldErrors) + toast
        const data = err?.response?.data;
        if (isApiErrorResponse(data) && data.issues?.fieldErrors) {
          const fe = data.issues.fieldErrors as Record<string, string[]>;
          const next: FormErrors = { onboardingIntent: {} };
          if (fe.helpFocus?.length) next.onboardingIntent!.helpFocus = fe.helpFocus[0];
          if (fe.reportingObligation?.length) next.onboardingIntent!.reportingObligation = fe.reportingObligation[0];
          if (fe.stakeholderGroup?.length) next.onboardingIntent!.stakeholderGroup = fe.stakeholderGroup[0];
          setErrors(next);
          toast.error(data.message || "Please fix the highlighted fields.");
        } else {
          toast.error("We couldn’t save your preferences. Please try again.");
        }
        return; // stay on step 3 if failed
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleStepClick = (step: number) => {
    // Allow visiting completed or current steps only
    if (step <= currentStep) setCurrentStep(step);
  };

  /* ----------------------------------------------------------------
     Update helpers
  ---------------------------------------------------------------- */
  const replaceOnboardingIntent = (patch: Partial<OnboardingIntentData>) => {
    setFormData(prev => ({
      ...prev,
      onboardingIntent: { ...prev.onboardingIntent, ...patch },
    }));
    setErrors(prev => ({ ...prev, onboardingIntent: {} }));
  };

  /* ----------------------------------------------------------------
     Titles + subtitles
  ---------------------------------------------------------------- */
  const getStepTitle = () => steps.find((s) => s.id === currentStep)?.title || "Onboarding";
  const getStepSubtitle = () => steps.find((s) => s.id === currentStep)?.description;

  /* ----------------------------------------------------------------
     Review data
  ---------------------------------------------------------------- */
  const reviewData = useMemo<OnboardingIntentData>(() => {
    if (profile) {
      return {
        helpFocus: profile.helpFocus,
        reportingObligation: profile.reportingObligation,
        stakeholderGroup: profile.stakeholderGroup,
      };
    }
    return formData.onboardingIntent;
  }, [profile, formData.onboardingIntent]);

  /* ----------------------------------------------------------------
     Render
  ---------------------------------------------------------------- */
  const nextLabel = currentStep === 3 ? "Save & Continue" : "Next";
  const isBusy = upsertProfile.isPending || isProfileLoading;

  const handleFinish = async () => {
    // Optional idempotent upsert on finish if user never saved at step 3 (e.g., direct jump)
    if (!savedOnce && activeCompanyId) {
      const { helpFocus, reportingObligation, stakeholderGroup } = formData.onboardingIntent;
      if (helpFocus && reportingObligation && stakeholderGroup) {
        try {
          await upsertProfile.mutateAsync({ helpFocus, reportingObligation, stakeholderGroup });
          await queryClient.invalidateQueries({
            queryKey: ["companies", "onboarding-profile", activeCompanyId],
          });
        } catch {
          // If this fails, don’t block navigation; they can revisit settings later
        }
      }
    }
    router.push("/dashboard");
  };

  return (
    <CompanyWizardShell
      currentStep={currentStep}
      totalSteps={steps.length}
      title={getStepTitle()}
      subtitle={getStepSubtitle()}
    >
      {/* Smooth scroll anchor */}
      <div ref={stepTopRef} aria-hidden="true" />

      <StepIndicator steps={steps} currentStep={currentStep} onStepClick={handleStepClick} />

      {(() => {
        switch (currentStep) {
          case 1:
            return (
              <StepHelpFocus
                data={formData.onboardingIntent}
                onChange={replaceOnboardingIntent}
                errors={errors.onboardingIntent}
              />
            );
          case 2:
            return (
              <StepReportingObligation
                data={formData.onboardingIntent}
                onChange={replaceOnboardingIntent}
                errors={errors.onboardingIntent}
              />
            );
          case 3:
            return (
              <StepStakeholderGroup
                data={formData.onboardingIntent}
                onChange={replaceOnboardingIntent}
                errors={errors.onboardingIntent}
              />
            );
          case 4:
            return (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-2">Review & confirm</h2>
                  <p className="text-[#4a4a4a]">Confirm your choices</p>
                </div>

                <div className="glass-card p-6 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-[#4a4a4a]">How we’ll help:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#1a1a1a]">
                        {labelHelpFocus(reviewData.helpFocus)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(1)}
                        className="text-[#3270a1] text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4a4a4a]">Are you subject to reporting?</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#1a1a1a]">
                        {labelReportingObligation(reviewData.reportingObligation)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(2)}
                        className="text-[#3270a1] text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-[#4a4a4a]">Stakeholder group:</span>
                    <div className="flex items-center gap-3">
                      <span className="font-medium text-[#1a1a1a]">
                        {labelStakeholderGroup(reviewData.stakeholderGroup)}
                      </span>
                      <button
                        type="button"
                        onClick={() => setCurrentStep(3)}
                        className="text-[#3270a1] text-sm hover:underline"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          default:
            return null;
        }
      })()}

      <NavigationButtons
        onBack={handleBack}
        onNext={handleNext}
        onSubmit={handleFinish}
        nextLabel={nextLabel}
        submitLabel="Go to Dashboard"
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === steps.length}
        isLoading={isBusy}
        canProceed={canProceed()}
      />
    </CompanyWizardShell>
  );
}
