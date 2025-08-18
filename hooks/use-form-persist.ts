"use client";

import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * useFormPersist
 * Persist and hydrate a form's full value object in localStorage.
 *
 * API:
 *   useFormPersist(key: string, values: any, setValues: (v:any) => void)
 *
 * Typical usage with RHF:
 *   const { watch, reset } = useForm<ESGWizardValues>({ defaultValues });
 *   useFormPersist("esg-wizard:v1", watch(), reset);
 */
export function useFormPersist(
  key: string,
  values: any,
  setValues: (v: any) => void
) {
  // Track latest setter to avoid stale closures
  const setValuesRef = useRef(setValues);
  setValuesRef.current = setValues;

  // Debounce timer & last JSON snapshot
  const saveTimer = useRef<number | null>(null);
  const lastSavedJSON = useRef<string | null>(null);
  const hydratedRef = useRef(false);

  // Detect localStorage availability once (client-only component)
  const canUseStorage = useMemo(() => {
    try {
      const testKey = "__persist_test__";
      window.localStorage.setItem(testKey, "1");
      window.localStorage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }, []);

  // ISO date reviver -> Date objects (best-effort)
  const reviveDates = (_k: string, value: any) => {
    if (typeof value === "string" && value.length >= 10) {
      const isISO =
        /^\d{4}-\d{2}-\d{2}(?:[T\s]\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+\-]\d{2}:\d{2})?)?$/.test(
          value
        );
      if (isISO) {
        const d = new Date(value);
        if (!isNaN(d.getTime())) return d;
      }
    }
    return value;
  };

  // Load on mount
  useEffect(() => {
    if (!canUseStorage) return;

    try {
      const raw = window.localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw, reviveDates);
        if (parsed && typeof parsed === "object") {
          setValuesRef.current(parsed);
          lastSavedJSON.current = raw; // snapshot matches storage
        }
      }
    } catch {
      // ignore parse/storage errors
    } finally {
      hydratedRef.current = true;
    }

    // Cross-tab synchronization
    const onStorage = (e: StorageEvent) => {
      if (e.key !== key) return;
      if (typeof e.newValue !== "string") return;
      if (lastSavedJSON.current === e.newValue) return;

      try {
        const parsed = JSON.parse(e.newValue, reviveDates);
        if (parsed && typeof parsed === "object") {
          setValuesRef.current(parsed);
          lastSavedJSON.current = e.newValue;
        }
      } catch {
        /* ignore */
      }
    };

    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [key, canUseStorage]);

  // Save on changes (debounced)
  useEffect(() => {
    if (!canUseStorage) return;
    if (!hydratedRef.current) return; // don't overwrite before initial load

    let json: string;
    try {
      json = JSON.stringify(values);
    } catch {
      // Non-serializable values: skip persist
      return;
    }

    if (json === lastSavedJSON.current) return;

    if (saveTimer.current) {
      window.clearTimeout(saveTimer.current);
    }
    saveTimer.current = window.setTimeout(() => {
      try {
        window.localStorage.setItem(key, json);
        lastSavedJSON.current = json;
      } catch {
        // Quota exceeded or storage disabled — ignore
      }
    }, 300);

    return () => {
      if (saveTimer.current) {
        window.clearTimeout(saveTimer.current);
        saveTimer.current = null;
      }
    };
  }, [key, values, canUseStorage]);

  // Optional clear helper (expose if needed)
  const clear = useCallback(() => {
    if (!canUseStorage) return;
    try {
      window.localStorage.removeItem(key);
      lastSavedJSON.current = null;
    } catch {
      /* ignore */
    }
  }, [key, canUseStorage]);

  // return { clear }; // Uncomment if you want to expose it
}
