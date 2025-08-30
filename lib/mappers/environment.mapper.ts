// src/lib/mappers/environment.mapper.ts
import type { EnvironmentValues } from "@/types/esg-wizard.types";
import type {
  GHGUpsertBody,
  ResourceUpsertBody,
  WaterSnapshotCreateBody,
  WaterWithdrawalRow,
  WaterDischargeRow,
  WaterBulkBody,
  BiodiversitySnapshotCreateBody,
  BiodiversityBulkBody,
  WasteSnapshotCreateBody,
  WasteRow,
} from "@/lib/services/environment.client";

import { WasteRowUI } from "@/types/environment.waste.types";

import {
  WASTE_STREAMS,
  WASTE_HAZARD_CLASSES,
  WASTE_STATES,
  WASTE_ROUTES,
  WASTE_METHODS_DIVERTED,
  WASTE_METHODS_DISPOSAL,
  WASTE_DESTINATIONS,
  WASTE_UNITS,
  WASTE_MEASUREMENT_METHODS,
} from "@/constants/esg.waste.constants";


/**
 * Utilities: normalize undefined vs null and coerce numbers/dates.
 */
const isBlank = (v: unknown) => v === "" || v == null;
const strUndef = (v: unknown) => (isBlank(v) ? undefined : String(v));
const numUndef = (v: unknown) => (isBlank(v) ? undefined : Number(v));
const boolUndef = (v: unknown) => (isBlank(v) ? undefined : Boolean(v));

function isoDate(input?: string | Date | null) {
  if (!input) return undefined;
  if (typeof input === "string") return input || undefined;
  try {
    return new Date(input).toISOString().slice(0, 10);
  } catch {
    return undefined;
  }
}

const coercePeriod = (p: any) => {
  if (!p || typeof p !== "object") return {};
  const mode = String(p.mode ?? p.kind ?? "").toLowerCase();

  if (mode === "month" && typeof p.month === "string") {
    return { mode: "month", month: p.month }; // server coercer will handle it
  }
  const from = p.from ?? p.start ?? p.dateFrom;
  const to   = p.to   ?? p.end   ?? p.dateTo;
  if (mode === "range" || (from && to)) {
    return { mode: "range", from, to }; // server coercer will handle date strings
  }
  return p;
};

export const __GHG_MAPPER_VERSION__ = "mapper:v3-scope-rows";


const yesNoToBool = (v: unknown): boolean | undefined => {
  if (v == null || v === "") return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "yes") return true;
  if (s === "no") return false;
  return undefined;
};

const pickUi = <T extends readonly string[]>(v: unknown, allowed: T): T[number] | undefined => {
  if (typeof v !== "string") return undefined;
  const s = v.trim();
  return (allowed as readonly string[]).includes(s) ? (s as T[number]) : undefined;
};

/* ---------- Label→Enum mappers for GHG extra fields ---------- */

function toBoundaryEnum(v?: unknown): GHGUpsertBody["boundary"] | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "operational control") return "OPERATIONAL_CONTROL";
  if (s === "financial control") return "FINANCIAL_CONTROL";
  if (s === "equity share") return "EQUITY_SHARE";
  return undefined;
}

function toGwpEnum(v?: unknown): "AR5" | "AR6" | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toUpperCase();
  return s === "AR5" ? "AR5" : s === "AR6" ? "AR6" : undefined;
}

function toEfSourceEnum(
  v?: unknown
):
  | "GHG_PROTOCOL"
  | "IEA"
  | "DEFRA"
  | "NATIONAL_DB"
  | "SUPPLIER_SPECIFIC"
  | "OTHER"
  | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "ghg protocol" || s === "ghg_protocol") return "GHG_PROTOCOL";
  if (s === "iea") return "IEA";
  if (s === "defra") return "DEFRA";
  if (s === "national db" || s === "national_db") return "NATIONAL_DB";
  if (s === "supplier-specific" || s === "supplier_specific") return "SUPPLIER_SPECIFIC";
  if (s === "other") return "OTHER";
  return undefined;
}

function toRecalcReasonEnumOne(
  v?: unknown
): "STRUCTURAL_CHANGE" | "METHOD_CHANGE" | "ERROR" | "OTHER" | undefined {
  if (!v) return undefined;
  const s = String(v).trim().toLowerCase();
  if (s === "structural change" || s === "structural_change") return "STRUCTURAL_CHANGE";
  if (s === "method change" || s === "method_change") return "METHOD_CHANGE";
  if (s === "error") return "ERROR";
  if (s === "other") return "OTHER";
  return undefined;
}

function toRecalcReasonsEnum(
  arr?: unknown
):
  | Array<"STRUCTURAL_CHANGE" | "METHOD_CHANGE" | "ERROR" | "OTHER">
  | undefined {
  if (!Array.isArray(arr)) return undefined;
  const mapped = arr
    .map(toRecalcReasonEnumOne)
    .filter((x): x is NonNullable<ReturnType<typeof toRecalcReasonEnumOne>> => !!x);
  if (!mapped.length) return undefined;
  // de-dup and cap at 4 (schema limit)
  return Array.from(new Set(mapped)).slice(0, 4);
}

function clampPct(n: unknown): number | null | undefined {
  if (n == null || n === "") return undefined;
  const x = Number(n);
  if (!Number.isFinite(x)) return undefined;
  return Math.max(0, Math.min(100, x));
}

/* =========================
 * GHG
 * ========================= */

export function toGHGUpsert(
  env: EnvironmentValues,
  opts?: { siteId?: string | null; fallbackYear?: number }
): GHGUpsertBody | undefined {
  const v = env.ghg;
  if (!v) return undefined;
  const year = numUndef((v as any).year) ?? opts?.fallbackYear;
  const s1 = numUndef((v as any).scope1_tCO2e);
  const s2 = numUndef((v as any).scope2_tCO2e);
  if (!year || s1 === undefined || s2 === undefined) return undefined;
  // Try to read rows from explicit fields first
  const scope1Explicit: any[] =
    (Array.isArray((v as any).scope1Rows) && (v as any).scope1Rows) ||
    (Array.isArray((v as any).scope1) && (v as any).scope1) ||
    [];

  const scope2Explicit: any[] =
    (Array.isArray((v as any).scope2Rows) && (v as any).scope2Rows) ||
    (Array.isArray((v as any).scope2) && (v as any).scope2) ||
    [];

  // Fallback: parse full notes JSON (card stores meta + row arrays)
  let payloadFromNotes: any | undefined;
  if ((!scope1Explicit.length || !scope2Explicit.length) && typeof (v as any).notes === "string") {
    try { payloadFromNotes = JSON.parse((v as any).notes); } catch {}
  }
  const meta = payloadFromNotes?.meta;

  const body: Partial<GHGUpsertBody> = {
    year,
    scope1_tCO2e: Number(s1),
    scope2_tCO2e: Number(s2),
  };

  // siteId only when defined (lets server uniqueness be (siteId|null, year))
  const siteId = strUndef((v as any).siteId) ?? (opts?.siteId ?? undefined);
  if (siteId !== undefined) body.siteId = siteId;

  const s3 = numUndef((v as any).scope3_tCO2e);
  if (s3 !== undefined) body.scope3_tCO2e = s3;

  // boundary / equity
  const boundaryTop = strUndef((v as any).boundary) as GHGUpsertBody["boundary"] | undefined;
  const boundaryFromMeta = boundaryTop ?? toBoundaryEnum(meta?.boundary);
  if (boundaryFromMeta) body.boundary = boundaryFromMeta;

  const eqTop = numUndef((v as any).equitySharePct);
  const eqFromMeta = clampPct(meta?.equitySharePct);
  if (eqTop !== undefined) body.equitySharePct = eqTop;
  else if (eqFromMeta !== undefined) body.equitySharePct = eqFromMeta;

  // base/target years
  const baseTop = numUndef((v as any).baseYear);
  const tgtTop  = numUndef((v as any).targetYear);
  const baseFromMeta = numUndef(meta?.baseYear);
  const tgtFromMeta  = numUndef(meta?.targetYear);
  if (baseTop !== undefined) body.baseYear = baseTop;
  else if (baseFromMeta !== undefined) body.baseYear = baseFromMeta;
  if (tgtTop !== undefined) body.targetYear = tgtTop;
  else if (tgtFromMeta !== undefined) body.targetYear = tgtFromMeta;

  // GWP / EF source / recalc reasons
  const gwp = toGwpEnum(strUndef((v as any).gwpVersion) ?? meta?.gwpVersion);
  const ef  = toEfSourceEnum(strUndef((v as any).efSource) ?? meta?.efSource);
  const rec = toRecalcReasonsEnum(
    Array.isArray((v as any).recalcReasons) ? (v as any).recalcReasons : meta?.recalcReasons
  );
  if (gwp) (body as any).gwpVersion = gwp;
  if (ef)  (body as any).efSource = ef;
  if (rec) (body as any).recalcReasons = rec;

  // keep notes (audit trail)
  const notes = strUndef((v as any).notes);
  if (notes) body.notes = notes;

  // methodology / ids / evidence
  const methodology = strUndef((v as any).methodology) as GHGUpsertBody["methodology"] | undefined;
  if (methodology !== undefined) body.methodology = methodology;

  const methodologyId = strUndef((v as any).methodologyId);
  if (methodologyId !== undefined) body.methodologyId = methodologyId;

  const methodologyNotes = strUndef((v as any).methodologyNotes);
  if (methodologyNotes) body.methodologyNotes = methodologyNotes;

  const emissionFactors = (v as any).emissionFactors;
  if (emissionFactors !== undefined) body.emissionFactors = emissionFactors;

  const uncertaintyPct = numUndef((v as any).uncertaintyPct);
  if (uncertaintyPct !== undefined) body.uncertaintyPct = uncertaintyPct;

  const evidenceId = strUndef((v as any).evidenceId);
  if (evidenceId !== undefined) body.evidenceId = evidenceId;

  // ---- Scope 1/2 rows (prefer explicit, fallback to notes) ----
  const scope1Source: any[] =
    scope1Explicit.length
      ? scope1Explicit
      : (Array.isArray(payloadFromNotes?.scope1) ? payloadFromNotes.scope1 : []);
  const scope2Source: any[] =
    scope2Explicit.length
      ? scope2Explicit
      : (Array.isArray(payloadFromNotes?.scope2) ? payloadFromNotes.scope2 : []);

  const s1Rows = scope1Source.map((r) => {
    const cat = String(r.category ?? r.Category ?? "").toLowerCase();
    const category =
      cat === "stationary" ? "STATIONARY" :
      cat === "mobile"     ? "MOBILE"     :
      cat === "fugitive"   ? "FUGITIVE"   : "PROCESS";
    return {
      category,
      activity: String(r.activity ?? r.Activity ?? ""),
      quantity: isBlank(r.quantity) ? null : Number(r.quantity),
      unit: String(r.unit ?? r.Unit ?? ""),
      efKgPerUnit: isBlank(r.efKgPerUnit) ? null : Number(r.efKgPerUnit),
      refrigerant: r.refrigerant ? String(r.refrigerant) : null,
    };
  });

  const s2Rows = scope2Source.map((r) => {
    const e = String(r.energyType ?? r.EnergyType ?? "").toLowerCase();
    const energyType =
      e === "electricity"    ? "ELECTRICITY" :
      e === "district heat"  ? "DISTRICT_HEAT" :
      e === "steam"          ? "STEAM" :
                               "COOLING";
    return {
      energyType,
      quantity: isBlank(r.quantity) ? null : Number(r.quantity),
      unit: String(r.unit ?? ""),
      country: r.country ? String(r.country) : null,
      supplierName: r.supplierName ? String(r.supplierName) : null,
      supplierEF_kgCO2e_per_kWh: isBlank(r.supplierEF_kgCO2e_per_kWh)
        ? null
        : Number(r.supplierEF_kgCO2e_per_kWh),
      contracts: r.contracts ?? null,
    };
  });
  if (s1Rows.length) (body as any).scope1Rows = s1Rows;
  if (s2Rows.length) (body as any).scope2Rows = s2Rows;

  // Diagnostics so you can verify the pipeline end-to-end
  const bodyKeys = Object.keys(body as any);
  return body as GHGUpsertBody;
}



/* =========================
 * RESOURCE CONSUMPTION
 * ========================= */

// src/lib/mappers/environment.mapper.ts

// src/lib/mappers/environment.mapper.ts

export function toResourceUpsert(
  env: EnvironmentValues,
  opts?: { siteId?: string | null }
): ResourceUpsertBody | undefined {
  const v = env.resourceConsumption;
  if (!v) return undefined;

  const recordedAt = isoDate((v as any).recordedAt); // "YYYY-MM-DD"
  const siteId = strUndef((v as any).siteId) ?? (opts?.siteId ?? null);

  const energyMWh   = numUndef((v as any).energyMWh);
  const waterM3     = numUndef((v as any).waterM3);
  const wasteTonnes = numUndef((v as any).wasteTonnes);

  const electricityBreakdown = Array.isArray((v as any).electricityBreakdown)
    ? (v as any).electricityBreakdown : undefined;
  const selfGenBreakdown = Array.isArray((v as any).selfGenBreakdown)
    ? (v as any).selfGenBreakdown : undefined;
  const fuelsBreakdown = Array.isArray((v as any).fuelsBreakdown)
    ? (v as any).fuelsBreakdown : undefined;

  const coreImpactData = (v as any).coreImpactData ?? undefined;

  // -------- helpers for normalization --------
  const yn = (x: any): boolean | undefined => {
    if (x === true || x === false) return x;
    if (typeof x === "string") {
      const s = x.trim().toLowerCase();
      if (["y","yes","true","1"].includes(s)) return true;
      if (["n","no","false","0"].includes(s)) return false;
    }
    return undefined;
  };

  type EnergyType = NonNullable<ResourceUpsertBody["purchased"]>[number]["energyType"];

  const eType = (s: any): EnergyType => {
    const t = String(s ?? "ELECTRICITY").toLowerCase();
    if (t.includes("district")) return "DISTRICT_HEAT";
    if (t.includes("steam"))    return "STEAM";
    if (t.includes("cool"))     return "COOLING";
    return "ELECTRICITY";
    };

  const num = (x: any): number | undefined =>
    x === null || x === undefined || x === "" ? undefined : Number(x);

  const str = (x: any): string | undefined =>
    x === null || x === undefined ? undefined : String(x);

  // -------- derive normalized arrays from coreImpactData --------
  const purchased =
    Array.isArray(coreImpactData?.purchased)
      ? (coreImpactData.purchased as any[]).map(r => ({
          energyType: eType(r.energyType),
          quantity: num(r.quantity),
          unit: str(r.unit) ?? "",
          country: str(r.country) ?? null,
          supplierFactorKgCO2ePerKWh: num(r.supplierFactorKgCO2ePerKWh),
          hasCertificates: yn(r.hasCertificates),
          renewable: yn(r.renewable),
          renewableSubtype: str(r.renewableSubtype) ?? null,
          volumeKWh: num(r.volumeKWh),
        })).filter(x => x.unit)
      : undefined;

  const selfGen =
    Array.isArray(coreImpactData?.selfGen)
      ? (coreImpactData.selfGen as any[]).map(r => ({
          source: str(r.source) ?? "",
          grossKWh: num(r.grossKWh),
          fuelBased: yn(r.fuelBased),
          exportedKWh: num(r.exportedKWh),
          selfConsumedKWh: num(r.selfConsumedKWh),
        })).filter(x => x.source)
      : undefined;

  const sold =
    Array.isArray(coreImpactData?.sold)
      ? (coreImpactData.sold as any[]).map(r => ({
          type: str(r.type) ?? "Electricity",
          kWh: num(r.kWh),
        }))
      : undefined;

  const fuels =
    Array.isArray(coreImpactData?.fuels)
      ? (coreImpactData.fuels as any[]).map(r => ({
          use: str(r.use) ?? undefined,
          fuelType: str(r.fuelType) ?? "",
          unit: str(r.unit) ?? "",
          quantity: num(r.quantity),
          renewable: yn(r.renewable),
          renewableSubtype: str(r.renewableSubtype) ?? undefined,
        })).filter(x => x.fuelType && x.unit)
      : undefined;

  const intensity = coreImpactData?.intensity
    ? {
        denominatorType: ((): any => {
          const s = String(coreImpactData.intensity.denominatorType ?? "").toUpperCase();
          return ["FTE","OUTPUT","REVENUE","FLOOR_AREA","OTHER"].includes(s) ? s : undefined;
        })(),
        denominatorValue: num(coreImpactData.intensity.denominatorValue),
        denominatorUnitNote: str(coreImpactData.intensity.denominatorUnitNote) ?? undefined,
      }
    : undefined;

  const hasAnyNumeric = energyMWh !== undefined || waterM3 !== undefined || wasteTonnes !== undefined;
  const hasAnyBreakdown =
    (electricityBreakdown?.length ?? 0) > 0 ||
    (selfGenBreakdown?.length ?? 0) > 0 ||
    (fuelsBreakdown?.length ?? 0) > 0;
  const hasAnyNormalized =
    (purchased?.length ?? 0) > 0 ||
    (selfGen?.length ?? 0) > 0 ||
    (sold?.length ?? 0) > 0 ||
    (fuels?.length ?? 0) > 0 ||
    intensity !== undefined;

  const note = strUndef((v as any).note) ?? null;
  const evidenceId = strUndef((v as any).evidenceId) ?? null;

  if (!recordedAt && !hasAnyNumeric && !hasAnyBreakdown && !hasAnyNormalized && note === null && evidenceId === null && siteId === null) {
    console.log("[MAPPER:RC] skip — no RC fields present");
    return undefined;
  }

  const body: ResourceUpsertBody = {
    siteId,
    recordedAt: recordedAt ?? new Date().toISOString().slice(0, 10),
    energyMWh: isBlank(energyMWh) ? undefined : Number(energyMWh),
    waterM3: isBlank(waterM3) ? undefined : Number(waterM3),
    wasteTonnes: isBlank(wasteTonnes) ? undefined : Number(wasteTonnes),

    // legacy blobs (keep, if you still want them)
    electricityBreakdown,
    selfGenBreakdown,
    fuelsBreakdown,
    coreImpactData,

    // ✅ normalized rows + intensity
    ...(purchased && purchased.length ? { purchased } : {}),
    ...(selfGen && selfGen.length ? { selfGen } : {}),
    ...(sold && sold.length ? { sold } : {}),
    ...(fuels && fuels.length ? { fuels } : {}),
    ...(intensity ? { intensity } : {}),

    note,
    evidenceId,
  };

  console.log("[MAPPER:RC] built body", {
    recordedAt: body.recordedAt,
    hasAnyNumeric,
    legacy: {
      eLen: electricityBreakdown?.length ?? 0,
      sLen: selfGenBreakdown?.length ?? 0,
      fLen: fuelsBreakdown?.length ?? 0,
    },
    normalized: {
      purchased: purchased?.length ?? 0,
      selfGen: selfGen?.length ?? 0,
      sold: sold?.length ?? 0,
      fuels: fuels?.length ?? 0,
      hasIntensity: !!intensity,
    },
    siteId,
  });

  return body;
}



/* =========================
 * WATER
 * ========================= */

export function toWaterSnapshot(
  env: EnvironmentValues,
  opts?: { siteId?: string | null }
): WaterSnapshotCreateBody | undefined {
  const w = env.water;
  if (!w) return undefined;

  const hasRows = (w.withdrawals?.length || 0) > 0 || (w.discharges?.length || 0) > 0;
  const note = strUndef(w.note);
  if (!hasRows && !note) return undefined;

  return {
    siteId: strUndef((w as any).siteId) ?? (opts?.siteId ?? null),
    snapshotDate: undefined,
    ...(note ? { note } : {}),
  };
}

export function toWaterBulk(env: EnvironmentValues): WaterBulkBody | undefined {
  const w = env.water;
  if (!w) return undefined;

  const mapWithdrawal = (r: any): WaterWithdrawalRow => ({
    source: r.source,
    quality: r.quality,
    quantity: isBlank(r.quantity) ? undefined : Number(r.quantity),
    unit: r.unit,
    method: r.method,
    period: coercePeriod(r.period),
    country: strUndef(r.country) ?? null,
    region: strUndef(r.region) ?? null,
    city: strUndef(r.city) ?? null,
  });

  const mapDischarge = (r: any): WaterDischargeRow => ({
    destination: r.destination,
    sentToOtherOrgForReuse: yesNoToBool(r.sentToOtherOrgForReuse),
    quality: r.quality,
    treatmentLevel: normalizeTreatmentLevel(r.treatmentLevel),
    quantity: isBlank(r.quantity) ? undefined : Number(r.quantity),
    unit: r.unit,
    method: r.method,
    period: coercePeriod(r.period),
    country: strUndef(r.country) ?? null,
    region: strUndef(r.region) ?? null,
    city: strUndef(r.city) ?? null,
  });

  const withdrawals = Array.isArray(w.withdrawals) ? w.withdrawals.map(mapWithdrawal) : [];
  const discharges = Array.isArray(w.discharges) ? w.discharges.map(mapDischarge) : [];

  if (!withdrawals.length && !discharges.length) return undefined;

  return { withdrawals, discharges };
}

function normalizeTreatmentLevel(
  v: unknown
): "None" | "Primary" | "Secondary" | "Tertiary" | null | undefined {
  if (v === "" || v == null) return null;
  const s = String(v).trim().toLowerCase();
  switch (s) {
    case "none":
      return "None";
    case "primary":
      return "Primary";
    case "secondary":
      return "Secondary";
    case "tertiary":
      return "Tertiary";
    default:
      return undefined;
  }
}

/* =========================
 * BIODIVERSITY
 * ========================= */

export function toBiodiversitySnapshot(
  env: EnvironmentValues,
  opts?: { siteId?: string | null }
): BiodiversitySnapshotCreateBody | undefined {
  const b = env.biodiversity;
  if (!b) return undefined;

  const hasRows = (b.sites?.length || 0) > 0 || (b.impacts?.length || 0) > 0;
  const note = strUndef(b.note);
  if (!hasRows && !note) return undefined;

  return {
    siteId: strUndef((b as any).siteId) ?? (opts?.siteId ?? null),
    ...(note ? { note } : {}),
  };
}

export function toBiodiversityBulk(env: EnvironmentValues): BiodiversityBulkBody | undefined {
  const b = env.biodiversity;
  if (!b) return undefined;

  const sites = Array.isArray(b.sites)
    ? b.sites.map((s: any) => {
        const d = s.designation ?? {};
        return {
          latitude: isBlank(s.latitude) ? undefined : Number(s.latitude),
          longitude: isBlank(s.longitude) ? undefined : Number(s.longitude),
          areaHectares: isBlank(s.areaHectares) ? undefined : Number(s.areaHectares),
          habitat: strUndef(s.habitat) ?? null,
          protectedArea: boolUndef(d.protectedArea) ?? undefined,
          kba:          boolUndef(d.kba) ?? undefined,
          ramsar:       boolUndef(d.ramsar) ?? undefined,
          natura2000:   boolUndef(d.natura2000) ?? undefined,
          other:        boolUndef(d.other) ?? undefined,
          otherText:    strUndef(d.otherText) ?? null,
        };
      })
    : [];

  const impacts = Array.isArray(b.impacts)
    ? b.impacts.map((r: any) => {
        const m = r.mitigation ?? {};
        return {
          activity: String(r.activity ?? ""),
          receptor: String(r.receptor ?? ""),
          proximity: String(r.proximity ?? ""),
          severity: isBlank(r.severity) ? undefined : Number(r.severity),
          extent: isBlank(r.extent) ? undefined : Number(r.extent),
          irreversibility: isBlank(r.irreversibility) ? undefined : Number(r.irreversibility),
          mitigateAvoid:    boolUndef(m.avoid) ?? undefined,
          mitigateMinimize: boolUndef(m.minimize) ?? undefined,
          mitigateRestore:  boolUndef(m.restore) ?? undefined,
          mitigateOffset:   boolUndef(m.offset) ?? undefined,
        };
      })
    : [];

  if (!sites.length && !impacts.length) return undefined;
  return { sites, impacts };
}

export function toWasteSnapshot(
  env: EnvironmentValues,
  opts?: { siteId?: string | null }
): WasteSnapshotCreateBody | undefined {
  const w = env.waste;
  if (!w) return undefined;

  const hasRows = (w.rows?.length || 0) > 0;
  const note = strUndef(w.note);

  // if nothing at all (no rows, no note, no siteId intention) -> skip
  if (!hasRows && !note && (strUndef((w as any).siteId) ?? opts?.siteId ?? null) === null) {
    return undefined;
  }

  return {
    siteId: strUndef((w as any).siteId) ?? (opts?.siteId ?? null),
    ...(note ? { note } : {}),
  };
}


export function toWasteRows(env: EnvironmentValues): WasteRowUI[] | undefined {
  const w = env.waste;
  if (!w || !Array.isArray(w.rows)) return undefined;

  const rows: WasteRowUI[] = w.rows
    .map((r: any) => {
      // assume UI labels are already present in r.*
      if (!r?.stream) return undefined;
      return {
        stream: r.stream,
        hazardClass: r.hazardClass,
        physicalState: r.physicalState,
        managementRoute: r.managementRoute,
        managementMethod: r.managementMethod,
        destination: r.destination,
        quantity: r.quantity ?? undefined,
        unit: r.unit as (typeof WASTE_UNITS)[number] | undefined,
        measurementMethod: r.measurementMethod,
        otherStreamText: r.otherStreamText?.trim() || undefined,
      } as WasteRowUI;
    })
    .filter(Boolean) as WasteRowUI[];

  return rows.length ? rows : undefined;
}