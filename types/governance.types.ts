// src/types/governance.types.ts

/* =========================================================================
 * Shared literals
 * ========================================================================= */
export type YesNoLower = "yes" | "no";
export type YesNoMixedLower = "yes" | "no" | "mixed";
export type YesNoPlannedLower = "yes" | "no" | "planned";

export type UltimateParentStatus = "named" | "independent";
export type ShareStructure = "ordinary" | "dual_class";
export type ChairCeoRoles = "separate" | "combined";

export type DirectorRole =
  | "chair"
  | "member"
  | "vice_chair"
  | "executive"
  | "non_executive";
export type DirectorGender = "woman" | "man" | "undisclosed";
export type DirectorAgeBand = "UNDER_30" | "FROM_30_TO_50" | "OVER_50";

export type CommitteeKey = "audit" | "remuneration" | "nomination" | "esg";

export type OversightBody = "board" | "committee" | "senior_executive";
export type BriefingFrequency = "every_meeting" | "quarterly" | "annually" | "ad_hoc";
export type ReportApprover = "board" | "committee" | "executive";
export type AssuranceLevel = "none" | "limited" | "reasonable";

export type RptRelationship =
  | "shareholder"
  | "director_related"
  | "affiliate"
  | "key_management"
  | "other";
export type RptNature = "goods" | "services" | "loan" | "lease" | "other";

export interface LinkOrUpload {
  url?: string;
  uploadId?: string;
}

export interface Money {
  amount?: number | null;
  currency?: string; // <= 8 chars
}

/* =========================================================================
 * UI types (what the form works with)
 * ========================================================================= */
export interface GovernanceUI {
  id?: string;

  ownership?: {
    ultimateParent: {
      name: string;
      status?: UltimateParentStatus;
    };
    topShareholders?: Array<{
      id?: string;
      name: string;
      pct?: number | null;
    }>;
    isListedEquity?: boolean;
    shareClasses?: {
      structure: ShareStructure;
      classes?: Array<{
        name: string;
        votingRightsPerShare?: number | null;
        notes?: string;
      }>;
      dualClassNotes?: string;
    };
    controlFeatures?: {
      /** UI-only flag so forms can show/hide; backend ignores */
      hasControlFeatures?: boolean;
      hasGoldenShare?: boolean;
      hasShareholderAgreements?: boolean;
      description?: string;
    };
  };

  body?: {
    highestBodyName?: string;
    chairCeoRoles?: ChairCeoRoles;
    directors?: DirectorUI[];
    meetingsHeldTotal?: number | null;
    boardEvaluation?: {
      conducted?: YesNoLower; // transformed to YES/NO by backend Zod
      type?: "internal" | "external";
      date?: string; // ISO-like
    };
  };

  oversight?: {
    oversightBody?: OversightBody;
    namesRoles?: Array<{ name: string; role: string }>;
    briefingFrequency?: BriefingFrequency;
    reportApproval?: {
      approver?: ReportApprover;
      approved?: YesNoLower;
    };
    assurance?: {
      level?: AssuranceLevel;
      providerName?: string;
    };
  };

  committees?: {
    audit: CommitteeUI;
    remuneration: CommitteeUI;
    nomination: CommitteeUI;
    esg: CommitteeUI;
  };

  remuneration?: {
    policy?: LinkOrUpload;
    payElements?: {
      fixed?: boolean;
      annualBonus?: boolean;
      lti?: boolean;
    };
    esgLinked?: YesNoLower;
    esgMetrics?: Array<{ name: string; weightPct?: number }>;
    ceoPay?: Money;
    medianEmployeePay?: Money;
  };

  ethics?: {
    policies: {
      codeOfConduct: PolicyPresence;
      antiCorruption: PolicyPresence;
      conflictOfInterest: PolicyPresence;
      whistleblowing: PolicyPresence;
      relatedParty: PolicyPresence;
      giftsHospitality: PolicyPresence;
      dataPrivacy: PolicyPresence;
    };
    trainingCoverage?: {
      codeOfConductPct?: number | null;
      antiCorruptionPct?: number | null;
    };
    whistleblowingChannel?: YesNoLower;
    incidents?: {
      corruption?: number | null;
      fraud?: number | null;
      dataPrivacy?: number | null;
      other?: number | null;
      otherText?: string;
    };
    penalties?: {
      finesAmount?: number | null;
      finesCurrency?: string;
      nonMonetaryCount?: number | null;
    };
    politicalContributions?: {
      none?: boolean;
      amount?: number | null;
      currency?: string;
    };
  };

  rpt?: Array<{
    id?: string;
    counterparty: string;
    relationship: RptRelationship;
    amount?: { value?: number | null; currency?: string };
    nature: RptNature;
    armsLength: YesNoLower;
    independentApproval: YesNoLower;
    notes?: string;
  }>;

  audit?: {
    externalAuditor?: {
      name?: string;
      initialYear?: number | null;
      latestRotationYear?: number | null;
    };
    internalAuditFunction?: YesNoLower;
    criticalConcerns?: {
      mechanism?: YesNoLower;
      raised?: number | null;
      resolved?: number | null;
    };
    fees?: {
      total?: number | null;
      nonAudit?: number | null;
      currency?: string;
    };
  };

  materiality?: {
    assessment?: {
      done?: YesNoPlannedLower; // transformed to YES/NO/PLANNED by backend Zod
      method?: string;
      date?: string;
    };
    stakeholderGroups?: Array<
      | "employees"
      | "customers"
      | "suppliers"
      | "communities"
      | "investors"
      | "regulators"
      | "other"
    >;
    otherStakeholderText?: string;
    topMaterialTopics?: string[];
    criticalConcernsComms?: {
      how: string;
      frequency: string;
      countToBoard?: number | null;
    };
  };

  reporting?: {
    publications?: {
      annualReport?: LinkOrUpload;
      financialStatements?: LinkOrUpload;
      sustainabilityReport?: LinkOrUpload;
    };
    assuranceStatement?: LinkOrUpload;
    index?: {
      gri?: LinkOrUpload;
      vsme?: LinkOrUpload;
    };
  };
}

export interface DirectorUI {
  id?: string;
  fullName: string;
  role: DirectorRole;
  independence: "independent" | "non_independent";
  gender?: DirectorGender;
  ageBand?: DirectorAgeBand;
  nationality?: string;
  tenureYears?: number | null;
  appointedAt?: string; // date string
  committees?: CommitteeKey[]; // flattened list, CSV’d server-side
  meetingsHeld?: number | null;
  meetingsAttended?: number | null;
}

export interface CommitteeUI {
  exists: boolean;
  chairId?: string;
  memberIds?: string[];
  independenceMajority?: YesNoLower | null;
  meetingsHeld?: number | null;
  responsibilities?: string;
  attendance?: Array<{
    directorId: string;
    attended: number; // UI enforces non-negative
    held?: number | null; // falls back to committee.meetingsHeld
  }>;
}

export interface PolicyPresence {
  exists: boolean;
  date?: string;
  url?: string;
}

/* =========================================================================
 * Upsert payload (sanitized before send). Matches backend Zod expectations.
 * ========================================================================= */
export type GovernanceUpsertPayload = Omit<GovernanceUI, "id">;

/* =========================================================================
 * API response shapes
 * ========================================================================= */
export interface GovernanceDetail {
  id: string;
  company?: { id: string; name: string };
  createdAt?: string;
  updatedAt?: string;

  // Slices are shaped like UI for easy binding
  ownership?: GovernanceUI["ownership"];
  body?: GovernanceUI["body"];
  oversight?: GovernanceUI["oversight"];
  committees?: GovernanceUI["committees"];
  remuneration?: GovernanceUI["remuneration"];
  ethics?: GovernanceUI["ethics"];
  rpt?: GovernanceUI["rpt"];
  audit?: GovernanceUI["audit"];
  materiality?: GovernanceUI["materiality"];
  reporting?: GovernanceUI["reporting"];
}

export interface GovernanceList {
  page: number;
  pageSize: number;
  total: number;
  data: Array<{
    id: string;
    companyId: string;
    createdAt: string;
    updatedAt: string;

    ownershipId?: string | null;
    bodyId?: string | null;
    committeesId?: string | null;
    remunerationId?: string | null;
    ethicsId?: string | null;
    rptId?: string | null;
    auditId?: string | null;
    oversightId?: string | null;
    materialityId?: string | null;
    reportingId?: string | null;
  }>;
}
