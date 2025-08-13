// src/types/sites.ts

export type SiteScope = "OWNED" | "LEASED" | "MANAGED";

export interface SiteCreateRequest {
  name: string;            // required by backend
  scope: SiteScope;        // required by backend

  // Address block
  country?: string | null; // alpha-2
  region?: string | null;
  city?: string | null;
  address?: string | null;

  // Geo
  latitude?: number | null;
  longitude?: number | null;
  geojson?: unknown | null;
}

export interface SiteResponse {
  id: string;
  companyId: string;
  name: string;
  scope: SiteScope;
  country: string | null;
  region: string | null;
  city: string | null;
  address: string | null;
  latitude: string | null;   // decimals-as-strings
  longitude: string | null;  // decimals-as-strings
  geojson: unknown | null;
  createdAt: string;
  updatedAt: string;
}
