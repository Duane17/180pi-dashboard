// components/upload/sustainability-governance-card.tsx
"use client";

import * as React from "react";

/* ---------------------------------- Types ---------------------------------- */

export type PolicyKey =
  | "CLIMATE_CHANGE"
  | "POLLUTION"
  | "WATER_MARINE"
  | "BIODIVERSITY"
  | "CIRCULAR_ECONOMY"
  | "OWN_WORKFORCE"
  | "VALUE_CHAIN_WORKERS"
  | "AFFECTED_COMMUNITIES"
  | "CONSUMERS_END_USERS"
  | "BUSINESS_CONDUCT";

export interface PolicyStatus {
  isPublic?: boolean;   // Publicly available (Y/N)
  hasTargets?: boolean; // Policy has targets (Y/N)
}

export type PoliciesMap = Partial<Record<PolicyKey, PolicyStatus>>;

/** Certification details shown when hasSustainabilityCert = true */
export interface CertificationInfo {
  issuer?: string;
  issuingDate?: string; // "yyyy-mm-dd" for UI convenience
  file?: File | null;   // single file upload
}

export interface AuditInfo {
  issuer?: string;
  issuingDate?: string;   // <-- string for UI
  file?: File | null;
}

export interface SustainabilityGovernanceValues {
  /** Any sustainability related certification or label (Y/N) */
  hasSustainabilityCert?: boolean;

  /** Certification details (rendered only if hasSustainabilityCert = true) */
  certification?: CertificationInfo;

  /** Company-level flags about practices/policies/initiatives */
  draftedPractices?: boolean;      // gating question
  arePubliclyAvailable?: boolean;  // (kept in type; not rendered globally)
  haveTargets?: boolean;           // (kept in type; not rendered globally)
  accountableJobTitle?: string;    // shown only when draftedPractices = true

  /** Per-domain policy status (Publicly available? Targets?) */
  policies?: PoliciesMap;          // shown only when draftedPractices = true

  /** External audit available (Y/N) */
  hasExternalAudit?: boolean;

  /** NEW: External audit details (rendered only if hasExternalAudit = true) */
  audit?: AuditInfo;
}

type Errors = Partial<
  Record<keyof SustainabilityGovernanceValues, string | undefined>
> & {
  policies?: Partial<Record<PolicyKey, Partial<Record<keyof PolicyStatus, string | undefined>>>>;
  certification?: Partial<Record<keyof CertificationInfo, string | undefined>>;
  /** NEW: nested error hints for audit fields */
  audit?: Partial<Record<keyof AuditInfo, string | undefined>>;
};

export interface SustainabilityGovernanceCardProps {
  value: SustainabilityGovernanceValues;
  onChange: (partial: Partial<SustainabilityGovernanceValues>) => void;
  errors?: Errors;
}

/* ------------------------------ Static options ----------------------------- */

const POLICY_ROWS: Array<{ key: PolicyKey; label: string }> = [
  { key: "CLIMATE_CHANGE",       label: "Climate change" },
  { key: "POLLUTION",            label: "Pollution" },
  { key: "WATER_MARINE",         label: "Water and Marine Resources" },
  { key: "BIODIVERSITY",         label: "Biodiversity and Ecosystems" },
  { key: "CIRCULAR_ECONOMY",     label: "Circular Economy" },
  { key: "OWN_WORKFORCE",        label: "Own Workforce" },
  { key: "VALUE_CHAIN_WORKERS",  label: "Workers in the Value Chain" },
  { key: "AFFECTED_COMMUNITIES", label: "Affected Communities" },
  { key: "CONSUMERS_END_USERS",  label: "Consumers and end-users" },
  { key: "BUSINESS_CONDUCT",     label: "Business conduct" },
];

/* --------------------------------- Helpers --------------------------------- */

function ensurePolicy(map: PoliciesMap | undefined, key: PolicyKey): PolicyStatus {
  return { ...(map?.[key] ?? {}) };
}

function setPolicy(
  map: PoliciesMap | undefined,
  key: PolicyKey,
  patch: Partial<PolicyStatus>
): PoliciesMap {
  const next: PoliciesMap = { ...(map ?? {}) };
  next[key] = { ...ensurePolicy(map, key), ...patch };
  return next;
}

function setCertification(
  current: CertificationInfo | undefined,
  patch: Partial<CertificationInfo>
): CertificationInfo {
  return { ...(current ?? {}), ...patch };
}

/** NEW: safe nested patch for audit object */
function setAudit(current: AuditInfo | undefined, patch: Partial<AuditInfo>): AuditInfo {
  return { ...(current ?? {}), ...patch };
}

/* --------------------------------- Component -------------------------------- */

export function SustainabilityGovernanceCard({
  value,
  onChange,
  errors,
}: SustainabilityGovernanceCardProps) {
  const policies = value.policies ?? {};
  const cert = value.certification ?? {};
  const audit = value.audit ?? {};
  const drafted = value.draftedPractices === true;

  const handleTopLevelBoolean =
    (key: keyof SustainabilityGovernanceValues) =>
    (e: React.ChangeEvent<HTMLInputElement>) =>
      onChange({ [key]: e.target.checked } as Partial<SustainabilityGovernanceValues>);

  // Specialized toggle: when turning draftedPractices OFF, clear the policy matrix
  const handleDraftedToggle = (e: React.ChangeEvent<HTMLInputElement>) => {
    const checked = e.target.checked;
    if (!checked) {
      onChange({ draftedPractices: false, policies: {} });
    } else {
      onChange({ draftedPractices: true });
    }
  };

  const handleText =
    (key: keyof SustainabilityGovernanceValues) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onChange({ [key]: e.target.value } as Partial<SustainabilityGovernanceValues>);

  const togglePolicy =
    (key: PolicyKey, field: keyof PolicyStatus) =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange({ policies: setPolicy(policies, key, { [field]: e.target.checked }) });
    };

  const setCertField =
    <K extends keyof CertificationInfo>(key: K) =>
    (v: CertificationInfo[K]) =>
      onChange({ certification: setCertification(cert, { [key]: v }) });

  const onCertFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange({ certification: setCertification(cert, { file }) });
  };

  const clearCertFile = () => {
    onChange({ certification: setCertification(cert, { file: null }) });
  };

  /** NEW: audit field handlers */
  const setAuditField =
    <K extends keyof AuditInfo>(key: K) =>
    (v: AuditInfo[K]) =>
      onChange({ audit: setAudit(audit, { [key]: v }) });

  const onAuditFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    onChange({ audit: setAudit(audit, { file }) });
  };

  const clearAuditFile = () => {
    onChange({ audit: setAudit(audit, { file: null }) });
  };

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Sustainability Certifications, Policies & Targets
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Indicate certifications, drafted policies, per-topic availability/targets, and external audit.
        </p>
      </div>

      {/* Body */}
      <div className="px-4 py-5 space-y-6">
        {/* Certifications/labels (Y/N) */}
        <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Any sustainability related certification or label
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
              checked={value.hasSustainabilityCert === true}
              onChange={handleTopLevelBoolean("hasSustainabilityCert")}
            />
            <span>Yes</span>
          </label>
          {errors?.hasSustainabilityCert && (
            <span className="mt-1 block text-xs text-red-600">{errors.hasSustainabilityCert}</span>
          )}
          <p className="mt-1 text-xs text-gray-600">Uncheck to indicate “No”.</p>

          {/* Certification details when Yes */}
          {value.hasSustainabilityCert === true && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Issuer */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Issuer</label>
                <input
                  type="text"
                  value={cert.issuer ?? ""}
                  onChange={(e) => setCertField("issuer")(e.target.value)}
                  placeholder="e.g., ISO, B Lab, Fairtrade, FSC"
                  className="w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                />
                {errors?.certification?.issuer && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.certification.issuer}
                  </span>
                )}
              </div>

              {/* Issuing date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Issuing date</label>
                <input
                  type="date"
                  value={(cert.issuingDate as any) ?? ""}
                  onChange={(e) => setCertField("issuingDate")(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                />
                {errors?.certification?.issuingDate && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.certification.issuingDate}
                  </span>
                )}
              </div>

              {/* Upload */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Upload certificate (PDF/Image)
                </label>

                {cert.file ? (
                  <div className="flex items-center justify-between rounded-xl border border-gray-300/70 bg-white/70 px-3 py-2 backdrop-blur-sm">
                    <div className="truncate text-sm text-gray-800">
                      {cert.file.name}{" "}
                      <span className="text-gray-500">({Math.ceil(cert.file.size / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearCertFile}
                      className="rounded-lg border border-gray-300/70 bg-white/60 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    className="inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md"
                    style={{ background: "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)" }}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={onCertFileChange}
                    />
                    Upload file
                  </label>
                )}
                {errors?.certification?.file && (
                  <span className="mt-1 block text-xs text-red-600">
                    {errors.certification.file}
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Gating question: drafted policies? */}
        <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Have you drafted any sustainability-related policies/practices/initiatives?
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
              checked={value.draftedPractices === true}
              onChange={handleDraftedToggle}
            />
            <span>Yes</span>
          </label>
          {errors?.draftedPractices && (
            <span className="mt-1 block text-xs text-red-600">{errors.draftedPractices}</span>
          )}

          {/* When drafted = true, show accountable role */}
          {drafted && (
            <div className="mt-4">
              <label className="mb-1 block text-sm font-medium text-gray-800">
                Job title accountable for implementation (if applicable)
              </label>
              <input
                type="text"
                value={value.accountableJobTitle ?? ""}
                onChange={handleText("accountableJobTitle")}
                placeholder="e.g., Head of Sustainability, ESG Manager"
                className="w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
              />
              {errors?.accountableJobTitle && (
                <span className="mt-1 block text-xs text-red-600">
                  {errors.accountableJobTitle}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Policies matrix — only when drafted = true */}
        {drafted && (
          <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
            <div className="flex items-end justify-between gap-3">
              <div>
                <h4 className="font-medium text-gray-900">Policies by topic</h4>
                <p className="text-sm text-gray-600">
                  For each topic, indicate whether a policy is publicly available and whether it includes targets.
                </p>
                {Object.keys(policies ?? {}).length === 0 && (
                  <p className="mt-1 text-xs text-gray-600">
                    Toggle the checkboxes below to start capturing availability and targets per topic.
                  </p>
                )}
              </div>
            </div>

            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-700">
                    <th className="py-2 pr-4">Topic</th>
                    <th className="py-2 pr-4">Publicly available (Y/N)</th>
                    <th className="py-2 pr-4">Has targets (Y/N)</th>
                  </tr>
                </thead>
                <tbody className="align-top">
                  {POLICY_ROWS.map((row) => {
                    const status = ensurePolicy(policies, row.key);
                    const rowErrors = errors?.policies?.[row.key];

                    return (
                      <tr key={row.key} className="border-t border-gray-200/70">
                        <td className="py-3 pr-4 text-gray-900">{row.label}</td>
                        <td className="py-3 pr-4">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                              checked={status.isPublic === true}
                              onChange={togglePolicy(row.key, "isPublic")}
                            />
                            <span className="text-gray-800">Yes</span>
                          </label>
                          {rowErrors?.isPublic && (
                            <div className="mt-1 text-xs text-red-600">{rowErrors.isPublic}</div>
                          )}
                        </td>
                        <td className="py-3 pr-4">
                          <label className="inline-flex items-center gap-2">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
                              checked={status.hasTargets === true}
                              onChange={togglePolicy(row.key, "hasTargets")}
                            />
                            <span className="text-gray-800">Yes</span>
                          </label>
                          {rowErrors?.hasTargets && (
                            <div className="mt-1 text-xs text-red-600">{rowErrors.hasTargets}</div>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <p className="mt-3 text-xs text-gray-600">Tip: Leaving a box unchecked indicates “No”.</p>
          </div>
        )}

        {/* External audit (Y/N) */}
        <div className="rounded-2xl border border-gray-200/70 bg-white/60 p-4 backdrop-blur-sm">
          <label className="mb-2 block text-sm font-medium text-gray-800">
            Is there an external audit available?
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800 select-none">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-gray-300 focus:ring-[#3270a1]"
              checked={value.hasExternalAudit === true}
              onChange={handleTopLevelBoolean("hasExternalAudit")}
            />
            <span>Yes</span>
          </label>
          {errors?.hasExternalAudit && (
            <span className="mt-1 block text-xs text-red-600">{errors.hasExternalAudit}</span>
          )}
          <p className="mt-1 text-xs text-gray-600">Uncheck to indicate “No”.</p>

          {/* NEW: Audit details when Yes */}
          {value.hasExternalAudit === true && (
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* Issuer */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Audit issuer</label>
                <input
                  type="text"
                  value={audit.issuer ?? ""}
                  onChange={(e) => setAuditField("issuer")(e.target.value)}
                  placeholder="e.g., Big Four firm, accredited verifier"
                  className="w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                />
                {errors?.audit?.issuer && (
                  <span className="mt-1 block text-xs text-red-600">{errors.audit.issuer}</span>
                )}
              </div>

              {/* Date */}
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-800">Audit date</label>
                <input
                  type="date"
                  value={(audit.issuingDate as any) ?? ""}
                  onChange={(e) => setAuditField("issuingDate")(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white/70 backdrop-blur px-3 py-2 focus:outline-none focus:ring-2 focus:ring-[#3270a1]"
                />
                {errors?.audit?.issuingDate && (
                  <span className="mt-1 block text-xs text-red-600">{errors.audit.issuingDate}</span>
                )}
              </div>

              {/* Upload */}
              <div className="sm:col-span-2">
                <label className="mb-1 block text-sm font-medium text-gray-800">
                  Upload audit report (PDF/Image) — optional
                </label>

                {audit.file ? (
                  <div className="flex items-center justify-between rounded-xl border border-gray-300/70 bg-white/70 px-3 py-2 backdrop-blur-sm">
                    <div className="truncate text-sm text-gray-800">
                      {audit.file.name}{" "}
                      <span className="text-gray-500">({Math.ceil(audit.file.size / 1024)} KB)</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAuditFile}
                      className="rounded-lg border border-gray-300/70 bg-white/60 px-3 py-1.5 text-sm text-gray-800 shadow-sm backdrop-blur-sm transition hover:bg-white/80"
                    >
                      Remove
                    </button>
                  </div>
                ) : (
                  <label
                    className="inline-flex cursor-pointer items-center justify-center rounded-lg px-4 py-2 text-sm font-medium text-white shadow hover:shadow-md"
                    style={{ background: "linear-gradient(90deg, #3270a1 0%, #7e509c 50%, #8dcddb 100%)" }}
                  >
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={onAuditFileChange}
                    />
                    Upload file
                  </label>
                )}
                {errors?.audit?.file && (
                  <span className="mt-1 block text-xs text-red-600">{errors.audit.file}</span>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
