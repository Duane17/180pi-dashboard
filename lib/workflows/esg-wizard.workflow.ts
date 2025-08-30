// src/lib/workflows/esg-wizard.workflow.ts
"use client";

import type { ESGWizardValues } from "@/types/esg-wizard.types";

/* ===== Foundational & Governance mappers ===== */
import { mapGeneralToFoundationalPayload } from "@/lib/mappers/foundational.mapper";
import { syncGovernancePolicies } from "@/lib/mappers/policies.mapper";

/* ===== Governance (company-level) services ===== */
import {
  upsertCompanyCertification,
  upsertCompanyExternalAudit,
} from "@/lib/services/governance.client";

/* ===== Governance (company-level) mappers ===== */
import {
  toCertificationBody,
  toExternalAuditBody,
} from "@/lib/mappers/governance.mapper";

/* ===== Governance-Body (disclosure) types, services, mapper ===== */
import type { GovernanceUI, GovernanceUpsertPayload } from "@/types/governance.types";
import {
  createGovernance,
  upsertGovernance,
  __GOVERNANCE_CLIENT_VERSION__,
} from "@/lib/services/governance-body.client";
import { sanitizeGovernanceForUpsert } from "@/lib/mappers/governance-body.mapper";

/* ===== Foundational service ===== */
import { upsertFoundational } from "@/lib/services/foundational.client";

/* ===== Environment services ===== */
import {
  upsertGHGInventory,
  upsertResourceConsumption,
  createWaterSnapshot,
  replaceWaterRows,
  createBiodiversitySnapshot,
  replaceBiodiversity,
  createWasteSnapshot,
  addWasteRows,
  __ENV_CLIENT_VERSION__,
} from "@/lib/services/environment.client";

/* ===== Environment mappers ===== */
import {
  toGHGUpsert,
  toResourceUpsert,
  toWaterSnapshot,
  toWaterBulk,
  toBiodiversitySnapshot,
  toBiodiversityBulk,
  toWasteSnapshot,
  toWasteRows,
  __GHG_MAPPER_VERSION__,
} from "@/lib/mappers/environment.mapper";

/* ===== Social types, services & mapper ===== */
import type { SocialUI, SocialUpsertPayload } from "@/types/social.types";
import {
  createSocial,
  upsertSocial,
  __SOCIAL_CLIENT_VERSION__,
} from "@/lib/services/social.client";
import { sanitizeSocialForUpsert } from "@/lib/mappers/social.mapper";

/* ===== Workflow beacons ===== */
export const __WATER_WORKFLOW_VERSION__ = "v1";
export const __BIODIVERSITY_WORKFLOW_VERSION__ = "v1";
export const __WASTE_WORKFLOW_VERSION__ = "v1";
export const __SOCIAL_WORKFLOW_VERSION__ = "v1";
export const __GOVERNANCE_BODY_WORKFLOW_VERSION__ = "v1";

/** Module beacons: confirm mapper/client versions and runtime */
console.log("[WF] versions", {
  workflow: {
    water: __WATER_WORKFLOW_VERSION__,
    biodiversity: __BIODIVERSITY_WORKFLOW_VERSION__,
    waste: __WASTE_WORKFLOW_VERSION__,
    social: __SOCIAL_WORKFLOW_VERSION__,
    governanceBody: __GOVERNANCE_BODY_WORKFLOW_VERSION__,
  },
  mapper: __GHG_MAPPER_VERSION__,
  client: {
    environment: __ENV_CLIENT_VERSION__,
    social: __SOCIAL_CLIENT_VERSION__,
    governanceBody: __GOVERNANCE_CLIENT_VERSION__,
  },
  runtime: typeof window === "undefined" ? "server" : "browser",
});

/** Key used for local persistence of the whole wizard */
const LOCAL_STORAGE_KEY = "esg-wizard:v1";

/** Strip File objects before writing to localStorage */
export function stripFilesForLocalSave(values: ESGWizardValues): ESGWizardValues {
  const v = structuredClone(values);
  const sg = (v.general as any)?.sustainabilityGovernance;
  if (sg?.certification?.file) sg.certification.file = null;
  if (sg?.audit?.file) sg.audit.file = null;
  return v;
}

type BaseRunOptions = {
  companyId: string;
  /** When true, store a local mirror of the current values */
  mirrorToLocal?: boolean;
  /** If provided, use this function to write to local (so UI can control timing) */
  setLocal?: (key: string, value: string) => void;
};

export type SaveDraftResult = {
  ok: boolean;
  savedAt?: number;
  errors?: unknown;
  environment?: ESGWizardValues["environment"];
  social?: ESGWizardValues["social"];
  governance?: GovernanceUI | undefined; // NEW
};

export type SubmitResult = {
  ok: boolean;
  savedAt?: number;
  errors?: unknown;
  environment?: ESGWizardValues["environment"];
  social?: ESGWizardValues["social"];
  governance?: GovernanceUI | undefined; // NEW
};

/* ───────────────────────── Governance-Body path helper ─────────────────────────
 * Try to find where the governance-body UI slice lives inside ESGWizardValues.
 * We check a few common locations *without* breaking types at callsites.
 */
function pickGovernancePath(values: ESGWizardValues): {
  get(): GovernanceUI | undefined;
  set(updated: GovernanceUI): ESGWizardValues;
  label: string;
} {
  // 1) Top-level `governanceBody`
  if ("governanceBody" in (values as any)) {
    return {
      get: () => ((values as any).governanceBody as GovernanceUI | undefined),
      set: (updated) => {
        const clone = structuredClone(values) as any;
        clone.governanceBody = updated;
        return clone as ESGWizardValues;
      },
      label: "governanceBody",
    };
  }

  // 2) Top-level `governance` that looks like GovernanceUI (heuristic)
  if ("governance" in (values as any)) {
    const g = (values as any).governance;
    const seemsLikeGovernanceUI =
      g && (("ownership" in g) || ("body" in g) || ("oversight" in g) || ("committees" in g));
    if (seemsLikeGovernanceUI) {
      return {
        get: () => (g as GovernanceUI | undefined),
        set: (updated) => {
          const clone = structuredClone(values) as any;
          clone.governance = updated;
          return clone as ESGWizardValues;
        },
        label: "governance (UI-shape)",
      };
    }
  }

  // 3) Nested under general.governanceBody
  if ((values as any)?.general && "governanceBody" in (values as any).general) {
    return {
      get: () => ((values as any).general.governanceBody as GovernanceUI | undefined),
      set: (updated) => {
        const clone = structuredClone(values) as any;
        clone.general = clone.general ?? {};
        clone.general.governanceBody = updated;
        return clone as ESGWizardValues;
      },
      label: "general.governanceBody",
    };
  }

  // 4) Fallback (testing) — create top-level governanceBody
  return {
    get: () => undefined,
    set: (updated) => {
      const clone = structuredClone(values) as any;
      clone.governanceBody = updated;
      return clone as ESGWizardValues;
    },
    label: "(fallback) governanceBody",
  };
}

/* ============================================================================
 * Governance-Body sync helper
 * - Best-effort: returns updated GovernanceUI with id, or undefined if absent
 * ==========================================================================*/
async function syncGovernanceBodyOnly(
  companyId: string,
  values: ESGWizardValues
): Promise<GovernanceUI | undefined> {
  const path = pickGovernancePath(values);
  const governance = path.get();

  if (!governance) {
    console.log(`[GOV-BODY] skip — no governance slice on values at ${path.label}`);
    return undefined;
  }

  const updated: GovernanceUI = structuredClone(governance);

  try {
    // Ensure disclosure id exists
    let govId: string | undefined = (updated as any).id;
    if (!govId) {
      const created = await createGovernance(companyId);
      govId = (created as any)?.id ?? created?.id;
      (updated as any).id = govId;
      console.log("[GOV-BODY] created disclosure id", govId);
    } else {
      console.log("[GOV-BODY] using existing disclosure id", govId);
    }

    // Sanitize UI → payload expected by backend
    const payload: GovernanceUpsertPayload = sanitizeGovernanceForUpsert(updated);
    console.debug("[GOV-BODY] payload sent", JSON.stringify(payload, null, 2));

    if (govId && Object.keys(payload).length > 0) {
      await upsertGovernance(companyId, govId, payload);
      console.log("[GOV-BODY] upsert OK");
    } else if (!Object.keys(payload).length) {
      console.log("[GOV-BODY] nothing to upsert (empty payload after sanitize)");
    }
  } catch (e: any) {
    console.error("[GOV-BODY] sync error", e?.response?.data ?? e);
  }

  return updated;
}

/* ============================================================================
 * Social sync helper
 * ==========================================================================*/
async function syncSocialOnly(
  companyId: string,
  values: ESGWizardValues
): Promise<ESGWizardValues["social"] | undefined> {
  const social = (values as any)?.social as SocialUI | undefined;
  if (!social) {
    console.log("[SOCIAL] skip — no social block");
    return undefined;
  }
  const updated: SocialUI = structuredClone(social);
  try {
    let socialId: string | undefined = (updated as any).id;
    if (!socialId) {
      const created = await createSocial(companyId);
      socialId = (created as any)?.id ?? created?.id;
      (updated as any).id = socialId;
      console.log("[SOCIAL] created disclosure id", socialId);
    } else {
      console.log("[SOCIAL] using existing disclosure id", socialId);
    }
    const payload: SocialUpsertPayload = sanitizeSocialForUpsert(updated);
    console.debug("[SOCIAL] payload sent", JSON.stringify(payload, null, 2));
    if (socialId && Object.keys(payload).length > 0) {
      await upsertSocial(companyId, socialId, payload);
      console.log("[SOCIAL] upsert OK");
    } else if (!Object.keys(payload).length) {
      console.log("[SOCIAL] nothing to upsert (empty payload after sanitize)");
    }
  } catch (e: any) {
    console.error("[SOCIAL] sync error", e?.response?.data ?? e);
  }
  return updated;
}

/* ============================================================================
 * Environment sync helper (GHG + RC + Water + Biodiversity + Waste)
 * ==========================================================================*/
async function syncEnvironment(
  companyId: string,
  values: ESGWizardValues
): Promise<ESGWizardValues["environment"]> {
  const env = values.environment ?? {};
  const updated = structuredClone(env);

  const endStr =
    (values.general as any)?.disclosurePeriods?.sustainabilityPeriodEnd ??
    (values.general as any)?.disclosurePeriods?.financialPeriodEnd;

  let fallbackYear: number | undefined = undefined;
  if (endStr) {
    try { fallbackYear = new Date(endStr).getFullYear(); } catch {}
  }

  console.log("[ENV] sync start", {
    haveGHG: !!env.ghg,
    haveRC: !!env.resourceConsumption,
    haveWater: !!env.water,
    haveBio: !!env.biodiversity,
    haveWaste: !!env.waste,
  });

  // --- GHG
  try {
    const body = toGHGUpsert(env, { fallbackYear });
    console.log("[ENV] GHG payload keys", Object.keys(body ?? {}));
    console.log("[ENV] GHG payload row lengths", {
      s1: (body as any)?.scope1Rows?.length,
      s2: (body as any)?.scope2Rows?.length,
    });
    if (body) { await upsertGHGInventory(companyId, body); console.log("[ENV] GHG upsert OK"); }
    else { console.log("[ENV] GHG skipped (no valid payload)"); }
  } catch (e) {
    console.error("[ENV] GHG upsert error", (e as any)?.response?.data ?? e);
  }

  // --- Resource Consumption (ENERGY)
  try {
    const rcBody = toResourceUpsert(env);
    console.log("[ENV:ENERGY] RC payload", rcBody ?? "(skipped)");
    if (rcBody) {
      const resp = await upsertResourceConsumption(companyId, rcBody);
      console.log("[ENV:ENERGY] RC upsert OK", (resp as any)?.id ?? resp);
    }
  } catch (e: any) {
    console.error("[ENV:ENERGY] RC upsert error", e?.response?.data ?? e);
  }

  // --- Water (snapshot + bulk)
  try {
    const snapshotBody = toWaterSnapshot(env);
    const bulkBody = toWaterBulk(env);
    console.log("[ENV:WATER] snapshot payload", snapshotBody ?? "(skipped)");
    console.log("[ENV:WATER] bulk payload", bulkBody ?? "(skipped)");

    if (!snapshotBody && !bulkBody) {
      console.log("[ENV:WATER] skip — no snapshot or bulk payload");
    } else {
      let waterId: string | undefined = (env as any)?.water?.id;
      if (!waterId) {
        const created = await createWaterSnapshot(companyId, snapshotBody ?? {});
        waterId = (created as any)?.id ?? (created as any)?.water?.id ?? (created as any)?.data?.id;
        console.log("[ENV:WATER] created snapshot id", waterId);
        if (waterId) (updated as any).water = { ...(updated as any).water, id: waterId };
      } else {
        console.log("[ENV:WATER] using existing snapshot id", waterId);
      }
      if (waterId && bulkBody) {
        await replaceWaterRows(companyId, waterId, bulkBody);
        console.log("[ENV:WATER] rows replaced");
      }
    }
  } catch (e: any) {
    console.error("[ENV:WATER] error", e?.response?.data ?? e);
  }

  // --- Biodiversity
  try {
    const bioSnapshotBody = toBiodiversitySnapshot(env);
    const bioBulkBody = toBiodiversityBulk(env);
    console.log("[ENV:BIODIVERSITY] snapshot payload", bioSnapshotBody ?? "(skipped)");
    console.log("[ENV:BIODIVERSITY] bulk payload", bioBulkBody ?? "(skipped)");

    if (!bioSnapshotBody && !bioBulkBody) {
      console.log("[ENV:BIODIVERSITY] skip — no snapshot or bulk payload");
    } else {
      let biodiversityId: string | undefined = (env as any)?.biodiversity?.id;
      if (!biodiversityId) {
        const created = await createBiodiversitySnapshot(companyId, bioSnapshotBody ?? {});
        biodiversityId = (created as any)?.id ?? (created as any)?.biodiversity?.id ?? (created as any)?.data?.id;
        console.log("[ENV:BIODIVERSITY] created snapshot id", biodiversityId);
        if (biodiversityId) (updated as any).biodiversity = { ...(updated as any).biodiversity, id: biodiversityId };
      } else {
        console.log("[ENV:BIODIVERSITY] using existing snapshot id", biodiversityId);
      }
      if (biodiversityId && bioBulkBody) {
        await replaceBiodiversity(companyId, biodiversityId, bioBulkBody);
        console.log("[ENV:BIODIVERSITY] rows replaced");
      }
    }
  } catch (e: any) {
    console.error("[ENV:BIODIVERSITY] error", e?.response?.data ?? e);
  }

  // --- Waste (snapshot + rows)
  try {
    const wasteSnapshotBody = toWasteSnapshot(env);
    const wasteRows = toWasteRows(env);
    console.log("[ENV:WASTE] snapshot payload", wasteSnapshotBody ?? "(skipped)");
    console.log("[ENV:WASTE] rows payload", (wasteRows?.length ?? 0) ? `${wasteRows?.length} rows` : "(skipped)");
    if (!wasteSnapshotBody && (!wasteRows || wasteRows.length === 0)) {
      console.log("[ENV:WASTE] skip — no snapshot or rows payload");
    } else {
      let wasteId: string | undefined = (env as any)?.waste?.id;
      if (!wasteId) {
        const created = await createWasteSnapshot(companyId, wasteSnapshotBody ?? {});
        wasteId = (created as any)?.id ?? (created as any)?.waste?.id ?? (created as any)?.data?.id;
        console.log("[ENV:WASTE] created snapshot id", wasteId);
        if (wasteId) (updated as any).waste = { ...(updated as any).waste, id: wasteId };
      } else {
        console.log("[ENV:WASTE] using existing snapshot id", wasteId);
      }
      if (wasteId && wasteRows && wasteRows.length) {
        await addWasteRows(companyId, wasteId, wasteRows);
        console.log("[ENV:WASTE] rows added");
      }
    }
  } catch (e: any) {
    console.error("[ENV:WASTE] error", e?.response?.data ?? e);
  }

  return updated;
}

/* ============================================================================
 * Save Draft
 * ==========================================================================*/
export async function saveEsgDraft(
  values: ESGWizardValues,
  opts: BaseRunOptions
): Promise<SaveDraftResult> {
  const { companyId, mirrorToLocal = true, setLocal } = opts;
  try {
    // 1) Foundational (company + disclosure)
    const payload = mapGeneralToFoundationalPayload(values.general);
    await upsertFoundational(companyId, payload);

    // 2) Governance company-level bits (optional)
    const gov = (values.general as any)?.sustainabilityGovernance;
    if (gov) {
      const certBody = toCertificationBody(gov);
      if (
        certBody.hasSustainabilityCert !== undefined ||
        (certBody.certification &&
          (certBody.certification.issuer ||
            certBody.certification.issuingDate ||
            certBody.certification.fileUrl ||
            certBody.certification.fileName ||
            certBody.certification.fileMime ||
            typeof certBody.certification.fileSize === "number"))
      ) {
        await upsertCompanyCertification(companyId, certBody);
      }

      const auditBody = toExternalAuditBody(gov);
      if (
        auditBody.hasExternalAudit !== undefined ||
        (auditBody.audit && (auditBody.audit.issuer || auditBody.audit.issuingDate))
      ) {
        await upsertCompanyExternalAudit(companyId, auditBody);
      }

      await syncGovernancePolicies(companyId, gov, { status: "DRAFT" });
    }

    // 3) Governance-Body disclosure (Ownership/Body/Committees/Ethics/RPT/...)
    const govPath = pickGovernancePath(values);
    const updatedGovernance = await syncGovernanceBodyOnly(companyId, values);

    // 4) Social
    const updatedSocial = await syncSocialOnly(companyId, values);

    // 5) Environment
    const updatedEnv = await syncEnvironment(companyId, values);

    // 6) Local mirror (store with updated IDs/slices in the same place)
    if (mirrorToLocal) {
      let valuesForMirror: ESGWizardValues = updatedGovernance ? govPath.set(updatedGovernance) : values;
      const safe = stripFilesForLocalSave({
        ...valuesForMirror,
        social: updatedSocial ?? values.social,
        environment: updatedEnv,
      });
      const write = setLocal ?? ((k: string, v: string) => localStorage.setItem(k, v));
      write(LOCAL_STORAGE_KEY, JSON.stringify(safe));
    }

    return {
      ok: true,
      savedAt: Date.now(),
      environment: updatedEnv,
      social: updatedSocial ?? values.social,
      governance: updatedGovernance ?? govPath.get(),
    };
  } catch (errors) {
    return { ok: false, errors };
  }
}

/* ============================================================================
 * Final Submit
 * ==========================================================================*/
export async function submitEsgWizard(
  values: ESGWizardValues,
  opts: BaseRunOptions
): Promise<SubmitResult> {
  const { companyId, mirrorToLocal = true, setLocal } = opts;
  try {
    // 1) Foundational
    const payload = mapGeneralToFoundationalPayload(values.general);
    await upsertFoundational(companyId, payload);

    // 2) Governance company-level bits
    const gov = (values.general as any)?.sustainabilityGovernance;
    if (gov) {
      const certBody = toCertificationBody(gov);
      if (
        certBody.hasSustainabilityCert !== undefined ||
        (certBody.certification &&
          (certBody.certification.issuer ||
            certBody.certification.issuingDate ||
            certBody.certification.fileUrl ||
            certBody.certification.fileName ||
            certBody.certification.fileMime ||
            typeof certBody.certification.fileSize === "number"))
      ) {
        await upsertCompanyCertification(companyId, certBody);
      }

      const auditBody = toExternalAuditBody(gov);
      if (
        auditBody.hasExternalAudit !== undefined ||
        (auditBody.audit && (auditBody.audit.issuer || auditBody.audit.issuingDate))
      ) {
        await upsertCompanyExternalAudit(companyId, auditBody);
      }

      await syncGovernancePolicies(companyId, gov, { status: "ACTIVE" });
    }

    // 3) Governance-Body disclosure
    const govPath = pickGovernancePath(values);
    const updatedGovernance = await syncGovernanceBodyOnly(companyId, values);

    // 4) Social
    const updatedSocial = await syncSocialOnly(companyId, values);

    // 5) Environment
    const updatedEnv = await syncEnvironment(companyId, values);

    // 6) Local mirror
    if (mirrorToLocal) {
      let valuesForMirror: ESGWizardValues = updatedGovernance ? govPath.set(updatedGovernance) : values;
      const safe = stripFilesForLocalSave({
        ...valuesForMirror,
        social: updatedSocial ?? values.social,
        environment: updatedEnv,
      });
      const write = setLocal ?? ((k: string, v: string) => localStorage.setItem(k, v));
      write(LOCAL_STORAGE_KEY, JSON.stringify(safe));
    }

    return {
      ok: true,
      savedAt: Date.now(),
      environment: updatedEnv,
      social: updatedSocial ?? values.social,
      governance: updatedGovernance ?? govPath.get(),
    };
  } catch (errors) {
    return { ok: false, errors };
  }
}
