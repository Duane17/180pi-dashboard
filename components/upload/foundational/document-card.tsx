"use client";

import * as React from "react";

/**
 * Why this version is safer:
 * - All string operations (split / startsWith) guard against undefined.
 * - We derive MIME and extension via helpers that return "" (never undefined).
 * - We fall back to extension when MIME is missing (common with synthetic file-like objects).
 * - matchesAccept() accepts ".pdf" as well as "application/pdf" by default for previous reports.
 */

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
  acceptRegistration?: string;      // default: "application/pdf,image/*,.pdf,.png,.jpg,.jpeg"
  acceptPrevious?: string;          // default: "application/pdf,.pdf"
  maxSizeMBRegistration?: number;   // default: 20
  maxSizeMBPrevious?: number;       // default: 50

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
  // More permissive defaults (handle missing MIME by allowing extensions too)
  acceptRegistration = "application/pdf,image/*,.pdf,.png,.jpg,.jpeg",
  acceptPrevious = "application/pdf,.pdf",
  maxSizeMBRegistration = 20,
  maxSizeMBPrevious = 50,
  registrationError,
  previousError,
}: DocumentsCardProps) {
  /* ============================ Local UI state ============================ */

  // Local preview URL for registration (only if image/*)
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);
  const [dragReg, setDragReg] = React.useState(false);
  const [dragPrev, setDragPrev] = React.useState(false);
  const [internalRegError, setInternalRegError] = React.useState<string | undefined>();
  const [internalPrevError, setInternalPrevError] = React.useState<string | undefined>();

  const regInputRef = React.useRef<HTMLInputElement>(null);
  const prevInputRef = React.useRef<HTMLInputElement>(null);

  /* ========================== Derived helpers (safe) ========================== */

  // Always return a string for mime; never undefined
  const getMime = (f?: File): string => {
    const t = (f as any)?.type;
    return typeof t === "string" ? t : "";
  };

  // Always return a lowercased extension WITH dot (".pdf") or "" if none
  const getExt = (f?: File): string => {
    const n = (f as any)?.name;
    if (typeof n !== "string") return "";
    const dot = n.lastIndexOf(".");
    return dot >= 0 ? n.slice(dot).toLowerCase() : "";
  };

  // Should we show an image preview?
  const isImage = (f?: File): boolean => {
    const mime = getMime(f);
    return mime.startsWith("image/");
  };

  // Short, human label for a file when it’s not an image (e.g., "PDF", "PNG", or "FILE")
  const badgeLabel = (f?: File): string => {
    const mime = getMime(f);
    if (mime) {
      const parts = mime.split("/");
      const second = parts.length > 1 ? parts[1] : parts[0];
      if (second) return second.toUpperCase();
    }
    const ext = getExt(f); // ".pdf" -> "PDF"
    if (ext) return ext.slice(1).toUpperCase();
    return "FILE";
  };

  // Format size like "1.2 MB"
  const formatBytes = (n?: number) => {
    if (!Number.isFinite(n as number)) return "";
    const units = ["B", "KB", "MB", "GB"];
    let i = 0;
    let val = n as number;
    while (val >= 1024 && i < units.length - 1) {
      val /= 1024;
      i++;
    }
    return `${val.toFixed(1)} ${units[i]}`;
  };

  /**
   * Minimal accept matcher that tolerates missing MIME and falls back to extension.
   * Supports:
   *   - Exact mimes   e.g. "application/pdf"
   *   - Wildcards     e.g. "image/*"
   *   - Extensions    e.g. ".pdf"
   *   - Comma lists   e.g. "application/pdf,.pdf,image/*"
   */
  const matchesAccept = (file: File, accept: string): boolean => {
    if (!accept) return true;

    const patterns = accept
      .split(",")
      .map((p) => p.trim().toLowerCase())
      .filter(Boolean);

    const mime = getMime(file).toLowerCase(); // "" if unknown
    const ext = getExt(file).toLowerCase();   // "" if none

    for (const p of patterns) {
      // Wildcard like "image/*"
      if (p.endsWith("/*")) {
        const base = p.slice(0, -2); // "image"
        if (mime && mime.startsWith(base + "/")) return true;
        // If no MIME, we cannot check wildcard reliably. Continue.
        continue;
      }

      // Extension like ".pdf"
      if (p.startsWith(".")) {
        if (ext && ext === p) return true;
        continue;
      }

      // Exact MIME like "application/pdf"
      // If MIME available, compare directly.
      if (mime && mime === p) return true;

      // Heuristic fallback: if we lack MIME, allow a few common equivalences by extension.
      // (Keeps it simple; extend if you need more types.)
      if (!mime && p === "application/pdf" && ext === ".pdf") return true;
      if (!mime && p === "image/png" && ext === ".png") return true;
      if (!mime && p === "image/jpeg" && (ext === ".jpg" || ext === ".jpeg")) return true;
    }

    // Last resort: if still nothing matched, reject.
    return false;
  };

  /* ============================ Effects / lifecycle ============================ */

  // Build a preview URL for image registration file; revoke when changed
  React.useEffect(() => {
    if (registrationCertFile && isImage(registrationCertFile)) {
      const url = URL.createObjectURL(registrationCertFile);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    }
    setPreviewUrl(null);
  }, [registrationCertFile]);

  /* ================================ Handlers ================================ */

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
        setInternalPrevError(`Unsupported type: ${((f as any)?.name as string) || "(unnamed file)"}`);
        continue;
      }
      if (f.size > maxSizeMBPrevious * 1024 * 1024) {
        setInternalPrevError(`File exceeds ${maxSizeMBPrevious} MB: ${((f as any)?.name as string) || "(unnamed file)"}`);
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

  /* ================================= Render ================================= */

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
                    alt={(registrationCertFile as any)?.name || "preview"}
                    className="h-12 w-12 rounded-md object-cover border border-white/40 bg-white/60"
                  />
                ) : (
                  <div className="h-12 w-12 rounded-md border border-white/40 bg-white/60 flex items-center justify-center text-xs text-gray-700">
                    {badgeLabel(registrationCertFile)}
                  </div>
                )
              ) : (
                <div className="h-12 w-12 rounded-md border border-white/40 bg-white/60 flex items-center justify-center text-xs text-gray-700">
                  FILE
                </div>
              )}

              <div className="min-w-0 flex-1">
                <p className="text-sm text-gray-900 truncate">
                  {(registrationCertFile as any)?.name || "Drag & drop or click to select"}
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
                  key={`${((file as any)?.name as string) ?? "file"}-${idx}`}
                  className="flex items-center justify-between rounded-lg border border-white/30 bg-white/60 backdrop-blur px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm text-gray-900">
                      {((file as any)?.name as string) || "(unnamed file)"}
                    </p>
                    <p className="text-xs text-gray-600">
                      {(getMime(file) || "application/octet-stream")} · {formatBytes((file as any)?.size)}
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
