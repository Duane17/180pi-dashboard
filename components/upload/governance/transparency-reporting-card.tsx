"use client";

import { useMemo } from "react";
import {
  SectionHeader,
  TextField,
  Divider,
} from "@/components/upload/env/ui";
import { Chip } from "@/components/upload/social/ui/chip";

/* ============================== Types ============================== */

export type LinkOrUpload = {
  url?: string;

  /** UI-only (not persisted by schema): */
  file?: File | null;
  fileName?: string;
  fileSize?: number; // bytes
  fileType?: string; // mime
  blobUrl?: string;  // for local preview
};

export type Publications = {
  annualReport?: LinkOrUpload;
  financialStatements?: LinkOrUpload;
  sustainabilityReport?: LinkOrUpload;
};

export type ReportingIndex = {
  gri?: LinkOrUpload;
  vsme?: LinkOrUpload;
};

export type TransparencyReportingValue = {
  publications: Publications;
  assuranceStatement?: LinkOrUpload;
  index?: ReportingIndex;
};

type Props = {
  value: TransparencyReportingValue;
  onChange: (patch: Partial<TransparencyReportingValue>) => void;
  readOnly?: boolean;
};

/* ============================== Helpers ============================== */

function fmtSize(bytes?: number) {
  if (!bytes || bytes <= 0) return "—";
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  return `${mb.toFixed(2)} MB`;
}

function statusLabel(item?: LinkOrUpload) {
  if (!item) return "Empty";
  if (item.file || item.fileName || item.blobUrl) return "File selected";
  if (item.url?.trim()) return "Linked";
  return "Empty";
}

function statusTone(item?: LinkOrUpload) {
  const s = statusLabel(item);
  if (s === "File selected") return "ok";
  if (s === "Linked") return "ok";
  return "muted";
}

/* ============================== Reusable Tile ============================== */

type TileProps = {
  title: string;
  item: LinkOrUpload | undefined;
  onChange: (next: LinkOrUpload | undefined) => void;
  accept?: string;
  allowRemove?: boolean;
  readOnly?: boolean;
};

function LinkUploadTile({
  title,
  item,
  onChange,
  accept =
    ".pdf,.doc,.docx,.odt,.rtf,.txt,.html,.htm,.md,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  allowRemove = true,
  readOnly,
}: TileProps) {
  const tone = statusTone(item);
  const label = statusLabel(item);

  const revokeIfAny = (url?: string) => {
    if (!url) return;
    try {
      URL.revokeObjectURL(url);
    } catch {
      /* no-op */
    }
  };

  const handleUrl = (v?: string) => {
    onChange({
      ...(item ?? {}),
      url: v ?? "",
    });
  };

  const onFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
    if (readOnly) return;
    const file = e.target.files?.[0] ?? null;

    // clean up old blob
    revokeIfAny(item?.blobUrl);

    if (!file) {
      onChange(
        item
          ? {
              ...item,
              file: null,
              fileName: undefined,
              fileSize: undefined,
              fileType: undefined,
              blobUrl: undefined,
            }
          : undefined
      );
      return;
    }

    const blobUrl = URL.createObjectURL(file);
    onChange({
      ...(item ?? {}),
      file,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      blobUrl,
    });
  };

  const removeFile = () => {
    if (readOnly) return;
    if (item?.blobUrl) revokeIfAny(item.blobUrl);
    onChange(
      item
        ? {
            ...item,
            file: null,
            fileName: undefined,
            fileSize: undefined,
            fileType: undefined,
            blobUrl: undefined,
          }
        : undefined
    );
  };

  return (
    <div className="rounded-2xl border border-white/30 bg-white/50 p-4 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 space-y-3">
      <div className="flex items-center justify-between">
        <div className="text-sm font-medium text-gray-900">{title}</div>
        <span
          className={[
            "rounded-full px-2 py-0.5 text-xs",
            tone === "ok"
              ? "border border-emerald-300 bg-emerald-50 text-emerald-700"
              : "border border-gray-300 bg-gray-50 text-gray-700",
          ].join(" ")}
        >
          {label}
        </span>
      </div>

      <TextField
        label="URL"
        value={item?.url ?? ""}
        onChange={(v) => handleUrl(v ?? "")}
        placeholder="https://…"
      />

      <div>
        <label className="text-sm text-gray-800">Upload (optional)</label>
        <div className="mt-1 flex flex-wrap items-center gap-3">
          <input
            type="file"
            className="block w-full text-sm file:mr-3 file:rounded-lg file:border file:border-gray-300/70 file:bg-white/70 file:px-3 file:py-1.5 file:text-sm file:text-gray-800 file:shadow-sm file:backdrop-blur hover:file:bg-white/80"
            accept={accept}
            onChange={onFileChange}
            disabled={readOnly}
          />

          {(item?.fileName || item?.blobUrl) && (
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-gray-300/70 bg-white/70 px-2 py-1 text-gray-800">
                {item?.fileName ?? "selected file"}
              </span>
              <span className="text-gray-600">{fmtSize(item?.fileSize)}</span>
              {item?.fileType ? (
                <span className="text-gray-600">({item.fileType})</span>
              ) : null}
              {item?.blobUrl ? (
                <a
                  href={item.blobUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-lg border border-gray-300/70 bg-white/60 px-2 py-1 text-gray-800 shadow-sm backdrop-blur transition hover:bg-white/80"
                >
                  Preview
                </a>
              ) : null}
              {allowRemove && (
                <button
                  type="button"
                  className="rounded-lg border border-gray-300/70 bg-white/60 px-2 py-1 text-gray-800 shadow-sm backdrop-blur transition hover:bg-white/80"
                  onClick={removeFile}
                >
                  Remove file
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================== Card ============================== */

export function TransparencyReportingCard({ value, onChange, readOnly }: Props) {
  const pubs = value.publications ?? {};
  const assurance = value.assuranceStatement ?? undefined;
  const idx = value.index ?? {};

  // Derived badges
  const pubsCount = useMemo(() => {
    const items = [pubs.annualReport, pubs.financialStatements, pubs.sustainabilityReport];
    return items.filter((i) => statusTone(i) === "ok").length;
  }, [pubs]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h3 className="bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-lg font-semibold text-transparent">
          Transparency & Reporting
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Provide links and/or upload files for published reports. Optional: assurance statement and
          disclosure indices (GRI / VSME).
        </p>
      </div>

      {/* Publications */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 space-y-4">
        <div className="flex items-center justify-between">
          <SectionHeader title="Publications (this period)" />
          <div className="text-xs">
            <Chip label="Completed" value={`${pubsCount} / 3`} />
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
          <LinkUploadTile
            title="Annual report"
            item={pubs.annualReport}
            onChange={(next) =>
              onChange({ publications: { ...pubs, annualReport: next } })
            }
            readOnly={readOnly}
          />
          <LinkUploadTile
            title="Financial statements"
            item={pubs.financialStatements}
            onChange={(next) =>
              onChange({ publications: { ...pubs, financialStatements: next } })
            }
            readOnly={readOnly}
          />
          <LinkUploadTile
            title="ESG / Sustainability report"
            item={pubs.sustainabilityReport}
            onChange={(next) =>
              onChange({ publications: { ...pubs, sustainabilityReport: next } })
            }
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Assurance statement */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <SectionHeader title="Assurance statement (optional)" />
        <div className="mt-3">
          <LinkUploadTile
            title="Assurance statement"
            item={assurance}
            onChange={(next) => onChange({ assuranceStatement: next })}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Index (GRI / VSME) */}
      <div className="rounded-2xl border border-white/30 bg-white/50 p-5 shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40 space-y-4">
        <SectionHeader title="Disclosure index (optional)" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <LinkUploadTile
            title="GRI index"
            item={idx.gri}
            onChange={(next) =>
              onChange({ index: { ...(value.index ?? {}), gri: next } })
            }
            readOnly={readOnly}
          />
          <LinkUploadTile
            title="VSME index"
            item={idx.vsme}
            onChange={(next) =>
              onChange({ index: { ...(value.index ?? {}), vsme: next } })
            }
            readOnly={readOnly}
          />
        </div>
      </div>

      <Divider />
      <div className="rounded-xl border border-white/30 bg-white/50 p-3 text-xs shadow-sm backdrop-blur supports-[backdrop-filter]:bg-white/40">
        <span className="text-gray-700">
          <u>Validation</u>: If a URL is provided, it must be a valid link.
        </span>
      </div>
    </div>
  );
}
