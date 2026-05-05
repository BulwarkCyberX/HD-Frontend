import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type BountyProgram = {
  id: string;
  clientId: string;
  title: string;
  description: string;
  scope: unknown;
  rewardTable: unknown;
  status: 'DRAFT' | 'ACTIVE' | 'CLOSED';
  allowedResearcherIds: string[];
  createdAt: string;
};

export type BountyBugReport = {
  id: string;
  programId: string;
  researcherId: string;
  title: string;
  description: string;
  severity: string;
  status: string;
  createdAt: string;
  researcher: { id: string; email: string };
  files: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }[];
};

export async function createBountyProgram(
  token: string,
  payload: {
    title: string;
    description?: string;
    scope: unknown;
    rewardTable: unknown;
    status?: 'DRAFT' | 'ACTIVE' | 'CLOSED';
    allowedResearcherIds?: string[];
  },
) {
  const res = await fetch(`${API_BASE_URL}/bounty/programs`, {
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
  return json as BountyProgram;
}

export async function listBountyPrograms(token: string) {
  const res = await fetch(`${API_BASE_URL}/bounty/programs`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as BountyProgram[];
}

export async function getBountyProgram(token: string, id: string) {
  const res = await fetch(`${API_BASE_URL}/bounty/programs/${id}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as BountyProgram;
}

export async function submitBountyReport(
  token: string,
  payload: { programId: string; title: string; description: string; severity: string },
) {
  const res = await fetch(`${API_BASE_URL}/bounty/reports`, {
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
  return json as BountyBugReport;
}

export async function listBountyReports(token: string, programId: string) {
  const res = await fetch(`${API_BASE_URL}/bounty/reports/${programId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as BountyBugReport[];
}

export async function updateBountyReportStatus(
  token: string,
  reportId: string,
  status: 'VALID' | 'REJECTED' | 'DUPLICATE',
) {
  const res = await fetch(`${API_BASE_URL}/bounty/reports/${reportId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as BountyBugReport;
}
