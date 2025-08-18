// components/uploads/file-upload-single.tsx
"use client";

import * as React from "react";

export interface FileUploadSingleProps {
  file?: File;
  onChange: (file: File | null) => void;
  accept: string;          // e.g., "application/pdf,image/*"
  maxSizeMB?: number;      // default handled in parent
  error?: string;          // external error (optional)
}

export function FileUploadSingle({
  file,
  onChange,
  accept,
  maxSizeMB = 20,
  error,
}: FileUploadSingleProps) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  const [internalError, setInternalError] = React.useState<string | undefined>();
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(null);

  // Cleanup preview URL
  React.useEffect(() => {
    if (file && file.type.startsWith("image/")) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      return () => URL.revokeObjectURL(url);
    } else {
      setPreviewUrl(null);
    }
  }, [file]);

  const openPicker = () => inputRef.current?.click();

  const handleFiles = (files: FileList | File[]) => {
    const f = files[0];
    if (!f) return;

    const acceptOk = matchesAccept(f, accept);
    if (!acceptOk) {
      setInternalError("Unsupported file type.");
      return;
    }

    if (f.size > maxSizeMB * 1024 * 1024) {
      setInternalError(`File exceeds ${maxSizeMB} MB.`);
      return;
    }

    setInternalError(undefined);
    onChange(f);
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

  const clearFile = () => onChange(null);

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
          isDragging ? "ring-2 ring-offset-0 ring-[#3270a1]/60" : "ring-0",
          "border-dashed",
        ].join(" ")}
      >
        <div className="flex items-center gap-4">
          {/* Preview (image) */}
          {previewUrl ? (
            <img
              src={previewUrl}
              alt={file?.name ?? "preview"}
              className="h-12 w-12 rounded-md object-cover border border-white/40 bg-white/60"
            />
          ) : (
            <div className="h-12 w-12 rounded-md border border-white/40 bg-white/60 flex items-center justify-center text-xs text-gray-700">
              {file ? file.type.split("/")[1]?.toUpperCase() || "FILE" : "FILE"}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <p className="text-sm text-gray-900 truncate">
              {file ? file.name : "Drag & drop or click to select"}
            </p>
            <p className="text-xs text-gray-600">
              Accepted: <span className="font-medium">{accept}</span> · Max {maxSizeMB}MB
            </p>
          </div>

          <div className="flex items-center gap-2">
            {file ? (
              <button
                type="button"
                onClick={clearFile}
                className="px-3 py-1.5 text-sm rounded-lg border border-transparent bg-white/70 hover:bg-white/90 transition"
              >
                Remove
              </button>
            ) : (
              <button
                type="button"
                onClick={openPicker}
                className="px-3 py-2 text-sm rounded-lg bg-gradient-to-r from-[#8dcddb] via-[#3270a1] to-[#7e509c] text-white font-medium hover:shadow-lg transition"
              >
                Browse
              </button>
            )}
          </div>
        </div>

        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {(internalError || error) && (
        <p className="mt-2 text-xs text-red-600">{internalError ?? error}</p>
      )}
    </div>
  );
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
  // If the file has no type, fallback to extension rule
  if (!mime && parts.some((p) => p.startsWith(".") && p === ext)) return true;
  return false;
}
