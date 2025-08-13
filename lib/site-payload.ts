// src/lib/site-payload.ts
import type { SiteCreateRequest } from "@/types/sites";

/**
 * Build a SiteCreateRequest from wizard's site location object.
 * Your UI doesn't collect name/scope yet, so we:
 *  - name: prefer description; else `${city || country} site`
 *  - scope: default to "OWNED"
 */
export function buildSitePayload(loc: { country: string; city: string; description?: string }): SiteCreateRequest {
  const country = loc.country || undefined;
  const city = loc.city || undefined;
  const name =
    (loc.description && loc.description.trim()) ||
    (city ? `${city} site` : country ? `${country} site` : "Company site");

  return {
    name,
    scope: "OWNED",
    country: country ?? null,
    city: city ?? null,
    // You can map description -> address or region if you prefer:
    // address: loc.description?.trim() || null,
  };
}
