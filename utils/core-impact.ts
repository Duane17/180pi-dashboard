"use client";

import type { CoreImpactPayload } from "@/types/env-resources.types";

/** Read coreImpactData whether it's a JSON string or a structured object */
export function readCoreImpactData(input?: unknown): CoreImpactPayload | null {
  if (!input) return null;
  if (typeof input === "string") {
    try {
      const obj = JSON.parse(input);
      return obj && typeof obj === "object" ? (obj as CoreImpactPayload) : null;
    } catch {
      return null;
    }
  }
  if (typeof input === "object") return input as CoreImpactPayload;
  return null;
}

export function tryReadNote(input?: unknown) {
  try {
    const obj = readCoreImpactData(input);
    return (obj as any)?.note ?? "";
  } catch {
    return "";
  }
}

/** Small numeric formatter for UI previews */
export function formatNumber(n: number) {
  try {
    return new Intl.NumberFormat(undefined, { maximumFractionDigits: 2 }).format(n);
  } catch {
    return String(n);
  }
}
