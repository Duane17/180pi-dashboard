// src/lib/services/auditor.client.ts
import { api } from "@/lib/api";

/* ========================= Types ========================= */

export type AuditorRow = {
  id: string;
  companyId: string;
  firmName: string;
  appointedAt?: string | null;
  rotationDue?: string | null;
  notes?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CreateAuditorPayload = {
  firmName: string;
  appointedAt?: string | Date | null;
  rotationDue?: string | Date | null;
  notes?: string | null;
};

export type UpdateAuditorPayload = Partial<CreateAuditorPayload>;

export type AuditorOpinionRow = {
  id: string;
  auditorId: string;
  year: number;
  opinion?: string | null;
  documentId?: string | null;
  createdAt: string;
};

export type CreateOpinionPayload = {
  year: number;
  opinion?: string;
  documentId?: string;
};

export type UpdateOpinionPayload = Partial<CreateOpinionPayload>;

/* ======================= Basic CRUD ======================= */

export async function listAuditors(
  companyId: string,
  params?: { page?: number; pageSize?: number; q?: string }
) {
  const { data } = await api.get(`/companies/${companyId}/auditor`, { params });
  return data as { page: number; pageSize: number; total: number; data: AuditorRow[] };
}

export async function getAuditor(companyId: string, auditorId: string) {
  const { data } = await api.get(`/companies/${companyId}/auditor/${auditorId}`);
  return data as AuditorRow;
}

export async function createAuditor(companyId: string, payload: CreateAuditorPayload) {
  const { data } = await api.post(`/companies/${companyId}/auditor`, payload);
  return data as AuditorRow;
}

export async function updateAuditor(companyId: string, auditorId: string, payload: UpdateAuditorPayload) {
  const { data } = await api.patch(`/companies/${companyId}/auditor/${auditorId}`, payload);
  return data as AuditorRow;
}

export async function deleteAuditor(companyId: string, auditorId: string) {
  await api.delete(`/companies/${companyId}/auditor/${auditorId}`);
}

/* ===================== Opinions CRUD ====================== */

export async function listAuditorOpinions(companyId: string, auditorId: string) {
  const { data } = await api.get(`/companies/${companyId}/auditor/${auditorId}/opinions`);
  return data as AuditorOpinionRow[];
}

export async function createAuditorOpinion(companyId: string, auditorId: string, payload: CreateOpinionPayload) {
  const { data } = await api.post(`/companies/${companyId}/auditor/${auditorId}/opinions`, payload);
  return data as AuditorOpinionRow;
}

export async function updateAuditorOpinion(
  companyId: string,
  auditorId: string,
  opinionId: string,
  payload: UpdateOpinionPayload
) {
  const { data } = await api.patch(
    `/companies/${companyId}/auditor/${auditorId}/opinions/${opinionId}`,
    payload
  );
  return data as AuditorOpinionRow;
}

export async function deleteAuditorOpinion(companyId: string, auditorId: string, opinionId: string) {
  await api.delete(`/companies/${companyId}/auditor/${auditorId}/opinions/${opinionId}`);
}

/* ===================== Idempotent helpers ===================== */

/**
 * Upsert an auditor by firmName (case-insensitive):
 * - tries to find an existing auditor via `q`
 * - if found, returns it (optionally patches fields)
 * - else creates it
 */
export async function upsertAuditorByFirmName(
  companyId: string,
  payload: CreateAuditorPayload
): Promise<AuditorRow> {
  const q = payload.firmName.trim();
  const page = await listAuditors(companyId, { q, page: 1, pageSize: 10 });
  const existing = page.data.find((a) => a.firmName.toLowerCase() === q.toLowerCase());
  if (existing) {
    // If you want to update dates/notes when re-seen, do a light patch:
    const maybeChanged =
      payload.appointedAt != null || payload.rotationDue != null || payload.notes != null;
    return maybeChanged
      ? await updateAuditor(companyId, existing.id, {
          appointedAt: payload.appointedAt,
          rotationDue: payload.rotationDue,
          notes: payload.notes,
        })
      : existing;
  }
  return await createAuditor(companyId, payload);
}

/**
 * Ensure an opinion row exists for a given year; if missing → create.
 */
export async function ensureOpinionForYear(
  companyId: string,
  auditorId: string,
  year: number,
  extras?: { opinion?: string; documentId?: string }
): Promise<AuditorOpinionRow> {
  const opinions = await listAuditorOpinions(companyId, auditorId);
  const found = opinions.find((o) => o.year === year);
  if (found) return found;
  return await createAuditorOpinion(companyId, auditorId, { year, ...extras });
}
