"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

// Reuse your existing schema types
import type {
  FoundationalFormValues,
  CompanyBasicsValues,
  HeadquartersValues,
  RegisteredOfficeValues,
  FinancialsValues,
  ValueChainValues,
  SupplyChainContextValues,
  FirstRestatementValues,
  DisclosurePeriodsValues,
  SustainabilityGovernanceValues
} from "@/schemas/foundational.schemas";

import type {
  SustainabilityGovernanceValues as SustainabilityGovernanceUIValues,
} from "@/components/upload/foundational/sustainability-governance-card";


// Implemented cards (unchanged)
import { CompanyBasicsCard } from "@/components/upload/foundational/company-basics-card";
import { HeadquartersCard } from "@/components/upload/foundational/headquarters-card";
import { RegisteredOfficeCard } from "@/components/upload/foundational/registered-office-card";
import { FinancialsCard } from "@/components/upload/foundational/financials-card";
import { SupplyChainContextCard } from "@/components/upload/foundational/supply-chain-context-card";
import { DisclosureContactCard } from "@/components/upload/foundational/disclosure-contact-card";
import { DocumentsCard } from "@/components/upload/foundational/document-card";
import { DisclosureAndRestatementCard } from "@/components/upload/foundational/disclosure-statement-card";
import { OperatingCountriesCard } from "../foundational/operations-countries-card";
import { SustainabilityGovernanceCard } from "../foundational/sustainability-governance-card";

// Wizard form values must include: { general: FoundationalFormValues; environment: …; social: …; governance: … }
type ESGWizardValues = {
  general: FoundationalFormValues;
  environment: Record<string, unknown>;
  social: Record<string, unknown>;
  governance: Record<string, unknown>;
};

// utility: pluck flat error messages for a section
function sectionErrors<T extends object>(err: any, keys: Array<keyof T>) {
  const out: Partial<Record<keyof T, string | undefined>> = {};
  for (const k of keys) out[k] = err?.[k]?.message as string | undefined;
  return out;
}

export function GeneralStep() {
  // Consume the wizard’s RHF instance
  const {
    setValue,
    watch,
    formState: { errors },
  } = useFormContext<ESGWizardValues>();

  // All reading/writing happens under 'general.*'
  const values = watch("general");

  // Guards in case values are not yet hydrated
  const safeGeneral = useMemo<FoundationalFormValues>(
    () =>
      values ?? {
        companyBasics: {},
        identifiers: {},
        headquarters: {},
        registeredOffice: {},
        financials: {},
        valueChain: {},
        supplyChain: {},
        alignments: {},
        disclosurePeriods: {},
        disclosureContact: {},
        firstRestatement: {},
        documents: {},
        sustainabilityGovernance: {},

      },
    [values]
  );

  const operations = (safeGeneral as any).operations ?? { countries: [] };

  // -------------------------------
  // Update helpers: write to general.*
  // -------------------------------
  const toISODate = (d?: string | Date) =>
    typeof d === "string" ? d : d ? new Date(d).toISOString().slice(0, 10) : undefined;

  

  const updateCompanyBasics = (partial: Partial<CompanyBasicsValues>) =>
    setValue(
      "general.companyBasics",
      { ...safeGeneral.companyBasics, ...partial },
      { shouldDirty: true }
    );


  const updateOperations = (partial: { countries?: string[] }) => {
    const current = (safeGeneral as any).operations ?? { countries: [] };
    setValue(
      "general" as any,
      { ...safeGeneral, operations: { ...current, ...partial } },
      { shouldDirty: true }
    );
  };

  const updateHQ = (partial: Partial<HeadquartersValues>) =>
    setValue(
      "general.headquarters",
      { ...safeGeneral.headquarters, ...partial },
      { shouldDirty: true }
    );

  const updateRegisteredOffice = (partial: Partial<RegisteredOfficeValues>) =>
    setValue(
      "general.registeredOffice",
      { ...safeGeneral.registeredOffice, ...partial },
      { shouldDirty: true }
    );

  const updateSustainabilityGovernance = (
  partial: Partial<SustainabilityGovernanceUIValues>
) =>
  setValue(
    "general.sustainabilityGovernance" as any,
    { ...(safeGeneral as any).sustainabilityGovernance, ...partial },
    { shouldDirty: true }
  );

  const updateFinancials = (partial: Partial<FinancialsValues>) =>
    setValue(
      "general.financials",
      { ...safeGeneral.financials, ...partial },
      { shouldDirty: true }
    );

  const updateValueChain = (partial: Partial<ValueChainValues>) =>
    setValue(
      "general.valueChain",
      { ...safeGeneral.valueChain, ...partial },
      { shouldDirty: true }
    );

  const updateSupplyChain = (partial: Partial<SupplyChainContextValues>) =>
    setValue(
      "general.supplyChain",
      { ...safeGeneral.supplyChain, ...partial },
      { shouldDirty: true }
    );

  const updateDocuments = (patch: { registrationCertFile?: File | undefined | null; previousReportFiles?: File[] }) => {
    const next = { ...safeGeneral.documents };

    if ("registrationCertFile" in patch) {
      next.registrationCertFile = (patch.registrationCertFile ?? undefined) as any;
    }
    if ("previousReportFiles" in patch && Array.isArray(patch.previousReportFiles)) {
      next.previousReportFiles = patch.previousReportFiles;
    }

    setValue("general.documents", next, { shouldDirty: true });
  };


  const sgRaw = (safeGeneral as any).sustainabilityGovernance ?? {};
  const sgValue: SustainabilityGovernanceUIValues = {
    ...sgRaw,
    certification: sgRaw.certification
      ? { ...sgRaw.certification, issuingDate: toISODate(sgRaw.certification.issuingDate) }
      : undefined,
    audit: sgRaw.audit
      ? { ...sgRaw.audit, issuingDate: toISODate(sgRaw.audit.issuingDate) }
      : undefined,
  };


  // DisclosurePeriodsCard adapter (Date-based per schema)
  // Normalize disclosure periods for <input type="date">
  const periodsValue: DisclosurePeriodsValues = {
    ...safeGeneral.disclosurePeriods,
    sustainabilityPeriodStart: toISODate(safeGeneral.disclosurePeriods?.sustainabilityPeriodStart as any),
    sustainabilityPeriodEnd:   toISODate(safeGeneral.disclosurePeriods?.sustainabilityPeriodEnd as any),
    financialPeriodStart:      toISODate(safeGeneral.disclosurePeriods?.financialPeriodStart as any),
    financialPeriodEnd:        toISODate(safeGeneral.disclosurePeriods?.financialPeriodEnd as any),
    dateOfInformation:         toISODate(safeGeneral.disclosurePeriods?.dateOfInformation as any),
  };


  const onPeriodsChange = (partial: Partial<DisclosurePeriodsValues>) => {
    setValue(
      "general.disclosurePeriods",
      { ...safeGeneral.disclosurePeriods, ...partial },
      { shouldDirty: true }
    );
  };

  // DisclosureContactCard adapter
  const contactValue = {
    contactName: safeGeneral.disclosureContact.contactName ?? "",
    contactEmail: safeGeneral.disclosureContact.contactEmail ?? "",
    contactRole:  (safeGeneral as any).disclosureContact?.contactRole ?? "",
  };
  const onContactChange = (partial: { contactName?: string; contactEmail?: string; contactRole?: string; }) => {
    const next = { ...safeGeneral.disclosureContact };
    if (partial.contactName !== undefined) next.contactName = partial.contactName;
    if (partial.contactEmail !== undefined) next.contactEmail = partial.contactEmail;
    if (partial.contactRole  !== undefined) (next as any).contactRole = partial.contactRole;
    setValue("general.disclosureContact", next, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
  };

  // Documents handlers
  const handleRemoveDocument = (type: "registration" | "previous", index?: number) => {
    if (type === "registration") {
      setValue(
        "general.documents",
        { ...safeGeneral.documents, registrationCertFile: undefined },
        { shouldDirty: true }
      );
      return;
    }
    if (type === "previous" && typeof index === "number") {
      const current = safeGeneral.documents.previousReportFiles ?? [];
      const next = current.filter((_, i) => i !== index);
      setValue(
        "general.documents",
        { ...safeGeneral.documents, previousReportFiles: next },
        { shouldDirty: true }
      );
    }
  };

  // -------------------------------
  // Errors: now under errors.general.*
  // -------------------------------
  const gErrors = (errors?.general ?? {}) as any;

  return (
    <div className="rounded-2xl border border-white/20 bg-white/30 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="px-6 py-5 border-b border-white/20">
        <h2 className="text-xl font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          General Information
        </h2>
        <p className="mt-1 text-sm text-gray-700">
          Capture your company’s foundational details.
        </p>
      </div>

      {/* Body (no <form> here; the wizard owns the form) */}
      <div className="px-6 py-6 space-y-8">
        {/* Company section */}
        <div className="grid grid-cols-1 gap-6">
          <CompanyBasicsCard
            value={safeGeneral.companyBasics}
            onChange={updateCompanyBasics}
            errors={sectionErrors<typeof safeGeneral.companyBasics>(gErrors?.companyBasics, [
              "legalForm",
              "ownershipNature",
              "reportingCurrency",
              "smeClass",
              "naceCode",
              "employeeCount",
            ])}
          />

          <HeadquartersCard
            value={safeGeneral.headquarters}
            onChange={updateHQ}
            errors={sectionErrors<typeof safeGeneral.headquarters>(gErrors?.headquarters, [
              "hqCountry",
              "hqRegion",
              "hqCity",
              "hqAddress",
              "hqLatitude",
              "hqLongitude",
            ])}
          />

          <RegisteredOfficeCard
            value={safeGeneral.registeredOffice}
            onChange={updateRegisteredOffice}
            errors={sectionErrors<typeof safeGeneral.registeredOffice>(gErrors?.registeredOffice, [
              "registeredCountry",
              "registeredRegion",
              "registeredCity",
              "registeredAddress",
              "registeredZip",
            ])}
          />

          <OperatingCountriesCard
            value={operations}
            onChange={updateOperations}
            errors={
              {
                countries: (errors?.general as any)?.operations?.countries?.message,
              } as any
            }
          />

          <FinancialsCard
            value={safeGeneral.financials}
            onChange={updateFinancials}
            errors={sectionErrors<typeof safeGeneral.financials>(gErrors?.financials, [
              "annualTurnover",
              "balanceSheetTotal",
            ])}
          />
        </div>

        {/* Context */}
        <div className="grid grid-cols-1 gap-6">
          <SupplyChainContextCard
            value={safeGeneral.supplyChain}
            onChange={updateSupplyChain}
            errors={sectionErrors<typeof safeGeneral.supplyChain>(gErrors?.supplyChain, [
              "isInMNCChain",
              "parentName",
              "parentLocation",
              "parentUrl",
            ])}
          />
        </div>

        {/* Disclosure */}
        <div className="grid grid-cols-1 gap-6">
          <DisclosureAndRestatementCard
            value={{
              disclosurePeriods: periodsValue,
              firstRestatement: safeGeneral.firstRestatement,
            }}
            onChange={(partial) => {
              const next = { ...safeGeneral };
              if (partial.disclosurePeriods) next.disclosurePeriods = partial.disclosurePeriods;
              if (partial.firstRestatement) next.firstRestatement = partial.firstRestatement;
              setValue("general", next, { shouldDirty: true });
            }}
            errors={{
              disclosurePeriods: {
                sustainabilityPeriodStart: gErrors?.disclosurePeriods?.sustainabilityPeriodStart?.message,
                sustainabilityPeriodEnd: gErrors?.disclosurePeriods?.sustainabilityPeriodEnd?.message,
                financialPeriodStart: gErrors?.disclosurePeriods?.financialPeriodStart?.message,
                financialPeriodEnd: gErrors?.disclosurePeriods?.financialPeriodEnd?.message,
                periodDifferenceReason: gErrors?.disclosurePeriods?.periodDifferenceReason?.message,
                dateOfInformation: gErrors?.disclosurePeriods?.dateOfInformation?.message,
              },
              firstRestatement: {
                isFirstReport: gErrors?.firstRestatement?.isFirstReport?.message,
                isRestated: gErrors?.firstRestatement?.isRestated?.message,
                restatementReasons: gErrors?.firstRestatement?.restatementReasons?.message,
                restatementNotes: gErrors?.firstRestatement?.restatementNotes?.message,
              },
            }}
          />


          <DisclosureContactCard
            value={contactValue}
            onChange={onContactChange}
            errors={{
              contactName: gErrors?.disclosureContact?.contactName?.message,
              contactEmail: gErrors?.disclosureContact?.contactEmail?.message,
              contactRole:  (gErrors?.disclosureContact as any)?.contactRole?.message,
            }}
          />

          <SustainabilityGovernanceCard
            value={sgValue}
            onChange={updateSustainabilityGovernance}
            errors={{
              hasSustainabilityCert:
                gErrors?.sustainabilityGovernance?.hasSustainabilityCert?.message,
              draftedPractices:
                gErrors?.sustainabilityGovernance?.draftedPractices?.message,
              arePubliclyAvailable:
                gErrors?.sustainabilityGovernance?.arePubliclyAvailable?.message,
              haveTargets: gErrors?.sustainabilityGovernance?.haveTargets?.message,
              accountableJobTitle:
                gErrors?.sustainabilityGovernance?.accountableJobTitle?.message,
              hasExternalAudit:
                gErrors?.sustainabilityGovernance?.hasExternalAudit?.message,
              policies: gErrors?.sustainabilityGovernance?.policies,
            }}
          />
          
        <DocumentsCard
          registrationCertFile={safeGeneral.documents.registrationCertFile}
          previousReportFiles={safeGeneral.documents.previousReportFiles}
          onRemove={handleRemoveDocument}
          onRegistrationChange={(file) => {
            updateDocuments({ registrationCertFile: file ?? undefined });
          }}
          onPreviousAdd={(newFiles) => {
            const curr = safeGeneral.documents.previousReportFiles ?? [];
            updateDocuments({ previousReportFiles: [...curr, ...newFiles] });
          }}
        />
        </div>
      </div>
    </div>
  );
}
