// src/lib/services/governance.client.ts
import { api } from "@/lib/api";

export type CertificationUpsertBody = {
  hasSustainabilityCert?: boolean;
  certification?: {
    issuer?: string;
    issuingDate?: string; 
    fileUrl?: string;     
    fileName?: string;
    fileMime?: string;
    fileSize?: number;
  };
};

export type ExternalAuditUpsertBody = {
  hasExternalAudit?: boolean;
  audit?: {
    issuer?: string;
    issuingDate?: string;
  };
};

export async function upsertCompanyCertification(companyId: string, body: CertificationUpsertBody) {
  const { data } = await api.put(`/companies/${companyId}/certification`, body);
  return data;
}

export async function upsertCompanyExternalAudit(companyId: string, body: ExternalAuditUpsertBody) {
  const { data } = await api.put(`/companies/${companyId}/external-audit`, body);
  return data;
}
