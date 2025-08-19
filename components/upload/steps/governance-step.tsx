"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";

import type { ESGWizardValues, GovernanceValues } from "@/types/esg-wizard.types";
import {
  OwnershipLegalCard as OwnershipLegalCardImpl,
  type OwnershipLegalValue,
  type ShareholderRow,
  type ShareClassEntry,
} from "../governance/ownership-legal-card";

import { 
  OversightCard, 
  type OversightValue, 
  type OversightBody, 
  type BriefingFrequency, 
  type Approver, 
  type YesNo, 
  type AssuranceLevel } from "../governance/oversight-card";

import { GovernanceBodyCard, type GovernanceBodyValue, type DirectorRow } from "@/components/upload/governance/governance-body-card";


import { 
  CommitteesCard, 
  type CommitteesValue, 
  type CommitteeKey,
  type OneCommitteeValue,
  type DirectorMini, 
} from "@/components/upload/governance/committees-card"; 

import {
  ExecutiveRemunerationCard,
  type ExecutiveRemunerationValue,
} from "@/components/upload/governance/executive-renumeration-card";


import {
  EthicsComplianceCard,
  type EthicsComplianceValue,
} from "@/components/upload/governance/ethics-compliance-card";

import {
  RelatedPartyTransactionsCard,
  type RptValue,
  type RptRow
} from "@/components/upload/governance/related-party-card";

import { AuditorControlsCard, AuditorValue } from "@/components/upload/governance/auditor-controls-card";

import {
  MaterialityStakeholderCard,
  type MaterialityValue,
  type YesNoPlanned,
  type StakeholderKey,
} from "@/components/upload/governance/materiality-stakeholder-card";

import {
  TransparencyReportingCard,
  type TransparencyReportingValue,
  type LinkOrUpload,
} from "@/components/upload/governance/transparency-reporting-card";



/* ------------------------------ Stubs for the remaining cards ------------------------------ */



function TransparencyReportingCardStub() {
  return (
    <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
      Transparency & Reporting (stub)
    </div>
  );
}

/* ------------------------------------ Main step ------------------------------------ */
export function GovernanceStep() {
  const { watch, setValue } = useFormContext<ESGWizardValues>();
  const gov = watch("governance") as GovernanceValues | undefined;

  // ---------- Normalizers ----------
  const ownershipValue = useMemo<OwnershipLegalValue>(() => {
    const src = gov?.ownership;

    return {
      ultimateParent: {
        name: src?.ultimateParent?.name ?? "",
        status: (src?.ultimateParent?.status as "named" | "independent") ?? "named",
      },
      topShareholders: Array.isArray(src?.topShareholders)
        ? src!.topShareholders.map((r) => ({
            id: r?.id ?? undefined,
            name: r?.name ?? "",
            pct:
              r?.pct == null
                ? null
                : Number.isFinite(Number(r.pct))
                ? Number(r.pct)
                : null,
          }))
        : [],
      isListedEquity: !!src?.isListedEquity,
      shareClasses: src?.shareClasses
        ? {
            structure:
              (src.shareClasses.structure as "ordinary" | "dual_class") ??
              "ordinary",
            classes: (src.shareClasses.classes ?? []).map((c) => ({
              name: c?.name ?? "",
              votingRightsPerShare:
                c?.votingRightsPerShare == null
                  ? null
                  : Number.isFinite(Number(c.votingRightsPerShare))
                  ? Number(c.votingRightsPerShare)
                  : null,
              notes: c?.notes ?? "",
            })),
            dualClassNotes: src.shareClasses.dualClassNotes ?? "",
          }
        : { structure: "ordinary", classes: [] },
      controlFeatures: src?.controlFeatures
        ? {
            hasControlFeatures: !!src.controlFeatures.hasControlFeatures,
            description: src.controlFeatures.description ?? "",
          }
        : { hasControlFeatures: false, description: "" },
    };
  }, [gov?.ownership]);

  
    const bodyValue = useMemo<GovernanceBodyValue>(() => {
    const src = gov?.body;
    return {
        highestBodyName: src?.highestBodyName ?? "",
        chairCeoRoles: (src?.chairCeoRoles as "separate" | "combined") ?? "separate",
        directors: Array.isArray(src?.directors)
        ? src!.directors.map((d) => ({
            id: d?.id ?? undefined,
            fullName: d?.fullName ?? "",
            role: (d?.role as DirectorRow["role"]) ?? "member",
            independence: (d?.independence as DirectorRow["independence"]) ?? "non-independent",
            gender: (d?.gender as DirectorRow["gender"]) ?? "undisclosed",
            ageBand: (d?.ageBand as DirectorRow["ageBand"]) || undefined,
            nationality: d?.nationality ?? "",
            tenureYears:
                d?.tenureYears == null
                ? null
                : Number.isFinite(Number(d.tenureYears))
                ? Number(d.tenureYears)
                : null,
            appointedAt: d?.appointedAt ?? "",
            committees: (d?.committees as DirectorRow["committees"]) ?? [],
            meetingsHeld:
                d?.meetingsHeld == null
                ? null
                : Number.isFinite(Number(d.meetingsHeld))
                ? Number(d.meetingsHeld)
                : null,
            meetingsAttended:
                d?.meetingsAttended == null
                ? null
                : Number.isFinite(Number(d.meetingsAttended))
                ? Number(d.meetingsAttended)
                : null,
            }))
        : [],
        meetingsHeldTotal:
        src?.meetingsHeldTotal == null
            ? null
            : Number.isFinite(Number(src.meetingsHeldTotal))
            ? Number(src.meetingsHeldTotal)
            : null,
        boardEvaluation: src?.boardEvaluation
        ? {
            conducted: (src.boardEvaluation.conducted as "yes" | "no") ?? "no",
            type: (src.boardEvaluation.type as "internal" | "external") || undefined,
            date: src.boardEvaluation.date ?? "",
            }
        : { conducted: "no" },
    };
    }, [gov?.body]);

  const oversightValue = useMemo<OversightValue>(() => {
    const src = gov?.oversight;
    return {
      oversightBody: (src?.oversightBody as OversightBody) ?? "board",
      namesRoles: Array.isArray(src?.namesRoles)
        ? src!.namesRoles.map((r) => ({ name: r?.name ?? "", role: r?.role ?? "" }))
        : [],
      briefingFrequency: (src?.briefingFrequency as BriefingFrequency) ?? "quarterly",
      reportApproval: {
        approver: (src?.reportApproval?.approver as Approver) ?? "board",
        approved: (src?.reportApproval?.approved as YesNo) ?? "no",
      },
      assurance: {
        level: (src?.assurance?.level as AssuranceLevel) ?? "none",
        providerName: src?.assurance?.providerName ?? "",
      },
    };
  }, [gov?.oversight]);

  const directorsMini: DirectorMini[] = useMemo(() => {
    const src = (gov?.body?.directors ?? []) as any[];
    return src.map((d) => ({
      id: d?.id ?? "",
      name: d?.fullName ?? "",
      independence: d?.independence ?? undefined,
    }));
  }, [gov?.body?.directors]);

  const committeesValue = useMemo<CommitteesValue>(() => {
    const src = (gov?.committees as CommitteesValue) ?? ({} as CommitteesValue);
    const defOne = (): OneCommitteeValue => ({
      exists: false,
      chairId: undefined,
      memberIds: [],
      independenceMajority: null,
      meetingsHeld: null,
      responsibilities: "",
      attendance: [],
    });
    return {
      audit: src?.audit ?? defOne(),
      remuneration: src?.remuneration ?? defOne(),
      nomination: src?.nomination ?? defOne(),
      esg: src?.esg ?? defOne(),
    };
  }, [gov?.committees]);

  const remunerationValue = useMemo<ExecutiveRemunerationValue>(() => {
    const src = (gov?.remuneration as any) ?? {};
    return {
      policy: {
        url: src?.policy?.url ?? "",
        uploadId: src?.policy?.uploadId ?? "",
      },
      payElements: {
        fixed: !!src?.payElements?.fixed,
        annualBonus: !!src?.payElements?.annualBonus,
        lti: !!src?.payElements?.lti,
      },
      esgLinked: (src?.esgLinked as "yes" | "no") ?? "no",
      esgMetrics: Array.isArray(src?.esgMetrics)
        ? src.esgMetrics.map((r: any) => ({
            name: r?.name ?? "",
            weightPct:
              r?.weightPct == null
                ? null
                : Number.isFinite(Number(r.weightPct))
                ? Number(r.weightPct)
                : null,
          }))
        : [],
      ceoPay: {
        amount:
          src?.ceoPay?.amount == null
            ? null
            : Number.isFinite(Number(src.ceoPay.amount))
            ? Number(src.ceoPay.amount)
            : null,
        currency: src?.ceoPay?.currency ?? "",
      },
      medianEmployeePay: {
        amount:
          src?.medianEmployeePay?.amount == null
            ? null
            : Number.isFinite(Number(src.medianEmployeePay.amount))
            ? Number(src.medianEmployeePay.amount)
            : null,
        currency: src?.medianEmployeePay?.currency ?? "",
      },
    };
  }, [gov?.remuneration]);

  const ethics: EthicsComplianceValue = useMemo(() => {
      const src = (gov as any)?.ethics ?? {};

      // Policies: ensure every key exists with a default structure
      const policies = {
        codeOfConduct:     src.policies?.codeOfConduct     ?? { exists: false, date: "", url: "" },
        antiCorruption:    src.policies?.antiCorruption    ?? { exists: false, date: "", url: "" },
        conflictOfInterest:src.policies?.conflictOfInterest?? { exists: false, date: "", url: "" },
        whistleblowing:    src.policies?.whistleblowing    ?? { exists: false, date: "", url: "" },
        relatedParty:      src.policies?.relatedParty      ?? { exists: false, date: "", url: "" },
        giftsHospitality:  src.policies?.giftsHospitality  ?? { exists: false, date: "", url: "" },
        dataPrivacy:       src.policies?.dataPrivacy       ?? { exists: false, date: "", url: "" },
      };

      const trainingCoverage = {
        codeOfConductPct:  src.trainingCoverage?.codeOfConductPct  ?? null,
        antiCorruptionPct: src.trainingCoverage?.antiCorruptionPct ?? null,
      };

      const incidents = {
        corruption:  src.incidents?.corruption  ?? null,
        fraud:       src.incidents?.fraud       ?? null,
        dataPrivacy: src.incidents?.dataPrivacy ?? null,
        other:       src.incidents?.other       ?? null,
        otherText:   src.incidents?.otherText   ?? "",
      };

      const penalties = {
        finesAmount:       src.penalties?.finesAmount       ?? null,
        finesCurrency:     src.penalties?.finesCurrency     ?? "",
        nonMonetaryCount:  src.penalties?.nonMonetaryCount  ?? null,
      };

      const politicalContributions = {
        none:     !!src.politicalContributions?.none,
        amount:   src.politicalContributions?.none ? null : (src.politicalContributions?.amount ?? null),
        currency: src.politicalContributions?.currency ?? "",
      };

      return {
        policies,
        trainingCoverage,
        whistleblowingChannel: (src.whistleblowingChannel as "yes" | "no") ?? "no",
        incidents,
        penalties,
        politicalContributions,
      } satisfies EthicsComplianceValue;
    }, [gov?.ethics]);


  const rpt: RptValue = useMemo(() => {
    const src = (gov as any)?.rpt ?? {};
    const rows = Array.isArray(src.rows) ? src.rows : [];
    return {
      rows: rows.map((r: any) => ({
        id: r?.id || crypto.randomUUID(),
        counterparty: r?.counterparty ?? "",
        relationship:
          r?.relationship ?? ("shareholder" as RptRow["relationship"]),
        amount: {
          value: r?.amount?.value ?? null,
          currency: r?.amount?.currency ?? "",
        },
        nature: r?.nature ?? ("goods" as RptRow["nature"]),
        armsLength: (r?.armsLength as YesNo) ?? "yes",
        independentApproval: (r?.independentApproval as YesNo) ?? "yes",
        notes: r?.notes ?? "",
      })),
    };
  }, [gov?.rpt]);

  const audit: AuditorValue = useMemo(() => {
      const src = (gov as any)?.audit ?? {};
      const ext = src.externalAuditor ?? {};
      const concerns =
        src?.criticalConcerns ?? ({ mechanism: "no", raised: null, resolved: null } as const);
      const fees = src.fees ?? {};

      const toNum = (n: unknown): number | null => {
        if (n == null) return null;
        const v = Number(n);
        return Number.isFinite(v) ? v : null;
      };

      return {
        externalAuditor: {
          name: (ext.name ?? "").toString(),
          initialYear: toNum(ext.initialYear),
          latestRotationYear: toNum(ext.latestRotationYear),
        },
        internalAuditFunction: (src.internalAuditFunction ?? "no") as AuditorValue["internalAuditFunction"],
        criticalConcerns: {
          mechanism: concerns.mechanism,
          raised: toNum(concerns.raised),
          resolved: toNum(concerns.resolved),
        },
        fees: {
          total: toNum(fees.total),
          nonAudit: toNum(fees.nonAudit),
          currency: (fees.currency ?? "").toString(),
        },
      };
    }, [gov?.audit]);

  const materiality: MaterialityValue = useMemo(() => {
    const src = (gov as any)?.materiality ?? {};

    const assessment = {
      done: (src.assessment?.done as YesNoPlanned) ?? "no",
      method: (src.assessment?.method ?? "") as string,
      date: (src.assessment?.date ?? "") as string,
    };

    const stakeholderGroups: StakeholderKey[] = Array.isArray(src.stakeholderGroups)
      ? (src.stakeholderGroups as StakeholderKey[]).filter(Boolean)
      : [];

    const otherStakeholderText: string | undefined =
      typeof src.otherStakeholderText === "string" ? src.otherStakeholderText : "";

    const topMaterialTopics: string[] = Array.isArray(src.topMaterialTopics)
      ? (src.topMaterialTopics as string[]).map((t) => (typeof t === "string" ? t : "")).filter(Boolean)
      : [];

    const criticalConcernsComms = {
      how: (src.criticalConcernsComms?.how ?? "") as string,
      frequency: (src.criticalConcernsComms?.frequency ?? "") as string,
      countToBoard:
        src.criticalConcernsComms?.countToBoard == null
          ? null
          : Number.isFinite(Number(src.criticalConcernsComms.countToBoard))
          ? Number(src.criticalConcernsComms.countToBoard)
          : null,
    };

    return {
      assessment,
      stakeholderGroups,
      otherStakeholderText,
      topMaterialTopics,
      criticalConcernsComms,
    } satisfies MaterialityValue;
  }, [gov?.materiality]);

  const reporting: TransparencyReportingValue = useMemo(() => {
    const src = (gov as any)?.reporting ?? {};
    const pubs = src.publications ?? {};
    const idx = src.index ?? {};

    const norm = (x: any): LinkOrUpload | undefined => {
      if (!x) return undefined;
      return {
        url: typeof x.url === "string" ? x.url : "",
        // UI-only file fields default empty; if you persisted them locally you can hydrate here
        file: null,
        fileName: undefined,
        fileSize: undefined,
        fileType: undefined,
        blobUrl: undefined,
      };
    };

    return {
      publications: {
        annualReport: norm(pubs.annualReport),
        financialStatements: norm(pubs.financialStatements),
        sustainabilityReport: norm(pubs.sustainabilityReport),
      },
      assuranceStatement: norm(src.assuranceStatement),
      index: {
        gri: norm(idx.gri),
        vsme: norm(idx.vsme),
      },
    } as TransparencyReportingValue;
  }, [gov?.reporting]);

  



  // ---------- Patch back into RHF ----------
  const onChangeOwnership = (patch: Partial<OwnershipLegalValue>) => {
    const next = { ...ownershipValue, ...patch };
    setValue("governance.ownership", next as any, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onChangeBody = (patch: Partial<GovernanceBodyValue>) => {
    const next = { ...bodyValue, ...patch };
    setValue("governance.body", next as any, { shouldDirty: true, shouldTouch: true });
    };

  const onChangeOversight = (patch: Partial<OversightValue>) => {
    const next = { ...oversightValue, ...patch };
    setValue("governance.oversight", next as any, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onChangeCommittees = (patch: Partial<CommitteesValue>) => {
    const next = { ...committeesValue, ...patch };
    setValue("governance.committees", next as any, { shouldDirty: true, shouldTouch: true });
  };

  const onChangeRemuneration = (patch: Partial<ExecutiveRemunerationValue>) => {
    const next = { ...remunerationValue, ...patch };
    setValue("governance.remuneration", next as any, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onChangeEthics = (patch: Partial<EthicsComplianceValue>) => {
      // Merge into the current slice while preserving unknown future fields
      setValue(
        "governance.ethics",
        { ...(gov as any)?.ethics, ...patch },
        { shouldDirty: true, shouldTouch: true }
      );
    };

  const onChangeRpt = (patch: Partial<RptValue>) => {
    setValue(
      "governance.rpt",
      { ...(gov as any)?.rpt, ...patch },
      { shouldDirty: true, shouldTouch: true }
    );
  };

  const onChangeAudit = (patch: Partial<AuditorValue>) => {
      const current = (gov as any)?.audit ?? {};
      setValue(
        "governance.audit",
        { ...current, ...patch },
        { shouldDirty: true, shouldTouch: true }
      );
    };

  const onChangeMateriality = (patch: Partial<MaterialityValue>) => {
    const next: MaterialityValue = { ...materiality, ...patch };
    setValue("governance.materiality", next as any, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };

  const onChangeReporting = (patch: Partial<TransparencyReportingValue>) => {
    const next: TransparencyReportingValue = { ...reporting, ...patch };
    setValue("governance.reporting", next as any, {
      shouldDirty: true,
      shouldTouch: true,
    });
  };



  return (
    <div className="space-y-6">
      {/* Card 1 — Ownership & Legal Structure */}
      <OwnershipLegalCardImpl value={ownershipValue} onChange={onChangeOwnership} />

      {/* Card 2 — Governance Body & Composition */}
      <GovernanceBodyCard value={bodyValue} onChange={onChangeBody} />

      {/* Card 3 - Oversight of Sustainabilty */}
      <OversightCard value={oversightValue} onChange={onChangeOversight} />

      {/* Card 4 - Committees */}
      <CommitteesCard value={committeesValue} onChange={onChangeCommittees} directors={directorsMini} />
      
      {/* Card 5 - Executive Renumeration */}
      <ExecutiveRemunerationCard value={remunerationValue} onChange={onChangeRemuneration} />

      {/* Card 6 - Ethics & compliance */}
      <EthicsComplianceCard value={ethics} onChange={onChangeEthics} />

      {/* Card 7 - Related Party Transactions */}
      <RelatedPartyTransactionsCard value={rpt} onChange={onChangeRpt} />
      
      {/* Card 8 - Audit Controls */}
      <AuditorControlsCard value={audit} onChange={onChangeAudit} />

      {/* Card 9 - Materiality & Stakeholder Engagement */}
      <MaterialityStakeholderCard value={materiality} onChange={onChangeMateriality} />

      {/* Card 10 — Transparency & Reporting */}
      <TransparencyReportingCard value={reporting} onChange={onChangeReporting} />

    </div>
  );
}
