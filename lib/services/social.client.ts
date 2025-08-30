// src/lib/services/social.client.ts
import { api } from "@/lib/api";
import type { SocialList, SocialDetail, SocialUpsertPayload } from "@/types/social.types";

export const __SOCIAL_CLIENT_VERSION__ = "v1";

const base = (companyId: string) => `/companies/${companyId}/social`;

export async function listSocial(
  companyId: string,
  params: { page?: number; pageSize?: number } = {}
): Promise<SocialList> {
  const { data } = await api.get(base(companyId), { params });
  return data;
}

export async function getSocial(companyId: string, socialId: string): Promise<SocialDetail> {
  const { data } = await api.get(`${base(companyId)}/${socialId}`);
  return data;
}

export async function createSocial(companyId: string): Promise<{ id: string }> {
  const { data } = await api.post(base(companyId), {}); // body empty by design
  return data;
}

export async function upsertSocial(
  companyId: string,
  socialId: string,
  payload: SocialUpsertPayload
): Promise<SocialDetail> {
  const { data } = await api.put(`${base(companyId)}/${socialId}`, payload);
  return data;
}
