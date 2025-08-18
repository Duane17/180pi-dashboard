// components/uploads/file-upload-multi.tsx
"use client";

import * as React from "react";

export interface FileUploadMultiProps {
  files: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  accept: string;         // e.g., "application/pdf"
  maxSizeMB?: number;     // default handled in parent
  error?: string;         // external error (optional)
}

export function FileUploadMulti({
  files,
  onAdd,
  onRemove,
  accept,
  maxSizeMB = 50,
  error,
}: FileUploadMultiProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [internalError, setInternalError] = React.useState<string | undefined>();

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (list: FileList | File[]) => {
    const arr = Array.from(list);
    const accepted: File[] = [];
    for (const f of arr) {
      if (!matchesAccept(f, accept)) {
        setInternalError(`Unsupported type: ${f.name}`);
        continue;
      }
      if (f.size > maxSizeMB * 1024 * 1024) {
        setInternalError(`File exceeds ${maxSizeMB} MB: ${f.name}`);
        continue;
      }
      accepted.push(f);
    }
    if (accepted.length) {
      setInternalError(undefined);
      onAdd(accepted);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  return (
    <div>
      <div
        onClick={openPicker}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={[
          "cursor-pointer rounded-xl border transition",
          "border-white/30 bg-white/50 backdrop-blur hover:bg-white/70",
          "px-4 py-6",
          isDragging ? "ring-2 ring-offset-0 ring-[#7e509c]/60" : "ring-0",
          "border-dashed",
        ].join(" ")}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-sm text-gray-900 truncate">
              Drag & drop multiple files here or click to browse
            </p>
            <p className="text-xs text-gray-600">
              Accepted: <span className="font-medium">{accept}</span> · Max {maxSizeMB}MB each
            </p>
          </div>
          <button
            type="button"
            onClick={openPicker}
            className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium hover:shadow-lg transition"
          >
            Browse
          </button>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {(internalError || error) && (
        <p className="mt-2 text-xs text-red-600">{internalError ?? error}</p>
      )}

      {/* Preview list */}
      {files.length > 0 ? (
        <ul className="mt-3 space-y-2">
          {files.map((file, idx) => (
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
                onClick={() => onRemove(idx)}
              >
                Remove
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-gray-600">No files selected.</p>
      )}
    </div>
  );
}

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
  const mime = file.type.toLowerCase();
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
  if (!mime && parts.some((p) => p.startsWith(".") && p === ext)) return true;
  return false;
}
