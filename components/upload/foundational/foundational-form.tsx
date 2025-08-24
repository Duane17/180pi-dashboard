// components/upload/foundational-form.tsx
"use client";

import { useMemo, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

// --- Schemas & Types ---
import {
  foundationalFormSchema,
  type FoundationalFormValues,
  type CompanyBasicsValues,
  type IdentifiersValues,
  type HeadquartersValues,
  type RegisteredOfficeValues,
  type FinancialsValues,
  type ValueChainValues,
  type SupplyChainContextValues,
  type FirstRestatementValues,
} from "@/schemas/foundational.schemas";

// --- Implemented cards ---
import { SaveBar } from "@/components/upload/foundational/save-bar";
import { CompanyBasicsCard } from "@/components/upload/foundational/company-basics-card";
import { IdentifiersCard } from "@/components/upload/foundational/identifiers-card";
import { HeadquartersCard } from "@/components/upload/foundational/headquarters-card";
import { RegisteredOfficeCard } from "@/components/upload/foundational/registered-office-card";
import { FinancialsCard } from "@/components/upload/foundational/financials-card";
import { ValueChainCard } from "@/components/upload/foundational/value-chain-card";
import { SupplyChainContextCard } from "@/components/upload/foundational/supply-chain-context-card";
import { AlignmentsContextCard } from "@/components/upload/foundational/alignments-context-card";
import { DisclosurePeriodsCard } from "@/components/upload/foundational/disclosure-periods-card";
import { DisclosureContactCard } from "@/components/upload/foundational/disclosure-contact-card";
import { FirstRestatementCard } from "@/components/upload/foundational/first-restatement-card";
import { DocumentsCard } from "@/components/upload/foundational/document-card";

// --- Mutable defaults factory (avoids readonly[]) ---
import { createFoundationalDefaults } from "@/constants/foundational.constants";

export interface FoundationalFormProps {
  onSubmit: (values: FoundationalFormValues) => void;
  onCancel?: () => void;
}

// utility: pluck flat error messages for a section
function sectionErrors<T extends object>(err: any, keys: Array<keyof T>) {
  const out: Partial<Record<keyof T, string | undefined>> = {};
  for (const k of keys) out[k] = err?.[k]?.message as string | undefined;
  return out;
}

/**
 * Phase 1: local form + Zod validation, no API calls.
 * Uses mutable defaults to satisfy RHF's `defaultValues` typing.
 * Includes implemented cards; adapters bridge any minor shape differences.
 */
export function FoundationalForm({ onSubmit, onCancel }: FoundationalFormProps) {
  const [validated, setValidated] = useState(false);

  // IMPORTANT: create fresh, mutable defaults (no readonly arrays)
  const defaultValues = useMemo<FoundationalFormValues>(() => createFoundationalDefaults(), []);

  const form = useForm<FoundationalFormValues>({
    resolver: zodResolver(foundationalFormSchema),
    mode: "onChange",
    defaultValues,
  });

  const {
    handleSubmit,
    trigger,
    formState: { isDirty, isSubmitting, errors },
    setValue,
    watch,
  } = form;

  const values = watch();

  const onValidateClick = async () => {
    const ok = await trigger();
    setValidated(true);
    return ok;
  };

  const onSaveClick = handleSubmit((vals) => onSubmit(vals));

  // helpers to update sections immutably and mark dirty
  const updateCompanyBasics = (partial: Partial<CompanyBasicsValues>) =>
    setValue("companyBasics", { ...values.companyBasics, ...partial }, { shouldDirty: true });

  const updateIdentifiers = (partial: Partial<IdentifiersValues>) =>
    setValue("identifiers", { ...values.identifiers, ...partial }, { shouldDirty: true });

  const updateHQ = (partial: Partial<HeadquartersValues>) =>
    setValue("headquarters", { ...values.headquarters, ...partial }, { shouldDirty: true });

  const updateRegisteredOffice = (partial: Partial<RegisteredOfficeValues>) =>
    setValue("registeredOffice", { ...values.registeredOffice, ...partial }, { shouldDirty: true });

  const updateFinancials = (partial: Partial<FinancialsValues>) =>
    setValue("financials", { ...values.financials, ...partial }, { shouldDirty: true });

  const updateValueChain = (partial: Partial<ValueChainValues>) =>
    setValue("valueChain", { ...values.valueChain, ...partial }, { shouldDirty: true });

  const updateSupplyChain = (partial: Partial<SupplyChainContextValues>) =>
    setValue("supplyChain", { ...values.supplyChain, ...partial }, { shouldDirty: true });

  const updateFirstRestatement = (partial: Partial<FirstRestatementValues>) =>
    setValue("firstRestatement", { ...values.firstRestatement, ...partial }, { shouldDirty: true });

  // -------------------------------
  // Adapters for cards with local shapes
  // -------------------------------

  // AlignmentsContextCard adapter (card expects { alignmentFrameworks?: string[]; notes?: string })
  const alignmentsValue = {
    alignmentFrameworks: [
      ...(values.alignments.sdgCodes ?? []),
      ...(values.alignments.alignmentFlags ?? []),
    ].map(String),
    notes: values.alignments.alignmentDetails ?? "",
  };
  const onAlignmentsChange = (partial: { alignmentFrameworks?: string[]; notes?: string }) => {
    const next = { ...values.alignments };
    if (partial.notes !== undefined) {
      next.alignmentDetails = partial.notes;
    }
    if (partial.alignmentFrameworks) {
      // naive split: SDG-looking codes to sdgCodes; everything else to alignmentFlags
      const sdgs = partial.alignmentFrameworks.filter((x) => /^SDG\d{1,2}$/i.test(x));
      const flags = partial.alignmentFrameworks.filter((x) => !/^SDG\d{1,2}$/i.test(x));
      next.sdgCodes = sdgs;
      next.alignmentFlags = flags as any;
    }
    setValue("alignments", next, { shouldDirty: true });
  };

  // DisclosurePeriodsCard adapter (card expects { reportingPeriodStart?: string; reportingPeriodEnd?: string })
  const fmtDate = (d?: Date) => (d ? new Date(d).toISOString().slice(0, 10) : "");
  const periodsValue = {
    reportingPeriodStart: fmtDate(values.disclosurePeriods.sustainabilityPeriodStart),
    reportingPeriodEnd: fmtDate(values.disclosurePeriods.sustainabilityPeriodEnd),
  };
  const onPeriodsChange = (partial: { reportingPeriodStart?: string; reportingPeriodEnd?: string }) => {
    const next = { ...values.disclosurePeriods };
    if (partial.reportingPeriodStart !== undefined) {
      next.sustainabilityPeriodStart = partial.reportingPeriodStart
        ? new Date(partial.reportingPeriodStart)
        : undefined;
    }
    if (partial.reportingPeriodEnd !== undefined) {
      next.sustainabilityPeriodEnd = partial.reportingPeriodEnd
        ? new Date(partial.reportingPeriodEnd)
        : undefined;
    }
    setValue("disclosurePeriods", next, { shouldDirty: true });
  };

  // DisclosureContactCard adapter (card expects { contactName?, contactEmail?, contactPhone? })
  const contactValue = {
    contactName: values.disclosureContact.contactName ?? "",
    contactEmail: values.disclosureContact.contactEmail ?? "",
    // phone not modeled in schema (ignored for now)
    contactPhone: "",
  };
  const onContactChange = (partial: { contactName?: string; contactEmail?: string; contactPhone?: string }) => {
    const next = { ...values.disclosureContact };
    if (partial.contactName !== undefined) next.contactName = partial.contactName;
    if (partial.contactEmail !== undefined) next.contactEmail = partial.contactEmail;
    // contactPhone intentionally ignored in schema for Phase 1
    setValue("disclosureContact", next, { shouldDirty: true });
  };

  // DocumentsCard handlers (summary-only view)
  const handleRemoveDocument = (type: "registration" | "previous", index?: number) => {
    if (type === "registration") {
      setValue("documents", { ...values.documents, registrationCertFile: undefined }, { shouldDirty: true });
      return;
    }
    if (type === "previous" && typeof index === "number") {
      const current = values.documents.previousReportFiles ?? [];
      const next = current.filter((_, i) => i !== index);
      setValue("documents", { ...values.documents, previousReportFiles: next }, { shouldDirty: true });
    }
  };

  return (
    <FormProvider {...form}>
      <div className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur-xl shadow-xl">
        {/* Header */}
        <div className="px-6 py-5 border-b border-white/20">
          <h2 className="text-xl font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
            Foundational Information
          </h2>
          <p className="mt-1 text-sm text-gray-700">
            Capture your company’s foundational details.
          </p>
        </div>

        {/* Body */}
        <form
          className="px-6 py-6 space-y-8"
          onSubmit={(e) => {
            e.preventDefault();
          }}
        >
          {/* Company section */}
          <div className="grid grid-cols-1 gap-6">
            <CompanyBasicsCard
              value={values.companyBasics}
              onChange={updateCompanyBasics}
              errors={sectionErrors<typeof values.companyBasics>(errors?.companyBasics, [
                "legalForm",
                "isPublic",
                "reportingCurrency",
                "smeClass",
                "employeeCount",
              ])}
            />

            <IdentifiersCard
              value={values.identifiers}
              onChange={updateIdentifiers}
              errors={sectionErrors<typeof values.identifiers>(errors?.identifiers, [
                "lei",
                "duns",
                "euId",
                "permId",
              ])}
            />

            <HeadquartersCard
              value={values.headquarters}
              onChange={updateHQ}
              errors={sectionErrors<typeof values.headquarters>(errors?.headquarters, [
                "hqCountry",
                "hqRegion",
                "hqCity",
                "hqAddress",
                "hqLatitude",
                "hqLongitude",
              ])}
            />

            <RegisteredOfficeCard
              value={values.registeredOffice}
              onChange={updateRegisteredOffice}
              errors={sectionErrors<typeof values.registeredOffice>(errors?.registeredOffice, [
                "registeredCountry",
                "registeredRegion",
                "registeredCity",
                "registeredAddress",
                "registeredZip",
              ])}
            />

            <FinancialsCard
              value={values.financials}
              onChange={updateFinancials}
              errors={sectionErrors<typeof values.financials>(errors?.financials, [
                "annualTurnover",
                "balanceSheetTotal",
              ])}
            />
          </div>

          {/* Context */}
          <div className="grid grid-cols-1 gap-6">
            <ValueChainCard
              value={values.valueChain}
              onChange={updateValueChain}
              errors={sectionErrors<typeof values.valueChain>(errors?.valueChain, [
                "valueChainScopes",
                "businessRelations",
              ])}
            />

            <SupplyChainContextCard
              value={values.supplyChain}
              onChange={updateSupplyChain}
              errors={sectionErrors<typeof values.supplyChain>(errors?.supplyChain, [
                "isInMNCChain",
                "parentName",
                "parentLocation",
                "parentUrl",
              ])}
            />

            {/* Alignments (adapter) */}
            <AlignmentsContextCard
              value={alignmentsValue}
              onChange={onAlignmentsChange}
              errors={{
                notes: (errors?.alignments as any)?.alignmentDetails?.message,
                alignmentFrameworks:
                  (errors?.alignments as any)?.sdgCodes?.message ??
                  (errors?.alignments as any)?.alignmentFlags?.message,
              }}
            />
          </div>

          {/* Disclosure */}
          <div className="grid grid-cols-1 gap-6">
            <DisclosurePeriodsCard
              value={periodsValue}
              onChange={onPeriodsChange}
              errors={{
                reportingPeriodStart: (errors?.disclosurePeriods as any)?.sustainabilityPeriodStart?.message,
                reportingPeriodEnd: (errors?.disclosurePeriods as any)?.sustainabilityPeriodEnd?.message,
              }}
            />

            <DisclosureContactCard
              value={contactValue}
              onChange={onContactChange}
              errors={{
                contactName: (errors?.disclosureContact as any)?.contactName?.message,
                contactEmail: (errors?.disclosureContact as any)?.contactEmail?.message,
              }}
            />

            {/* First-time / Restatement */}
            <FirstRestatementCard
              value={values.firstRestatement}
              onChange={updateFirstRestatement}
              errors={sectionErrors<typeof values.firstRestatement>(errors?.firstRestatement, [
                "isFirstReport",
                "isRestated",
                "restatementReasons",
                "restatementNotes",
              ])}
            />

            {/* Documents (summary-only in Phase 1) */}
            <DocumentsCard
              registrationCertFile={values.documents.registrationCertFile}
              previousReportFiles={values.documents.previousReportFiles}
              onRemove={handleRemoveDocument}
            />
          </div>

          {/* Validate button (gradient) */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onValidateClick}
              className="px-4 py-2 bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium rounded-lg hover:shadow-lg transition-all duration-200 disabled:opacity-50"
              disabled={isSubmitting}
            >
              Validate
            </button>
          </div>

          {/* Sticky Save/Cancel */}
          <SaveBar
            dirty={isDirty}
            submitting={isSubmitting}
            onSave={onSaveClick}
            onCancel={onCancel}
          />
        </form>
      </div>
    </FormProvider>
  );
}
