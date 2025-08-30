// src/workflows/mappers/governance-body.mapper.ts
import type {
  GovernanceUI,
  GovernanceUpsertPayload,
} from "@/types/governance.types";

/* ───────────────────────── helpers ───────────────────────── */

const isBlank = (v: unknown) =>
  v == null || (typeof v === "string" && v.trim() === "");


const truthyStr = (s: unknown): string | undefined => {
  if (typeof s !== "string") return undefined;
  const t = s.trim();
  return t ? t : undefined;
};


const toNum = (v: unknown): number | undefined => {
  if (isBlank(v)) return undefined;
  const n =
    typeof v === "number" ? v : Number(String(v).replaceAll(",", "").trim());
  return Number.isFinite(n) ? n : undefined;
};

const toInt = (v: unknown): number | undefined => {
  const n = toNum(v);
  return n == null ? undefined : Math.trunc(n);
};

/** Try to normalize "USD - US Dollar" / "usd" / "USD (US Dollar)" → "USD" (<= 8 chars) */
const normalizeCurrency = (input?: string | null): string | undefined => {
  if (!input) return undefined;
  const s = String(input).trim().toUpperCase();
  if (s.length <= 8) return s;
  const m = s.match(/\b[A-Z]{3}\b/);
  return m?.[0] ?? s.slice(0, 8);
};

/** Normalize to http(s) URL; omit if invalid */
function ensureHttpUrl(v: unknown): string | undefined {
  // Narrow unknown -> string | null | undefined before calling truthyStr
  const s: string | null | undefined =
    typeof v === "string" ? v :
    v == null ? undefined :
    String(v);

  const raw = truthyStr(s);
  if (!raw) return undefined;

  const withScheme = /^(https?:)?\/\//i.test(raw) ? raw : `https://${raw}`;
  try {
    const u = new URL(withScheme);
    return (u.protocol === "http:" || u.protocol === "https:") ? u.toString() : undefined;
  } catch {
    return undefined;
  }
}

type AgeBand = "UNDER_30" | "FROM_30_TO_50" | "OVER_50";
const toAgeBand = (v: unknown): AgeBand | undefined => {
  if (v == null) return undefined;

  if (typeof v === "number") {
    if (v < 30) return "UNDER_30";
    if (v > 50) return "OVER_50";
    return "FROM_30_TO_50";
  }

  const raw = String(v).trim();
  if (!raw) return undefined;

  // Normalize separators to underscores
  const s = raw.toUpperCase()
    .replace(/[–—-]/g, "_")
    .replace(/\s+/g, "_");

  // Accept common synonyms
  const map: Record<string, AgeBand> = {
    "UNDER_30": "UNDER_30",
    "UNDER30": "UNDER_30",
    "BELOW_30": "UNDER_30",
    "LESS_THAN_30": "UNDER_30",

    "FROM_30_TO_50": "FROM_30_TO_50",
    "30_50": "FROM_30_TO_50",
    "30_TO_50": "FROM_30_TO_50",
    "BETWEEN_30_AND_50": "FROM_30_TO_50",
    "30-50": "FROM_30_TO_50", 

    "OVER_50": "OVER_50",
    "ABOVE_50": "OVER_50",
    "50_PLUS": "OVER_50",
    "50+": "OVER_50",
  };

  return map[s] ?? (s === "FROM_30_TO_50" ? "FROM_30_TO_50" : undefined);
};


const normalizeAttendanceRow = (
  row: { directorId?: unknown; attended?: unknown; held?: unknown },
  committeeHeld?: unknown
) => {
  const directorId = truthyStr(row.directorId);
  const held = toNum(row.held) ?? toNum(committeeHeld);
  const attended = toNum(row.attended);

  if (!directorId || attended == null) return undefined;

  let safeAttended = attended;
  if (held != null && attended > held) {
    safeAttended = held;
  }

  return {
    directorId,
    attended: safeAttended,          
    held: held ?? undefined,
  };
};

const COMMITTEE_KEYS = ["audit", "remuneration", "nomination", "esg"] as const;
const VALID_REL = [
  "shareholder",
  "director_related",
  "affiliate",
  "key_management",
  "other",
] as const;
const VALID_NATURE = ["goods", "services", "loan", "lease", "other"] as const;
const VALID_STAKEHOLDERS = [
  "employees",
  "customers",
  "suppliers",
  "communities",
  "investors",
  "regulators",
  "other",
] as const;

/* ──────────────────────── main mapper ─────────────────────── */

export function sanitizeGovernanceForUpsert(
  ui?: GovernanceUI
): GovernanceUpsertPayload {
  const out: GovernanceUpsertPayload = {};
  if (!ui) return out;

  /* ========== (1) Ownership ========== */
  if (ui.ownership) {
    const ow = ui.ownership;

    const topShareholders =
      ow.topShareholders
        ?.filter((r) => truthyStr(r?.name))
        .map((r) => ({
          name: r.name!.trim(),
          pct: toNum(r.pct),
        })) ?? [];

    const classes =
      ow.shareClasses?.classes
        ?.filter((c) => truthyStr(c?.name))
        .map((c) => ({
          name: c.name!.trim(),
          votingRightsPerShare: toNum(c.votingRightsPerShare),
          notes: truthyStr(c.notes),
        })) ?? [];

    out.ownership = {
      ultimateParent: {
        name: truthyStr(ow.ultimateParent?.name) ?? "",
        status: ow.ultimateParent?.status, // "named" | "independent"
      },
      topShareholders: topShareholders.length ? topShareholders : undefined,
      isListedEquity:
        typeof ow.isListedEquity === "boolean" ? ow.isListedEquity : undefined,
      shareClasses: ow.shareClasses
        ? {
            structure: ow.shareClasses.structure, // "ordinary" | "dual_class"
            dualClassNotes: truthyStr(ow.shareClasses.dualClassNotes),
            classes: classes.length ? classes : undefined,
          }
        : undefined,
      controlFeatures: ow.controlFeatures
        ? {
            hasGoldenShare: ow.controlFeatures.hasGoldenShare ?? undefined,
            hasShareholderAgreements:
              ow.controlFeatures.hasShareholderAgreements ?? undefined,
            description: truthyStr(ow.controlFeatures.description),
          }
        : undefined,
    };
  }

  /* ========== (2) Body & Directors ========== */
    if (ui.body) {
    const b = ui.body;
    const directors =
        b.directors?.filter((d) => !!truthyStr(d?.fullName)).map((d) => ({
        fullName: truthyStr(d.fullName)!,         // already filtered
        role: d.role,                              // enum passthrough
        independence: d.independence,              // enum passthrough
        gender: d.gender,
        ageBand: toAgeBand(d.ageBand),             // <-- normalize here
        nationality: truthyStr(d.nationality),
        tenureYears: toNum(d.tenureYears),
        appointedAt: truthyStr(d.appointedAt),
        committees: (d.committees ?? []).filter(
            (k): k is typeof COMMITTEE_KEYS[number] => (COMMITTEE_KEYS as readonly string[]).includes(k as string)
        ),
        meetingsHeld: toNum(d.meetingsHeld),
        meetingsAttended: toNum(d.meetingsAttended),
        })) ?? [];

    out.body = {
        highestBodyName: truthyStr(b.highestBodyName),
        chairCeoRoles: b.chairCeoRoles,
        directors: directors.length ? directors : undefined,
        meetingsHeldTotal: toNum(b.meetingsHeldTotal),
        boardEvaluation: b.boardEvaluation
        ? {
            conducted: b.boardEvaluation.conducted,
            type: b.boardEvaluation.type,
            date: truthyStr(b.boardEvaluation.date),
            }
        : undefined,
    };
    }


  /* ========== (3) Oversight ========== */
  if (ui.oversight) {
    const o = ui.oversight;
    const namesRoles =
      o.namesRoles
        ?.filter((r) => truthyStr(r?.name) && truthyStr(r?.role))
        .map((r) => ({ name: r.name!.trim(), role: r.role!.trim() })) ?? [];

    out.oversight = {
      oversightBody: o.oversightBody,
      namesRoles: namesRoles.length ? namesRoles : undefined,
      briefingFrequency: o.briefingFrequency,
      reportApproval:
        o.reportApproval &&
        (o.reportApproval.approver || o.reportApproval.approved)
          ? {
              approver: o.reportApproval.approver,
              approved: o.reportApproval.approved, // "yes" | "no"
            }
          : undefined,
      assurance:
        o.assurance && (o.assurance.level || o.assurance.providerName)
          ? {
              level: o.assurance.level ?? "none",
              providerName: truthyStr(o.assurance.providerName),
            }
          : undefined,
    };
  }

  /* ========== (4) Committees ========== */
    if (ui.committees) {
    const c = ui.committees;

    const mapCommittee = (val?: (typeof ui.committees)["audit"]) => {
        if (!val) return { exists: false as boolean };

        const committeeHeld = toNum(val.meetingsHeld);

        const attendance =
        val.attendance
            ?.map((r) => normalizeAttendanceRow(r as any, committeeHeld))
            .filter((r): r is NonNullable<typeof r> => !!r) ?? [];

        const memberIds =
        val.memberIds?.map((id) => truthyStr(id)).filter(Boolean) as string[] ?? [];

        return {
        exists: !!val.exists,
        chairId: truthyStr(val.chairId),
        independenceMajority: val.independenceMajority ?? undefined, // "yes" | "no" | null
        meetingsHeld: committeeHeld,
        responsibilities: truthyStr(val.responsibilities),
        attendance: attendance.length ? attendance : undefined,
        memberIds: memberIds.length ? memberIds : undefined,
        };
    };

    out.committees = {
        audit: mapCommittee(c.audit),
        remuneration: mapCommittee(c.remuneration),
        nomination: mapCommittee(c.nomination),
        esg: mapCommittee(c.esg),
    };
    }


  /* ========== (5) Remuneration ========== */
  if (ui.remuneration) {
    const r = ui.remuneration;
    const metrics =
      r.esgMetrics
        ?.filter((m) => truthyStr(m?.name) && toNum(m?.weightPct) != null)
        .map((m) => ({
          name: m.name!.trim(),
          weightPct: toNum(m.weightPct)!,
        })) ?? [];

    out.remuneration = {
      policy:
        r.policy && (ensureHttpUrl(r.policy.url) || truthyStr(r.policy.uploadId))
          ? {
              url: ensureHttpUrl(r.policy.url),
              uploadId: truthyStr(r.policy.uploadId),
            }
          : undefined,
      payElements: r.payElements
        ? {
            fixed: r.payElements.fixed ?? undefined,
            annualBonus: r.payElements.annualBonus ?? undefined,
            lti: r.payElements.lti ?? undefined,
          }
        : undefined,
      esgLinked: r.esgLinked, // "yes" | "no"
      esgMetrics: metrics.length ? metrics : undefined,
      ceoPay:
        r.ceoPay && (toNum(r.ceoPay.amount) != null || truthyStr(r.ceoPay.currency))
          ? {
              amount: toNum(r.ceoPay.amount),
              currency: normalizeCurrency(r.ceoPay.currency),
            }
          : undefined,
      medianEmployeePay:
        r.medianEmployeePay &&
        (toNum(r.medianEmployeePay.amount) != null ||
          truthyStr(r.medianEmployeePay.currency))
          ? {
              amount: toNum(r.medianEmployeePay.amount),
              currency: normalizeCurrency(r.medianEmployeePay.currency),
            }
          : undefined,
    };
  }

  /* ========== (6) Ethics & Compliance ========== */
  if (ui.ethics) {
    const e = ui.ethics;

    // Ensure full policies object when ethics is present
    const policy = (p?: { exists?: boolean; date?: string; url?: string }) => ({
      exists: !!p?.exists,
      date: truthyStr(p?.date),
      url: ensureHttpUrl(p?.url), // << normalize here
    });

    const political =
      e.politicalContributions?.none
        ? { none: true as const } // strip amount/currency to satisfy server refine
        : {
            none: false as const,
            amount: toNum(e.politicalContributions?.amount),
            currency: normalizeCurrency(e.politicalContributions?.currency),
          };

    out.ethics = {
      policies: {
        codeOfConduct: policy(e.policies?.codeOfConduct),
        antiCorruption: policy(e.policies?.antiCorruption),
        conflictOfInterest: policy(e.policies?.conflictOfInterest),
        whistleblowing: policy(e.policies?.whistleblowing),
        relatedParty: policy(e.policies?.relatedParty),
        giftsHospitality: policy(e.policies?.giftsHospitality),
        dataPrivacy: policy(e.policies?.dataPrivacy),
      },
      trainingCoverage: e.trainingCoverage
        ? {
            codeOfConductPct: toNum(e.trainingCoverage.codeOfConductPct),
            antiCorruptionPct: toNum(e.trainingCoverage.antiCorruptionPct),
          }
        : undefined,
      whistleblowingChannel: e.whistleblowingChannel, // "yes" | "no"
      incidents: e.incidents
        ? {
            corruption: toNum(e.incidents.corruption),
            fraud: toNum(e.incidents.fraud),
            dataPrivacy: toNum(e.incidents.dataPrivacy),
            other: toNum(e.incidents.other),
            otherText: truthyStr(e.incidents.otherText),
          }
        : undefined,
      penalties: e.penalties
        ? {
            finesAmount: toNum(e.penalties.finesAmount),
            finesCurrency: normalizeCurrency(e.penalties.finesCurrency),
            nonMonetaryCount: toNum(e.penalties.nonMonetaryCount),
          }
        : undefined,
      politicalContributions: political,
    };
  }

  /* ========== (7) Related-Party Transactions (RPT) ========== */
    if ((ui as any)?.rpt != null) {
    const r = (ui as any).rpt;

    // Accept any of these shapes:
    // - rpt: RptRow[]
    // - rpt.items: RptRow[]
    // - rpt.rows: RptRow[]   <-- new
    const source: any[] =
        Array.isArray(r) ? r
        : Array.isArray(r?.items) ? r.items
        : Array.isArray(r?.rows) ? r.rows
        : [];

    const items =
        source
        .filter((i) => {
            if (!truthyStr(i?.counterparty)) return false;
            if (!(VALID_REL as readonly string[]).includes(i.relationship as string)) return false;
            if (!(VALID_NATURE as readonly string[]).includes(i.nature as string)) return false;
            if (!i.armsLength || !i.independentApproval) return false; // must be "yes"/"no"
            return true;
        })
        .map((i) => ({
            counterparty: i.counterparty!.trim(),
            relationship: i.relationship,
            nature: i.nature,
            armsLength: i.armsLength,                 // "yes" | "no"
            independentApproval: i.independentApproval, // "yes" | "no"
            amount:
            toNum(i.amount?.value) != null
                ? {
                    value: toNum(i.amount?.value),
                    currency: normalizeCurrency(i.amount?.currency),
                }
                : undefined,
            notes: truthyStr(i.notes),
        }));

    out.rpt = items.length ? items : undefined;
    }


  /* ========== (8) Audit ========== */
  if (ui.audit) {
    const a = ui.audit;
    out.audit = {
      externalAuditor:
        a.externalAuditor &&
        (truthyStr(a.externalAuditor.name) ||
          toInt(a.externalAuditor.initialYear) != null ||
          toInt(a.externalAuditor.latestRotationYear) != null)
          ? {
              name: truthyStr(a.externalAuditor.name),
              initialYear: toInt(a.externalAuditor.initialYear),
              latestRotationYear: toInt(a.externalAuditor.latestRotationYear),
            }
          : undefined,
      internalAuditFunction: a.internalAuditFunction, // "yes" | "no"
      criticalConcerns:
        a.criticalConcerns &&
        (a.criticalConcerns.mechanism ||
          toNum(a.criticalConcerns.raised) != null ||
          toNum(a.criticalConcerns.resolved) != null)
          ? {
              mechanism: a.criticalConcerns.mechanism, // "yes" | "no"
              raised: toNum(a.criticalConcerns.raised),
              resolved: toNum(a.criticalConcerns.resolved),
            }
          : undefined,
      fees:
        a.fees &&
        (toNum(a.fees.total) != null ||
          toNum(a.fees.nonAudit) != null ||
          truthyStr(a.fees.currency))
          ? {
              total: toNum(a.fees.total),
              nonAudit: toNum(a.fees.nonAudit),
              currency: normalizeCurrency(a.fees.currency),
            }
          : undefined,
    };
  }

  /* ========== (9) Materiality & Stakeholders ========== */
  if (ui.materiality) {
    const m = ui.materiality;

    const groups =
        (m.stakeholderGroups ?? []).filter((g): g is typeof VALID_STAKEHOLDERS[number] =>
        (VALID_STAKEHOLDERS as readonly string[]).includes(g as string)
        ) ?? [];

    const hasOther = groups.includes("other");

    const topics =
        m.topMaterialTopics?.filter((t) => truthyStr(t)).map((t) => t!.trim()) ?? [];

    out.materiality = {
        assessment: m.assessment
        ? {
            done: m.assessment.done, // "yes" | "no" | "planned"
            method: truthyStr(m.assessment.method),
            date: truthyStr(m.assessment.date),
            }
        : undefined,
        stakeholderGroups: groups,
        // ⬇️ only send text if "other" is selected
        otherStakeholderText: hasOther ? truthyStr(m.otherStakeholderText) : undefined,
        topMaterialTopics: topics,
        criticalConcernsComms:
        m.criticalConcernsComms &&
        (truthyStr(m.criticalConcernsComms.how) ||
            truthyStr(m.criticalConcernsComms.frequency) ||
            toNum(m.criticalConcernsComms.countToBoard) != null)
            ? {
                how: truthyStr(m.criticalConcernsComms.how) ?? "",
                frequency: truthyStr(m.criticalConcernsComms.frequency) ?? "",
                countToBoard: toNum(m.criticalConcernsComms.countToBoard),
            }
            : undefined,
    };
    }


  /* ========== (10) Reporting & Transparency ========== */
  if (ui.reporting) {
    const r = ui.reporting;

    const link = (x?: { url?: string; uploadId?: string }) =>
      x && (ensureHttpUrl(x.url) || truthyStr(x.uploadId))
        ? { url: ensureHttpUrl(x.url), uploadId: truthyStr(x.uploadId) }
        : undefined;

    out.reporting = {
      publications:
        r.publications &&
        (link(r.publications.annualReport) ||
          link(r.publications.financialStatements) ||
          link(r.publications.sustainabilityReport))
          ? {
              annualReport: link(r.publications.annualReport),
              financialStatements: link(r.publications.financialStatements),
              sustainabilityReport: link(r.publications.sustainabilityReport),
            }
          : undefined,
      assuranceStatement: link(r.assuranceStatement),
      index:
        r.index && (link(r.index.gri) || link(r.index.vsme))
          ? {
              gri: link(r.index.gri),
              vsme: link(r.index.vsme),
            }
          : undefined,
    };
  }

  return out;
}
