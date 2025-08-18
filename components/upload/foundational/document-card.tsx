// components/uploads/document-card.tsx
"use client";

import * as React from "react";

export interface DocumentsCardProps {
  /** Single: Registration certificate */
  registrationCertFile?: File;
  /** Multi: Previous sustainability reports */
  previousReportFiles?: File[];
  /** Remove handler */
  onRemove: (type: "registration" | "previous", index?: number) => void;

  /** Optional external change callbacks (to keep state in parent if desired) */
  onRegistrationChange?: (file: File | null) => void;
  onPreviousAdd?: (files: File[]) => void;

  /** Constraints */
  acceptRegistration?: string;  // default: "application/pdf,image/*"
  acceptPrevious?: string;      // default: "application/pdf"
  maxSizeMBRegistration?: number; // default: 20
  maxSizeMBPrevious?: number;     // default: 50

  /** External error strings */
  registrationError?: string;
  previousError?: string;
}

export function DocumentsCard({
  registrationCertFile,
  previousReportFiles = [],
  onRemove,
  onRegistrationChange,
  onPreviousAdd,
  acceptRegistration = "application/pdf,image/*",
  acceptPrevious = "application/pdf",
  maxSizeMBRegistration = 20,
  maxSizeMBPrevious = 50,
  registrationError,
  previousError,
}: DocumentsCardProps) {
  // Local preview URL for registration (image only)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragReg, setDragReg] = React.useState(false);
  const [dragPrev, setDragPrev] = React.useState(false);
  const [internalRegError, setInternalRegError] = React.useState<string | undefined>();
  const [internalPrevError, setInternalPrevError] = React.useState<string | undefined>();

  const regInputRef = React.useRef<HTMLInputElement>(null);
  const prevInputRef = React.useRef<HTMLInputElement>(null);

  // Handle preview lifecycle
  React.useEffect(() => {
    if (registrationCertFile && registrationCertFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(registrationCertFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [registrationCertFile]);

  /* ------------------------------ Helpers ------------------------------ */

  const resetInput = (ref: React.RefObject<HTMLInputElement | null>) => {
    if (ref.current) {
      ref.current.value = "";
    }
  };

  const openRegPicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    regInputRef.current?.click();
  };

  const openPrevPicker = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    prevInputRef.current?.click();
  };

  const handleRegFiles = (files: FileList | File[]) => {
    const f = files[0];
    if (!f) return;

    if (!matchesAccept(f, acceptRegistration)) {
      setInternalRegError("Unsupported file type.");
      return;
    }
    if (f.size > maxSizeMBRegistration * 1024 * 1024) {
      setInternalRegError(`File exceeds ${maxSizeMBRegistration} MB.`);
      return;
    }

    setInternalRegError(undefined);
    onRegistrationChange?.(f);
  };

  const handlePrevFiles = (list: FileList | File[]) => {
    const arr = Array.from(list);
    const accepted: File[] = [];
    for (const f of arr) {
      if (!matchesAccept(f, acceptPrevious)) {
        setInternalPrevError(`Unsupported type: ${f.name}`);
        continue;
      }
      if (f.size > maxSizeMBPrevious * 1024 * 1024) {
        setInternalPrevError(`File exceeds ${maxSizeMBPrevious} MB: ${f.name}`);
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length) {
      setInternalPrevError(undefined);
      onPreviousAdd?.(accepted);
    }
  };

  const onDropReg = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragReg(false);
    handleRegFiles(e.dataTransfer.files);
  };
  const onDragOverReg = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragReg(true);
  };
  const onDragLeaveReg = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragReg(false);
  };

  const onDropPrev = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragPrev(false);
    handlePrevFiles(e.dataTransfer.files);
  };
  const onDragOverPrev = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragPrev(true);
  };
  const onDragLeavePrev = (e: React.DragEvent) => {
    e.preventDefault(); e.stopPropagation(); setDragPrev(false);
  };

  /* ------------------------------- Render ------------------------------- */

  return (
    <div className="rounded-xl border border-white/20 bg-white/30 backdrop-blur-md shadow-md">
      {/* Header */}
      <div className="px-4 py-4 border-b border-white/20">
        <h3 className="text-lg font-semibold bg-gradient-to-r from-[#3270a1] via-[#7e509c] to-[#8dcddb] bg-clip-text text-transparent">
          Documents
        </h3>
        <p className="mt-1 text-sm text-gray-700">
          Drag & drop or browse to add your registration certificate and any previous reports.
        </p>
      </div>

      <div className="px-4 py-5 space-y-8">
        {/* Registration Certificate (single) */}
        <section>
          <h4 className="text-sm font-semibold text-gray-800">Registration certificate</h4>

          <div
            onClick={openRegPicker}
            onDrop={onDropReg}
            onDragOver={onDragOverReg}
            onDragLeave={onDragLeaveReg}
            className={[
              "mt-3 cursor-pointer rounded-xl border border-dashed transition",
              "border-white/30 bg-white/50 backdrop-blur hover:bg-white/70",
              "px-4 py-6",
              dragReg ? "ring-2 ring-offset-0 ring-[#3270a1]/50" : "ring-0",
            ].join(" ")}
          >
            <div className="flex items-center gap-4">
              {/* Thumbnail or file-type badge */}
              {registrationCertFile ? (
                previewUrl ? (
                  <img
                    src={previewUrl}
                    alt={registrationCertFile.name}
                    className="h-12 w-12 rounded-md object-cover border border-white/40 bg-white/60"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md border border-white/40 bg-white/60 flex items-center justify-center text-xs text-gray-700">
                    {(registrationCertFile.type.split("/")[1] || "FILE").toUpperCase()}
                  </div>
                )
              ) : (
                <div className="h-12 w-12 rounded-md border border-white/40 bg-white/60 flex items-center justify-center text-xs text-gray-700">
                  FILE
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate">
                  {registrationCertFile ? registrationCertFile.name : "Drag & drop or click to select"}
                </p>
                <p className="text-xs text-gray-600">
                  Accepted: <span className="font-medium">{acceptRegistration}</span> · Max {maxSizeMBRegistration}MB
                </p>
              </div>

              <div className="flex items-center gap-2">
                {registrationCertFile ? (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); onRemove("registration"); resetInput(regInputRef); }}
                    className="px-3 py-1.5 text-sm rounded-lg border border-transparent bg-white/70 hover:bg-white/90 transition"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); openRegPicker(e); }}
                    className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium hover:shadow-lg transition"
                  >
                    Browse
                  </button>
                )}
              </div>
            </div>

            <input
              ref={regInputRef}
              type="file"
              accept={acceptRegistration}
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handleRegFiles(e.target.files);
                // allow selecting the same file again
                e.currentTarget.value = "";
              }}
            />
          </div>

          {(internalRegError || registrationError) && (
            <p className="mt-2 text-xs text-red-600">{internalRegError ?? registrationError}</p>
          )}
        </section>

        {/* Previous Reports (multi) */}
        <section>
          <h4 className="text-sm font-semibold text-gray-800">Previous sustainability reports</h4>

          <div
            onClick={openPrevPicker}
            onDrop={onDropPrev}
            onDragOver={onDragOverPrev}
            onDragLeave={onDragLeavePrev}
            className={[
              "mt-3 cursor-pointer rounded-xl border border-dashed transition",
              "border-white/30 bg-white/50 backdrop-blur hover:bg-white/70",
              "px-4 py-6",
              dragPrev ? "ring-2 ring-offset-0 ring-[#7e509c]/50" : "ring-0",
            ].join(" ")}
          >
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <p className="text-sm text-gray-900 truncate">
                  Drag & drop multiple files here or click to browse
                </p>
                <p className="text-xs text-gray-600">
                  Accepted: <span className="font-medium">{acceptPrevious}</span> · Max {maxSizeMBPrevious}MB each
                </p>
              </div>
              <button
                type="button"
                onClick={(e) => { e.stopPropagation(); openPrevPicker(e); }}
                className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium hover:shadow-lg transition"
              >
                Browse
              </button>
            </div>

            <input
              ref={prevInputRef}
              type="file"
              accept={acceptPrevious}
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) handlePrevFiles(e.target.files);
                // allow selecting same files again
                e.currentTarget.value = "";
              }}
            />
          </div>

          {(internalPrevError || previousError) && (
            <p className="mt-2 text-xs text-red-600">{internalPrevError ?? previousError}</p>
          )}

          {/* Preview list */}
          {previousReportFiles.length > 0 ? (
            <ul className="mt-3 space-y-2">
              {previousReportFiles.map((file, idx) => (
                <li
                  key={`${file.name}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-white/30 bg-white/60 backdrop-blur px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-900">{file.name}</p>
                    <p className="text-xs text-gray-600">
                      {(file.type || "application/octet-stream")} · {formatBytes(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="ml-3 px-3 py-1.5 text-sm rounded-lg border border-transparent bg-white/70 hover:bg-white/90 transition"
                    onClick={(e) => { e.stopPropagation(); onRemove("previous", idx); }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-gray-600">No files selected.</p>
          )}
        </section>
      </div>
    </div>
  );
}

/* ------------------------------ Utilities ------------------------------ */

function formatBytes(n?: number) {
  if (!n && n !== 0) return "";
  const units = ["B", "KB", "MB", "GB"];
  let i = 0;
  let val = n;
  while (val >= 1024 && i < units.length - 1) {
    val /= 1024;
    i++;
  }
  return `${val.toFixed(1)} ${units[i]}`;
}

/** Minimal accept matcher (handles "image/*" and ".ext" patterns) */
function matchesAccept(file: File, accept: string): boolean {
  if (!accept) return true;
  const parts = accept.split(",").map((p) => p.trim().toLowerCase());
  const mime = (file.type || "").toLowerCase();
  const ext = "." + (file.name.split(".").pop() || "").toLowerCase();
  for (const p of parts) {
    if (p.endsWith("/*")) {
      const base = p.slice(0, -2);
      if (mime.startsWith(base)) return true;
    } else if (p.startsWith(".")) {
      if (ext === p) return true;
    } else {
      if (mime === p) return true;
    }
  }
  // If the file has no type, fallback to extension rule
  if (!mime && parts.some((p) => p.startsWith(".") && p === ext)) return true;
  return false;
}
