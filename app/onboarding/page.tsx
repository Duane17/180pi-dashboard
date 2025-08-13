"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CompanyWizardShell } from "@/components/onboarding/CompanyWizardShell";
import { StepIndicator } from "@/components/onboarding/StepIndicator";
import { StepBasics } from "@/components/onboarding/StepBasics";
import { StepLocation } from "@/components/onboarding/StepLocation";
import { StepSizeFinances } from "@/components/onboarding/StepSizeFinances";
import { StepReview } from "@/components/onboarding/StepReview";
import { NavigationButtons } from "@/components/onboarding/NavigationButtons";

import { useGetCompany } from "@/api/companies/queries";
import { useUpsertFoundational } from "@/api/companies/mutations";
import type {CompanyCreateRequest, CompanyResponse } from "@/types/companies";

import { api } from "@/lib/api";
import { buildSitePayload } from "@/lib/site-payload";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";

// ------------------------------
// Local types mirroring the wizard
// ------------------------------
interface BasicsData {
  companyName: string; // read-only, from auth context
  legalForm: string;   // UI codes: "llc" | "sole_proprietorship" | ...
  sector: string;      // "A".."U"
}

interface SiteLocation {
  id: string;
  country: string; // ISO alpha-2
  city: string;
  description: string;
}

interface LocationData {
  headquartersCountry: string; // ISO alpha-2
  siteLocations: SiteLocation[];
}

interface SizeFinancesData {
  employeeCount: string;  // "min-max" or "N+"
  annualTurnover: string; // user-typed, may include commas
  currency: string;       // will be uppercased
}

interface FormData {
  basics: BasicsData;
  location: LocationData;
  sizeFinances: SizeFinancesData;
}

interface FormErrors {
  basics?: Partial<Record<keyof BasicsData, string>>;
  location?: Partial<Record<keyof LocationData, string>>;
  sizeFinances?: Partial<Record<keyof SizeFinancesData, string>>;
}

// ------------------------------
// Steps
// ------------------------------
const steps = [
  { id: 1, title: "Company Basics", description: "Name, legal form, and sector" },
  { id: 2, title: "Locations", description: "Headquarters and site locations" },
  { id: 3, title: "Size & Finances", description: "Employee count and turnover" },
  { id: 4, title: "Review", description: "Confirm your information" },
];

// ------------------------------
// Helpers for review rendering
// ------------------------------
function mapPrismaLegalToUi(value: CompanyResponse["legalForm"]): string {
  switch (value) {
    case "PRIVATE_LIMITED":
      return "llc";
    case "SOLE_PROPRIETORSHIP":
      return "sole_proprietorship";
    case "PARTNERSHIP":
      return "partnership";
    case "COOPERATIVE":
      return "cooperative";
    case "OTHER":
    default:
      return "other";
  }
}

function toUiEmployeeRange(range: string | null, min: number | null, max: number | null): string {
  if (range) {
    const m = /^(\d+)-(\d+)$/.exec(range);
    if (m) {
      const rMin = Number(m[1]);
      const rMax = Number(m[2]);
      if (rMax === 99999999) return `${rMin}+`;
      return range;
    }
    return range;
  }
  if (min != null && max != null) {
    if (max === 99999999) return `${min}+`;
    return `${min}-${max}`;
  }
  return "";
}

function toReviewDataFromCompany(c: CompanyResponse) {
  return {
    basics: {
      companyName: c.name ?? "",
      legalForm: mapPrismaLegalToUi(c.legalForm),
      sector: c.sector ?? "",
    },
    location: {
      headquartersCountry: c.hqCountry ?? "",
      siteLocations: [], // sites are a separate resource
    },
    sizeFinances: {
      employeeCount: toUiEmployeeRange(c.employeeCountRange, c.employeeCountMin, c.employeeCountMax),
      annualTurnover: c.annualTurnover ?? "",
      currency: c.reportingCurrency ?? "",
    },
  };
}

// ------------------------------
// Payload helpers for upsertFoundational
// (backend expects employeeCount as "min-max" string)
// ------------------------------
function mapUiLegalToPrisma(
    ui: string | undefined
  ): CompanyCreateRequest["legalForm"] {
    if (!ui) return undefined;
    switch (ui) {
      case "llc":
        return "PRIVATE_LIMITED";
      case "sole_proprietorship":
        return "SOLE_PROPRIETORSHIP";
      case "partnership":
        return "PARTNERSHIP";
      case "cooperative":
        return "COOPERATIVE";
      // "corporation", "nonprofit", "other" or anything else → OTHER
      default:
        return "OTHER";
    }
  }

function sanitizeTurnover(input: string): CompanyCreateRequest["annualTurnover"] {
  if (!input) return undefined;
  const numeric = Number(input.replace(/[^0-9.]/g, ""));
  if (!Number.isFinite(numeric)) return undefined;
  return Math.max(0, numeric);
}

function toEmployeeCountMinMaxString(ui: string): string | undefined {
  if (!ui) return undefined;
  // "N+"
  if (/\+$/.test(ui)) {
    const n = parseInt(ui.replace("+", ""), 10);
    if (Number.isFinite(n)) return `${n}-99999999`;
  }
  // "min-max"
  const m = ui.match(/^\s*(\d+)\s*-\s*(\d+)\s*$/);
  if (m) {
    const a = parseInt(m[1], 10);
    const b = parseInt(m[2], 10);
    if (Number.isFinite(a) && Number.isFinite(b) && a >= 0 && b >= 0) {
      return `${a}-${b}`;
    }
  }
  return undefined;
}

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
    return null; // prevent any actions while redirecting or loading
  }

  const activeCompanyId = authCompany?.id ?? null;

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FormData>({
    basics: { companyName: authCompany?.name ?? "", legalForm: "", sector: "" },
    location: { headquartersCountry: "", siteLocations: [] },
    sizeFinances: { employeeCount: "", annualTurnover: "", currency: "" },
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isCreatingSites, setIsCreatingSites] = useState(false);

  // Smooth-scroll sentinel
  const stepTopRef = useRef<HTMLDivElement | null>(null);

  // Keep read-only company name in sync if it ever changes in auth context
  useEffect(() => {
    const name = authCompany?.name ?? "";
    setFormData((prev) =>
      prev.basics.companyName === name
        ? prev
        : { ...prev, basics: { ...prev.basics, companyName: name } }
    );
  }, [authCompany?.name]);

  // Mutations (now using upsertFoundational)
  const upsertFoundational = useUpsertFoundational(activeCompanyId!);

  // Step 4: fetch backend-truth for review
  const { data: companyDetail, isLoading: isCompanyLoading } = useGetCompany(activeCompanyId ?? "");

  // Smooth scroll to top whenever the step changes
  useEffect(() => {
    const el = stepTopRef.current;
    if (el?.scrollIntoView) el.scrollIntoView({ behavior: "smooth", block: "start" });
    else window?.scrollTo?.({ top: 0, behavior: "smooth" });
  }, [currentStep]);

  // ---------- Validation ----------
  const validateStep = (step: number): boolean => {
    const newErrors: FormErrors = { ...errors };

    switch (step) {
      case 1: {
        // companyName is read-only
        newErrors.basics = {};
        if (!formData.basics.legalForm) newErrors.basics.legalForm = "Legal form is required";
        if (!formData.basics.sector) newErrors.basics.sector = "Primary sector is required";
        break;
      }
      case 2: {
        newErrors.location = {};
        if (!formData.location.headquartersCountry) {
          newErrors.location.headquartersCountry = "Headquarters country is required";
        }
        break;
      }
      case 3: {
        newErrors.sizeFinances = {};
        if (!formData.sizeFinances.employeeCount) newErrors.sizeFinances.employeeCount = "Employee count is required";
        if (!formData.sizeFinances.currency) newErrors.sizeFinances.currency = "Currency is required";
        if (!formData.sizeFinances.annualTurnover.trim()) {
          newErrors.sizeFinances.annualTurnover = "Annual turnover is required";
        }
        break;
      }
    }

    setErrors(newErrors);
    const stepKey = step === 1 ? "basics" : step === 2 ? "location" : "sizeFinances";
    const stepErrors = newErrors[stepKey as keyof FormErrors] as Record<string, string> | undefined;
    return !stepErrors || Object.keys(stepErrors).length === 0;
  };

  const canProceed = (): boolean => {
    if (currentStep === 4) return true;
    switch (currentStep) {
      case 1:
        return !!(formData.basics.legalForm && formData.basics.sector);
      case 2:
        return !!formData.location.headquartersCountry;
      case 3:
        return !!(
          formData.sizeFinances.employeeCount &&
          formData.sizeFinances.currency &&
          formData.sizeFinances.annualTurnover.trim()
        );
      default:
        return false;
    }
  };

  // ---------- Navigation ----------
  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep((prev) => Math.min(prev + 1, steps.length));
    }
  };

  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const handleStepClick = (step: number) => {
    if (step <= currentStep) setCurrentStep(step);
  };

  // ---------- Sites creation (post-upsert) ----------
  async function createSitesForCompany(companyId: string) {
    const sites = formData.location.siteLocations ?? [];
    if (!sites.length) return;

    setIsCreatingSites(true);
    try {
      const requests = sites.map((s) => {
        const payload = buildSitePayload(s);
        return api.post(`/companies/${companyId}/sites`, payload);
      });

      const results = await Promise.allSettled(requests);
      const failures = results.filter((r) => r.status === "rejected");

      // Invalidate potential sites list query
      await queryClient.invalidateQueries({ queryKey: ["sites", "list", companyId] });

      if (failures.length) {
        console.warn("Some sites failed to create:", failures);
        toast.warning(`Saved core details, but ${failures.length} site(s) failed. You can add them later.`);
      } else {
        toast.success("All sites saved");
      }
    } finally {
      setIsCreatingSites(false);
    }
  }

  // ---------- Step 3: Complete Setup → upsertFoundational + sites ----------
  const handleSubmitStep3 = async () => {
    if (!validateStep(3) || !activeCompanyId) return;

    // Build minimal payload for /companies/:id/foundational
    const payload = {
      legalForm: mapUiLegalToPrisma(formData.basics.legalForm),
      sector: formData.basics.sector || undefined,
      // leave naceCode empty for now
      hqCountry: formData.location.headquartersCountry || undefined,
      reportingCurrency: formData.sizeFinances.currency?.toUpperCase() || undefined,
      annualTurnover: sanitizeTurnover(formData.sizeFinances.annualTurnover),
      employeeCount: toEmployeeCountMinMaxString(formData.sizeFinances.employeeCount),
    };

    try {
      await upsertFoundational.mutateAsync(payload);


      // Optionally create sites under this company
      await createSitesForCompany(activeCompanyId);

      // Move to review; detail query will show backend truth
      setCurrentStep(4);

      // Keep cache warm
      await queryClient.invalidateQueries({ queryKey: ["companies", "detail", activeCompanyId] });
      await queryClient.invalidateQueries({ queryKey: ["companies", "list"] });
    } catch {
      // Errors normalized inside the mutation onError handler
    }
  };

  // ---------- Step 4 action ----------
  const handleFinish = () => {
    router.push("/dashboard");
  };

  // ---------- Update helpers ----------
  const updateBasics = (data: BasicsData) => {
    setFormData((prev) => ({
      ...prev,
      basics: {
        ...prev.basics,
        companyName: prev.basics.companyName, // keep read-only
        legalForm: data.legalForm,
        sector: data.sector,
      },
    }));
    setErrors((prev) => ({ ...prev, basics: {} }));
  };

  const updateLocation = (data: LocationData) => {
    setFormData((prev) => ({ ...prev, location: data }));
    setErrors((prev) => ({ ...prev, location: {} }));
  };

  const updateSizeFinances = (data: SizeFinancesData) => {
    setFormData((prev) => ({ ...prev, sizeFinances: data }));
    setErrors((prev) => ({ ...prev, sizeFinances: {} }));
  };

  // ---------- Titles ----------
  const getStepTitle = () => steps.find((s) => s.id === currentStep)?.title || "Company Onboarding";
  const getStepSubtitle = () => steps.find((s) => s.id === currentStep)?.description;

  // ---------- Review data ----------
  const reviewData = useMemo(() => {
    if (companyDetail) return toReviewDataFromCompany(companyDetail);
    return formData;
  }, [companyDetail, formData]);

  // ---------- Render ----------
  const nextLabel = currentStep === 3 ? "Complete Setup" : "Next";
  const primaryOnClick = currentStep === 3 ? handleSubmitStep3 : handleNext;

  const isBusy =
    upsertFoundational.isPending ||
    isCreatingSites ||
    (currentStep === 4 && isCompanyLoading);

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
            return <StepBasics data={formData.basics} onChange={updateBasics} errors={errors.basics} />;
          case 2:
            return <StepLocation data={formData.location} onChange={updateLocation} errors={errors.location} />;
          case 3:
            return (
              <StepSizeFinances
                data={formData.sizeFinances}
                onChange={updateSizeFinances}
                errors={errors.sizeFinances}
              />
            );
          case 4:
            return <StepReview data={reviewData as any} onEdit={setCurrentStep} isSubmitting={isCompanyLoading} />;
          default:
            return null;
        }
      })()}

      <NavigationButtons
        onBack={handleBack}
        onNext={primaryOnClick}
        onSubmit={handleFinish}              // only used on step 4
        nextLabel={nextLabel}               // "Complete Setup" on step 3
        submitLabel="Go to Dashboard"
        isFirstStep={currentStep === 1}
        isLastStep={currentStep === steps.length}
        isLoading={isBusy}
        canProceed={canProceed()}
      />
    </CompanyWizardShell>
  );
}
