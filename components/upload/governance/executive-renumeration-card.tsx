"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  SectionHeader,
  NumberField,
  TextField,
  SelectField,
  RowList,
  Divider,
} from "@/components/upload/env/ui";
import { Chip } from "../social/ui/chip";
import { CURRENCIES } from "@/constants/foundational.constants";

/* ============================== Types ============================== */

export type YesNo = "yes" | "no";

type CurrencyLike = string | { value?: string; code?: string; label?: string; name?: string };

const CURRENCY_OPTIONS: readonly string[] = (CURRENCIES as unknown as CurrencyLike[])
  .map((c) => (typeof c === "string" ? c : c.value ?? c.code ?? ""))
  .filter((s): s is string => !!s);

/** Backend persists only url; the rest are UI-only (kept out of Zod). */
export type ExecPolicy = {
  url?: string;

  // UI-only:
  file?: File | null;
  fileName?: string;
  fileSize?: number; // bytes
  fileType?: string; // mime
  blobUrl?: string; // for local preview
};

export type PayElements = {
  fixed?: boolean;
  annualBonus?: boolean;
  lti?: boolean;
};

export type EsgMetricRow = {
  name: string;
  weightPct: number | null;
};

export type Money = {
  amount: number | null;
  currency?: string;
};

export type ExecutiveRemunerationValue = {
  policy?: ExecPolicy;
  payElements?: PayElements;
  esgLinked?: YesNo;
  esgMetrics?: EsgMetricRow[];
  ceoPay?: Money;
  medianEmployeePay?: Money;
};

type Props = {
  value: ExecutiveRemunerationValue;
  onChange: (patch: Partial<ExecutiveRemunerationValue>) => void;
  readOnly?: boolean;
};

/* ============================== Helpers ============================== */

const YES_NO: readonly YesNo[] = ["yes", "no"];

function toNum(n: unknown) {
  const v = typeof n === "number" ? n : Number(n);
  return Number.isFinite(v) ? v : 0;
}
function fmtPct(n: number | null | undefined) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}%`;
}
function ratioFmt(n: number | null) {
  if (n == null || !Number.isFinite(n)) return "—";
  return `${n.toFixed(1)}×`;
}
function fmtSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

/* ============================== Component ============================== */

export function ExecutiveRemunerationCard({ value, onChange, readOnly }: Props) {
  const policyPersisted = value.policy ?? { url: "" };
  const elements = value.payElements ?? { fixed: false, annualBonus: false, lti: false };
  const metrics = value.esgMetrics ?? [];
  const ceo = value.ceoPay ?? { amount: null, currency: undefined };
  const med = value.medianEmployeePay ?? { amount: null, currency: undefined };

  // Local-only state for upload metadata (prevents Zod from stripping it)
  const [policyUI, setPolicyUI] = useState<ExecPolicy>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Revoke blob URL on unmount or when it changes
  useEffect(() => {
    return () => {
      if (policyUI.blobUrl) {
        try {
          URL.revokeObjectURL(policyUI.blobUrl);
        } catch {
          /* no-op */
        }
      }
    };
  }, [policyUI.blobUrl]);

  // Derived
  const esgWeightingPct = useMemo(() => {
    if (!metrics.length) return null;
    const total = metrics.reduce((s, m) => s + toNum(m.weightPct ?? 0), 0);
    return total;
  }, [metrics]);

  const esgOver100 = esgWeightingPct != null && esgWeightingPct > 100;

  const ceoPayRatio = useMemo(() => {
    const a = ceo.amount,
      b = med.amount;
    const curA = (ceo.currency ?? "").trim();
    const curB = (med.currency ?? "").trim();
    if (
      a == null ||
      b == null ||
      !Number.isFinite(Number(a)) ||
      !Number.isFinite(Number(b)) ||
      b <= 0
    ) {
      return { value: null as number | null, mismatch: false };
    }
    if (!curA || !curB || curA !== curB) {
      return { value: null as number | null, mismatch: true };
    }
    return { value: Number(a) / Number(b), mismatch: false };
  }, [ceo.amount, ceo.currency, med.amount, med.currency]);

  // Handlers (persistable)
  const patchPolicyPersisted = (p: Partial<ExecPolicy>) =>
    onChange({ policy: { ...policyPersisted, ...p } });

  const patchElements = (p: Partial<PayElements>) =>
    onChange({ payElements: { ...elements, ...p } });

  const addMetric = () =>
    onChange({ esgMetrics: [...metrics, { name: "", weightPct: null }] });

  const updateMetric = (i: number, patch: Partial<EsgMetricRow>) => {
    const next = metrics.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
    onChange({ esgMetrics: next });
  };

  const removeMetric = (i: number) => {
    const next = metrics.slice();
    next.splice(i, 1);
    onChange({ esgMetrics: next });
  };

  const patchCeo = (p: Partial<Money>) => onChange({ ceoPay: { ...ceo, ...p } });
  const patchMedian = (p: Partial<Money>) =>
    onChange({ medianEmployeePay: { ...med, ...p } });

  // File handlers — ONLY touch local UI state, not the form (Zod would strip)
  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    const file = e.target.files?.[0] ?? null;

    // Clean up old blob URL
    if (policyUI.blobUrl) {
      try {
        URL.revokeObjectURL(policyUI.blobUrl);
      } catch {
        /* no-op */
      }
    }

    if (!file) {
      setPolicyUI({});
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    setPolicyUI({
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      blobUrl,
    });
  };

  const removeFile = () => {
    if (policyUI.blobUrl) {
      try {
        URL.revokeObjectURL(policyUI.blobUrl);
      } catch {
        /* no-op */
      }
    }
    setPolicyUI({});
    if (fileInputRef.current) {
      // allow selecting the same file again to trigger onChange
      fileInputRef.current.value = "";
    }
  };

  /* ============================== Render ============================== */

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Executive Remuneration
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Provide your remuneration policy reference, pay elements, ESG linkage, and
          CEO/median pay figures.
        </p>
      </div>

      {/* Policy (URL + file upload) */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Policy" />
        <div className="mt-3 grid grid-cols-1 gap-4 lg:grid-cols-3">
          <TextField
            label="Policy URL"
            value={policyPersisted.url ?? ""}
            onChange={(v) => patchPolicyPersisted({ url: v ?? "" })}
            placeholder="https://…"
          />

          {/* File picker */}
          <div className="lg:col-span-2">
            <label className="text-sm text-gray-800">Upload policy (PDF/Doc)</label>
            <div className="mt-1 flex items-center gap-3">
              <input
                ref={fileInputRef}
                type="file"
                className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-gray-300/70 file:bg-white/70 file:px-3 file:py-1.5 file:text-sm file:text-gray-800 file:shadow-sm file:backdrop-blur hover:file:bg-white/80"
                accept=".pdf,.doc,.docx,.odt,.rtf,.txt,.html,.htm,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={onFileChange}
                disabled={readOnly}
              />
            </div>

            {/* File summary & actions (LOCAL STATE) */}
            {(policyUI.fileName || policyUI.blobUrl) && (
              <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
                <span className="rounded-full border border-gray-300/70 bg-white/70 px-2 py-1 text-gray-800">
                  {policyUI.fileName ?? "selected file"}
                </span>
                <span className="text-gray-600">{fmtSize(policyUI.fileSize)}</span>
                {policyUI.fileType ? (
                  <span className="text-gray-600">({policyUI.fileType})</span>
                ) : null}
                {policyUI.blobUrl ? (
                  <a
                    href={policyUI.blobUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-lg border border-gray-300/70 bg-white/60 px-2 py-1 text-gray-800 shadow-sm backdrop-blur transition hover:bg-white/80"
                  >
                    Preview
                  </a>
                ) : null}
                <button
                  type="button"
                  className="rounded-lg border border-gray-300/70 bg-white/60 px-2 py-1 text-gray-800 shadow-sm backdrop-blur transition hover:bg-white/80"
                  onClick={removeFile}
                  disabled={readOnly}
                >
                  Remove file
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Pay elements */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Pay elements" />
        <div className="mt-2 flex flex-wrap gap-4">
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!elements.fixed}
              onChange={(e) => patchElements({ fixed: e.target.checked })}
              disabled={readOnly}
            />
            Fixed
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!elements.annualBonus}
              onChange={(e) => patchElements({ annualBonus: e.target.checked })}
              disabled={readOnly}
            />
            Annual bonus
          </label>
          <label className="inline-flex items-center gap-2 text-sm text-gray-800">
            <input
              type="checkbox"
              className="h-4 w-4"
              checked={!!elements.lti}
              onChange={(e) => patchElements({ lti: e.target.checked })}
              disabled={readOnly}
            />
            Long-term incentive (LTI)
          </label>
        </div>
      </div>

      {/* ESG linkage + metrics */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="ESG linkage" />
        <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
          <SelectField
            label="ESG metrics linked to pay?"
            value={value.esgLinked}
            options={YES_NO as unknown as readonly string[]}
            onChange={(v) => onChange({ esgLinked: (v as YesNo) || "no" })}
          />
          <div className="sm:col-span-2 flex items-end">
            <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
              <div className="flex flex-wrap gap-2">
                <Chip label="ESG weighting" value={fmtPct(esgWeightingPct)} />
                {esgOver100 ? (
                  <span className="text-red-600">Weights exceed 100%</span>
                ) : null}
              </div>
            </div>
          </div>
        </div>

        {value.esgLinked === "yes" && (
          <div className="mt-4">
            <RowList
              rows={metrics}
              onAdd={() => addMetric()}
              onRemove={(i) => removeMetric(i)}
              onUpdate={(i, patch) => updateMetric(i, patch)}
              render={(row, update) => (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <TextField
                    label="Metric name"
                    value={row.name}
                    onChange={(v) => update({ name: v ?? "" })}
                    placeholder="e.g., Scope 1+2 reduction"
                  />
                  <NumberField
                    label="Weight (%)"
                    value={row.weightPct ?? ""}
                    min={0}
                    onChange={(n) => update({ weightPct: n ?? null })}
                  />
                  <div className="flex items-end">
                    <div className="w-full rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
                      <Chip label="Row weight" value={fmtPct(row.weightPct ?? null)} />
                    </div>
                  </div>
                </div>
              )}
            />
            {!metrics.length && (
              <p className="mt-2 text-xs text-red-600">
                When ESG linkage is “yes”, please add at least one metric and weight.
              </p>
            )}
          </div>
        )}
      </div>

      {/* CEO & median pay */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="CEO & Median employee pay" />
        <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Currency"
              value={ceo.currency ?? undefined}
              options={CURRENCY_OPTIONS}
              onChange={(v) => patchCeo({ currency: (v as string | undefined) ?? undefined })}
              allowEmpty
            />

            <NumberField
              label="CEO total pay (amount)"
              value={ceo.amount ?? ""}
              min={0}
              onChange={(n) => patchCeo({ amount: n ?? null })}
            />
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <SelectField
              label="Currency"
              value={med.currency ?? undefined}
              options={CURRENCY_OPTIONS}
              onChange={(v) => patchMedian({ currency: (v as string | undefined) ?? undefined })}
              allowEmpty
            />
            <NumberField
              label="Median employee pay (amount)"
              value={med.amount ?? ""}
              min={0}
              onChange={(n) => patchMedian({ amount: n ?? null })}
            />
          </div>
        </div>

        <div className="mt-3 rounded-xl border border-white/30 bg-white/50 p-3 text-sm shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
          <div className="flex flex-wrap items-center gap-2">
            <Chip label="CEO pay ratio" value={ratioFmt(ceoPayRatio.value)} />
            {ceoPayRatio.mismatch ? (
              <span className="text-xs text-amber-700">
                Currencies don’t match—ratio not computed.
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <Divider />
      <div className="rounded-2xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Validation</u>: If ESG linkage is “yes”, add ≥1 metric and non-negative weights.
          Amounts must be ≥ 0; currency is free text (≤ ~8 chars recommended).
        </span>
      </div>
    </div>
  );
}
