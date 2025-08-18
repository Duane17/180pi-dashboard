"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

/**
 * useFormDirtyPrompt
 * Warn when navigating away with unsaved changes.
 *
 * API: useFormDirtyPrompt(isDirty: boolean)
 *
 * Notes:
 * - Covers browser unload (refresh/close/tab close) via `beforeunload`.
 * - Intercepts in-app navigation by capturing anchor clicks at the document level.
 * - Safe for the Next.js App Router (no route change events needed).
 * - Add `data-bypass-dirty-check` to any link/button to skip the prompt.
 */
export function useFormDirtyPrompt(isDirty: boolean) {
  const router = useRouter();
  const dirtyRef = useRef(isDirty);
  dirtyRef.current = isDirty;

  // 1) Warn on browser unload (refresh/close)
  useEffect(() => {
    if (!isDirty) return;

    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      // Standard cross-browser approach:
      e.preventDefault();
      // Chrome requires returnValue to be set.
      e.returnValue = "";
      return "";
    };

    window.addEventListener("beforeunload", onBeforeUnload);
    return () => window.removeEventListener("beforeunload", onBeforeUnload);
  }, [isDirty]);

  // 2) Intercept in-app link clicks to confirm before client-side nav
  useEffect(() => {
    const handler = (ev: MouseEvent) => {
      if (!dirtyRef.current) return;
      if (ev.defaultPrevented) return;

      // Only left-click
      if (ev.button !== 0) return;

      // Respect modifier keys (open in new tab/window)
      if (ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.altKey) return;

      // Find nearest anchor
      const target = ev.target as HTMLElement | null;
      const anchor = target?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!anchor) return;

      // Optional opt-out
      if (anchor.hasAttribute("data-bypass-dirty-check")) return;

      // Ignore in-page hash navigation
      const url = new URL(anchor.href, window.location.href);
      const isSameDocHash =
        url.origin === window.location.origin &&
        url.pathname === window.location.pathname &&
        url.search === window.location.search &&
        url.hash &&
        url.hash !== "" &&
        url.hash !== "#" &&
        url.hash !== window.location.hash;

      if (isSameDocHash) return;

      // Ignore download links / targets
      if (anchor.target && anchor.target !== "_self") return;
      if (anchor.hasAttribute("download")) return;

      // Show confirm
      const ok = window.confirm(
        "You have unsaved changes. Are you sure you want to leave this page?"
      );
      if (!ok) {
        ev.preventDefault();
        ev.stopPropagation();
        return;
      }

      // If internal link, do SPA navigation ourselves to avoid double prompts
      const isInternal = url.origin === window.location.origin;
      if (isInternal) {
        ev.preventDefault();
        // Preserve the full path (pathname + search + hash)
        const next = `${url.pathname}${url.search}${url.hash}`;
        router.push(next);
      }
      // Else: let the browser do a full navigation (we already confirmed)
    };

    document.addEventListener("click", handler, true); // capture phase
    return () => document.removeEventListener("click", handler, true);
  }, [router]);

  // (Optional) If you later need a programmatic bypass, you can expose a ref/flag.
}
