// src/types/social.types.ts

/* =========================
 * UI-side (form) types
 * ========================= */

export type YesNoUI = "yes" | "no";
export type YesNoMixedUI = "yes" | "no" | "mixed";
export type HrTopicUI =
  | "childLabour"
  | "forcedLabour"
  | "humanTrafficking"
  | "discrimination"
  | "healthAndSafety"
  | "other";

export type SocialUI = {
  id?: string;
  laborStats?: {
    asOfDate?: string;
    fte?: number;
    femalePct?: number;
    femaleMgmtPct?: number;
    injuryRate?: number;
    trainingHoursPerEmployee?: number;
    genderPayGapPct?: number;
  };
  workforceProfile?: {
    headcountByLocation?: Array<{ country: string; site?: string; headcount: number }>;
    contractType?: { permanent?: number; temporary?: number };
    employmentType?: { fullTime?: number; partTime?: number };
    gender?: { women?: number; men?: number; undisclosed?: number };
    ageBands?: { under30?: number; from30to50?: number; over50?: number };
    fteTotal?: number;
  };
  nonEmployeeWorkers?: {
    counts?: {
      agency?: number; apprentices?: number; contractors?: number;
      homeWorkers?: number; internsVolunteers?: number; selfEmployed?: number;
    };
    hoursWorked?: number;
  };
  movement?: {
    headcountStart?: number; headcountEnd?: number;
    newHiresTotal?: number; exitsTotal?: number;
    newHiresBreakdown?: {
      byGender?: { women?: number; men?: number; undisclosed?: number };
      byAge?: { under30?: number; from30to50?: number; over50?: number };
      byRegion?: Array<{ region: string; count: number }>;
    };
    exitsBreakdown?: {
      byGender?: { women?: number; men?: number; undisclosed?: number };
      byAge?: { under30?: number; from30to50?: number; over50?: number };
      byRegion?: Array<{ region: string; count: number }>;
    };
  };
  pay?: {
    meetsMinimumWage?: "yes" | "no" | "mixed";
    lowestHourlyRate?: { amount: number; currency: string }; // <— required inside if present
    salaryByGroupAndLocation?: Array<{ group: string; country: string; avgWomen: number; avgMen: number }>;
  };
  collectiveBargaining?: {
    coveredEmployees?: number; totalEmployees?: number;
  };
  training?: {
    totalTrainingHours?: number; employeesTrained?: number;
    byGender?: { women?: number; men?: number; undisclosed?: number };
    byGroup?: Array<{ group: string; hours: number }>;
  };
  ohs?: {
    employees?: { hoursWorked?: number; recordableInjuries?: number; highConsequenceInjuries?: number; fatalities?: number };
    nonEmployees?: { hoursWorked?: number; recordableInjuries?: number; highConsequenceInjuries?: number; fatalities?: number };
  };
  humanRights?: {
    policyExists?: "yes" | "no" | null;
    policyCovers?: {
      childLabour?: boolean; forcedLabour?: boolean; humanTrafficking?: boolean;
      discrimination?: boolean; healthAndSafety?: boolean; other?: boolean; otherText?: string;
    };
    grievanceMechanism?: "yes" | "no" | null;
    incidents?: Array<{ topic: "childLabour" | "forcedLabour" | "humanTrafficking" | "discrimination" | "healthAndSafety" | "other"; confirmed: "yes" | "no"; description?: string | null }>;
  };
  community?: {
    volunteerHours?: number;
    cashDonations?: { amount: number; currency: string };
    inKindDonations?: { amount: number; currency: string; description?: string | null };
    estimatedBeneficiaries?: number; sitesWithAssessment?: number; totalSites?: number;
  };
};

/* =========================
 * API detail (server) types
 * ========================= */

export type YesNo = "YES" | "NO";
export type YesNoMixed = "YES" | "NO" | "MIXED";
export type HumanRightsTopic =
  | "CHILD_LABOUR"
  | "FORCED_LABOUR"
  | "HUMAN_TRAFFICKING"
  | "DISCRIMINATION"
  | "HEALTH_AND_SAFETY"
  | "OTHER";
export type MovementRegionKind = "NEW_HIRES" | "EXITS";


export type SocialUpsertPayload = SocialUI;
/** 
 * Normalize UI → payload that satisfies types expected by the client/backend.
 * If lowestHourlyRate exists but is incomplete, drop it (so Zod can treat it as absent).
 */
export function toSocialUpsertPayload(ui?: SocialUI): SocialUpsertPayload | undefined {
  if (!ui) return undefined;
  const p: SocialUpsertPayload = structuredClone(ui);

  if (p.pay) {
    const lhr = p.pay.lowestHourlyRate;
    if (!lhr || lhr.currency == null || lhr.currency === "" || lhr.amount == null) {
      delete (p.pay as any).lowestHourlyRate;
    }
  }

  if (p.community) {
    const cd = p.community.cashDonations;
    if (!cd || cd.currency == null || cd.currency === "" || cd.amount == null) {
      delete (p.community as any).cashDonations;
    }
    const ik = p.community.inKindDonations;
    if (!ik || ik.currency == null || ik.currency === "" || ik.amount == null) {
      delete (p.community as any).inKindDonations;
    }
  }

  return p;
}

export type SocialDetail = {
  id: string;
  companyId: string;
  createdAt: string;
  updatedAt: string;
  company: { id: string; name: string };

  laborStat?: {
    id: string;
    asOfDate?: string | null;
    fte?: number | null;
    femalePct?: number | null;
    femaleMgmtPct?: number | null;
    injuryRate?: number | null;
    trainingHoursPerEmployee?: number | null;
    genderPayGapPct?: number | null;
  } | null;

  workforceProfile?: {
    id: string;
    fteTotal?: number | null;
    ctPermanent?: number | null;
    ctTemporary?: number | null;
    etFullTime?: number | null;
    etPartTime?: number | null;
    gWomen?: number | null;
    gMen?: number | null;
    gUndisclosed?: number | null;
    aUnder30?: number | null;
    a30to50?: number | null;
    aOver50?: number | null;
    headcountByLocation: Array<{
      id: string;
      country: string;
      site?: string | null;
      headcount: number;
    }>;
  } | null;

  nonEmployeeWorkers?: {
    id: string;
    agency?: number | null;
    apprentices?: number | null;
    contractors?: number | null;
    homeWorkers?: number | null;
    internsVolunteers?: number | null;
    selfEmployed?: number | null;
    hoursWorked?: number | null;
  } | null;

  movement?: {
    id: string;
    headcountStart?: number | null;
    headcountEnd?: number | null;
    newHiresTotal?: number | null;
    exitsTotal?: number | null;
    nhWomen?: number | null;
    nhMen?: number | null;
    nhUndisclosed?: number | null;
    nhUnder30?: number | null;
    nh30to50?: number | null;
    nhOver50?: number | null;
    exWomen?: number | null;
    exMen?: number | null;
    exUndisclosed?: number | null;
    exUnder30?: number | null;
    ex30to50?: number | null;
    exOver50?: number | null;
    regions: Array<{
      id: string;
      kind: MovementRegionKind;
      region: string;
      count: number;
    }>;
  } | null;

  pay?: {
    id: string;
    meetsMinimumWage?: YesNoMixed | null;
    lhrAmount?: number | null;
    lhrCurrency?: string | null;
    salaryByGroupAndLocation: Array<{
      id: string;
      group: string;
      country: string;
      avgWomen: number;
      avgMen: number;
    }>;
  } | null;

  collectiveBargaining?: {
    id: string;
    coveredEmployees?: number | null;
    totalEmployees?: number | null;
  } | null;

  training?: {
    id: string;
    totalTrainingHours?: number | null;
    employeesTrained?: number | null;
    tgWomen?: number | null;
    tgMen?: number | null;
    tgUndisclosed?: number | null;
    byGroup: Array<{
      id: string;
      group: string;
      hours: number;
    }>;
  } | null;

  ohs?: {
    id: string;
    empHoursWorked?: number | null;
    empRecordableInjuries?: number | null;
    empHighConsequenceInjuries?: number | null;
    empFatalities?: number | null;
    neHoursWorked?: number | null;
    neRecordableInjuries?: number | null;
    neHighConsequenceInjuries?: number | null;
    neFatalities?: number | null;
  } | null;

  humanRights?: {
    id: string;
    policyExists?: YesNo | null;
    pcChildLabour?: boolean | null;
    pcForcedLabour?: boolean | null;
    pcHumanTrafficking?: boolean | null;
    pcDiscrimination?: boolean | null;
    pcHealthAndSafety?: boolean | null;
    pcOther?: boolean | null;
    pcOtherText?: string | null;
    grievanceMechanism?: YesNo | null;
    incidents: Array<{
      id: string;
      topic: HumanRightsTopic;
      confirmed: YesNo;
      description?: string | null;
    }>;
  } | null;

  community?: {
    id: string;
    volunteerHours?: number | null;
    cashAmount?: number | null;
    cashCurrency?: string | null;
    inKindAmount?: number | null;
    inKindCurrency?: string | null;
    inKindDescription?: string | null;
    estimatedBeneficiaries?: number | null;
    sitesWithAssessment?: number | null;
    totalSites?: number | null;
  } | null;
};

/* =========================
 * List shape
 * ========================= */

export type SocialList = {
  page: number;
  pageSize: number;
  total: number;
  data: Array<{
    id: string;
    createdAt: string;
    updatedAt: string;
  }>;
};


