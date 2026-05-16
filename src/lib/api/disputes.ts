import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type DisputeItem = {
  id: string;
  projectId: string;
  openedById: string;
  category: string;
  status: string;
  title: string;
  description: string;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

async function parseResponse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as T;
}

export async function listProjectDisputes(token: string, projectId: string) {
  const res = await fetch(`${API_BASE_URL}/disputes/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return parseResponse<DisputeItem[]>(res);
}

export async function openDispute(
  token: string,
  payload: { projectId: string; category: string; title: string; description: string },
) {
  const res = await fetch(`${API_BASE_URL}/disputes`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<DisputeItem>(res);
}

export async function listAdminDisputes(token: string) {
  const res = await fetch(`${API_BASE_URL}/disputes/admin/all`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return parseResponse<DisputeItem[]>(res);
}

export async function addDisputeComment(
  token: string,
  disputeId: string,
  payload: { body: string; internal?: boolean },
) {
  const res = await fetch(`${API_BASE_URL}/disputes/${disputeId}/comments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<unknown>(res);
}

export async function resolveDispute(
  token: string,
  disputeId: string,
  payload: { resolution: string; status: 'RESOLVED' | 'REFUNDED' | 'REJECTED' },
) {
  const res = await fetch(`${API_BASE_URL}/disputes/admin/${disputeId}/resolve`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  return parseResponse<DisputeItem>(res);
}
