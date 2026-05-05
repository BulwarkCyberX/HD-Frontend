import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type VdpPublic = {
  id: string;
  title: string;
  scope: unknown;
  policy: string;
  createdAt: string;
};

export async function getVdpPublic(id: string) {
  const res = await fetch(`${API_BASE_URL}/vdp/${id}`, { cache: 'no-store' });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as VdpPublic;
}

export async function createVdp(
  token: string,
  payload: { title: string; scope: unknown; policy: string },
) {
  const res = await fetch(`${API_BASE_URL}/vdp`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as VdpPublic & { clientId?: string };
}

export async function submitVdpReport(payload: {
  vdpId: string;
  title: string;
  description: string;
  contactEmail?: string;
  severity?: string;
}) {
  const res = await fetch(`${API_BASE_URL}/vdp/report`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as {
    id: string;
    vdpId: string;
    title: string;
    description: string;
    contactEmail: string | null;
    severity: string | null;
    createdAt: string;
  };
}
