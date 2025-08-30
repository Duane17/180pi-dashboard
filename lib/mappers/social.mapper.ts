// src/workflows/mappers/social.mapper.ts
import type { SocialUI, SocialUpsertPayload } from "@/types/social.types";

const isBlank = (v: any) => v == null || v === "";

/** Coerce number-like values; return undefined for blank/NaN */
function num(v: any): number | undefined {
  if (v == null || v === "") return undefined;
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : undefined;
}

/** Normalize "usd", "USD (US Dollar)", "USD - US Dollar" → "USD" (max 8 chars) */
function normalizeCurrency(input?: string): string | undefined {
  if (!input) return undefined;
  const s = String(input).trim().toUpperCase();
  if (s.length <= 8) return s;
  const m = s.match(/\b[A-Z]{3}\b/);
  return m?.[0] ?? s.slice(0, 8);
}

export function sanitizeSocialForUpsert(ui?: SocialUI): SocialUpsertPayload {
  const out: SocialUpsertPayload = {};
  if (!ui) return out;

  /* ---------------- Labor stats ---------------- */
  if (ui.laborStats) {
    out.laborStats = {
      asOfDate: ui.laborStats.asOfDate,
      fte: num(ui.laborStats.fte),
      femalePct: num(ui.laborStats.femalePct),
      femaleMgmtPct: num(ui.laborStats.femaleMgmtPct),
      injuryRate: num(ui.laborStats.injuryRate),
      trainingHoursPerEmployee: num(ui.laborStats.trainingHoursPerEmployee),
      genderPayGapPct: num(ui.laborStats.genderPayGapPct),
    };
  }

  /* ---------------- Workforce profile ---------------- */
  if (ui.workforceProfile) {
    const w = ui.workforceProfile;

    const headcountByLocation = (w.headcountByLocation ?? [])
      .map((r) => ({
        country: (r.country ?? "").trim(),
        site: r.site?.trim() || undefined,
        headcount: num(r.headcount),
      }))
      .filter((r) => r.country && r.headcount !== undefined) as {
        country: string;
        site?: string;
        headcount: number;
      }[];

    const contractType = w.contractType
      ? {
          permanent: num(w.contractType.permanent),
          temporary: num(w.contractType.temporary),
        }
      : undefined;

    const employmentType = w.employmentType
      ? {
          fullTime: num(w.employmentType.fullTime),
          partTime: num(w.employmentType.partTime),
        }
      : undefined;

    const gender = w.gender
      ? {
          women: num(w.gender.women),
          men: num(w.gender.men),
          undisclosed: num(w.gender.undisclosed),
        }
      : undefined;

    const ageBands = w.ageBands
      ? {
          under30: num(w.ageBands.under30),
          from30to50: num(w.ageBands.from30to50),
          over50: num(w.ageBands.over50),
        }
      : undefined;

    const fteTotal = num(w.fteTotal);

    const wp = {
      headcountByLocation: headcountByLocation.length ? headcountByLocation : undefined,
      contractType,
      employmentType,
      gender,
      ageBands,
      fteTotal,
    };

    // Only include section if it contains any data
    if (
      wp.headcountByLocation ||
      wp.contractType ||
      wp.employmentType ||
      wp.gender ||
      wp.ageBands ||
      wp.fteTotal !== undefined
    ) {
      out.workforceProfile = wp;
    }
  }

  /* ---------------- Non-employee workers ---------------- */
  if (ui.nonEmployeeWorkers) {
    const nE = ui.nonEmployeeWorkers;
    out.nonEmployeeWorkers = {
      counts: nE.counts
        ? {
            agency: num(nE.counts.agency),
            apprentices: num(nE.counts.apprentices),
            contractors: num(nE.counts.contractors),
            homeWorkers: num(nE.counts.homeWorkers),
            internsVolunteers: num(nE.counts.internsVolunteers),
            selfEmployed: num(nE.counts.selfEmployed),
          }
        : undefined,
      hoursWorked: num(nE.hoursWorked),
    };
  }

  /* ---------------- Movement ---------------- */
  if (ui.movement) {
    const m = ui.movement;

    const hiresByRegion = (m.newHiresBreakdown?.byRegion ?? [])
      .map((r) => ({ region: (r.region ?? "").trim(), count: num(r.count) }))
      .filter((r) => r.region && r.count !== undefined) as { region: string; count: number }[];

    const exitsByRegion = (m.exitsBreakdown?.byRegion ?? [])
      .map((r) => ({ region: (r.region ?? "").trim(), count: num(r.count) }))
      .filter((r) => r.region && r.count !== undefined) as { region: string; count: number }[];

    out.movement = {
      headcountStart: num(m.headcountStart),
      headcountEnd: num(m.headcountEnd),
      newHiresTotal: num(m.newHiresTotal),
      exitsTotal: num(m.exitsTotal),
      newHiresBreakdown: m.newHiresBreakdown
        ? {
            byGender: m.newHiresBreakdown.byGender
              ? {
                  women: num(m.newHiresBreakdown.byGender.women),
                  men: num(m.newHiresBreakdown.byGender.men),
                  undisclosed: num(m.newHiresBreakdown.byGender.undisclosed),
                }
              : undefined,
            byAge: m.newHiresBreakdown.byAge
              ? {
                  under30: num(m.newHiresBreakdown.byAge.under30),
                  from30to50: num(m.newHiresBreakdown.byAge.from30to50),
                  over50: num(m.newHiresBreakdown.byAge.over50),
                }
              : undefined,
            byRegion: hiresByRegion.length ? hiresByRegion : undefined,
          }
        : undefined,
      exitsBreakdown: m.exitsBreakdown
        ? {
            byGender: m.exitsBreakdown.byGender
              ? {
                  women: num(m.exitsBreakdown.byGender.women),
                  men: num(m.exitsBreakdown.byGender.men),
                  undisclosed: num(m.exitsBreakdown.byGender.undisclosed),
                }
              : undefined,
            byAge: m.exitsBreakdown.byAge
              ? {
                  under30: num(m.exitsBreakdown.byAge.under30),
                  from30to50: num(m.exitsBreakdown.byAge.from30to50),
                  over50: num(m.exitsBreakdown.byAge.over50),
                }
              : undefined,
            byRegion: exitsByRegion.length ? exitsByRegion : undefined,
          }
        : undefined,
    };
  }

  /* ---------------- Pay ---------------- */
  if (ui.pay) {
    const p = ui.pay;

    const lhrAmount = num(p.lowestHourlyRate?.amount);
    const lhrCurrency = normalizeCurrency(p.lowestHourlyRate?.currency);
    const lowestHourlyRate =
      lhrAmount !== undefined && lhrCurrency ? { amount: lhrAmount, currency: lhrCurrency } : undefined;

    const salaryRows = (p.salaryByGroupAndLocation ?? [])
      .map((r) => ({
        group: (r.group ?? "").trim(),
        country: (r.country ?? "").trim(),
        avgWomen: num(r.avgWomen),
        avgMen: num(r.avgMen),
      }))
      .filter(
        (r) => r.group && r.country && r.avgWomen !== undefined && r.avgMen !== undefined
      ) as { group: string; country: string; avgWomen: number; avgMen: number }[];

    const pay = {
      meetsMinimumWage: p.meetsMinimumWage, // "yes" | "no" | "mixed"
      lowestHourlyRate,
      salaryByGroupAndLocation: salaryRows.length ? salaryRows : undefined,
    };

    if (pay.meetsMinimumWage || pay.lowestHourlyRate || pay.salaryByGroupAndLocation) {
      out.pay = pay;
    }
  }

  /* ---------------- Collective bargaining ---------------- */
  if (ui.collectiveBargaining) {
    out.collectiveBargaining = {
      coveredEmployees: num(ui.collectiveBargaining.coveredEmployees),
      totalEmployees: num(ui.collectiveBargaining.totalEmployees),
    };
  }

  /* ---------------- Training ---------------- */
  if (ui.training) {
    const t = ui.training;

    const byGroup = (t.byGroup ?? [])
      .map((r) => ({ group: (r.group ?? "").trim(), hours: num(r.hours) }))
      .filter((r) => r.group && r.hours !== undefined) as { group: string; hours: number }[];

    out.training = {
      totalTrainingHours: num(t.totalTrainingHours),
      employeesTrained: num(t.employeesTrained),
      byGender: t.byGender
        ? {
            women: num(t.byGender.women),
            men: num(t.byGender.men),
            undisclosed: num(t.byGender.undisclosed),
          }
        : undefined,
      byGroup: byGroup.length ? byGroup : undefined,
    };
  }

  /* ---------------- OHS ---------------- */
  if (ui.ohs) {
    out.ohs = {
      employees: ui.ohs.employees
        ? {
            hoursWorked: num(ui.ohs.employees.hoursWorked),
            recordableInjuries: num(ui.ohs.employees.recordableInjuries),
            highConsequenceInjuries: num(ui.ohs.employees.highConsequenceInjuries),
            fatalities: num(ui.ohs.employees.fatalities),
          }
        : undefined,
      nonEmployees: ui.ohs.nonEmployees
        ? {
            hoursWorked: num(ui.ohs.nonEmployees.hoursWorked),
            recordableInjuries: num(ui.ohs.nonEmployees.recordableInjuries),
            highConsequenceInjuries: num(ui.ohs.nonEmployees.highConsequenceInjuries),
            fatalities: num(ui.ohs.nonEmployees.fatalities),
          }
        : undefined,
    };
  }

  /* ---------------- Human rights ---------------- */
  if (ui.humanRights) {
    const hr = ui.humanRights;
    const incidents = (hr.incidents ?? []).filter((i) => i.topic && !isBlank(i.confirmed));

    out.humanRights = {
      policyExists: hr.policyExists,
      policyCovers:
        hr.policyCovers?.other && !hr.policyCovers?.otherText?.trim()
          ? { ...hr.policyCovers, other: false }
          : hr.policyCovers,
      grievanceMechanism: hr.grievanceMechanism,
      incidents: incidents.length ? incidents : undefined,
    };
  }

  /* ---------------- Community ---------------- */
  if (ui.community) {
    const c = ui.community;

    const cashAmount = num(c.cashDonations?.amount);
    const cashCurrency = normalizeCurrency(c.cashDonations?.currency);
    const cash = cashCurrency && cashAmount !== undefined ? { amount: cashAmount, currency: cashCurrency } : undefined;

    const inKindAmount = num(c.inKindDonations?.amount);
    const inKindCurrency = normalizeCurrency(c.inKindDonations?.currency);
    const inKind =
      inKindCurrency && inKindAmount !== undefined
        ? { amount: inKindAmount, currency: inKindCurrency, description: c.inKindDonations?.description ?? undefined }
        : undefined;

    const comm = {
      volunteerHours: num(c.volunteerHours),
      cashDonations: cash,
      inKindDonations: inKind,
      estimatedBeneficiaries: num(c.estimatedBeneficiaries),
      sitesWithAssessment: num(c.sitesWithAssessment),
      totalSites: num(c.totalSites),
    };

    if (
      comm.volunteerHours !== undefined ||
      comm.estimatedBeneficiaries !== undefined ||
      comm.sitesWithAssessment !== undefined ||
      comm.totalSites !== undefined ||
      comm.cashDonations ||
      comm.inKindDonations
    ) {
      out.community = comm;
    }
  }

  return out;
}
