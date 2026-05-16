import { apiJson } from './client';

export type VdpPublic = {
  id: string;
  title: string;
  scope: unknown;
  policy: string;
  createdAt: string;
};

export async function getVdpPublic(id: string) {
  return apiJson<VdpPublic>(`/vdp/${id}`, { cache: 'no-store', retryOnUnauthorized: false });
}

export async function createVdp(token: string, payload: { title: string; scope: unknown; policy: string }) {
  return apiJson<VdpPublic & { clientId?: string }>('/vdp', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function submitVdpReport(payload: {
  vdpId: string;
  title: string;
  description: string;
  contactEmail?: string;
  severity?: string;
}) {
  return apiJson<{
    id: string;
    vdpId: string;
    title: string;
    description: string;
    contactEmail: string | null;
    severity: string | null;
    createdAt: string;
  }>('/vdp/report', {
    method: 'POST',
    body: JSON.stringify(payload),
    retryOnUnauthorized: false,
  });
}
