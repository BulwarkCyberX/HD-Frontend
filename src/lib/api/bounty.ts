import { apiJson } from './client';

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
  return apiJson<BountyProgram>('/bounty/programs', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function listBountyPrograms(token: string) {
  return apiJson<BountyProgram[]>('/bounty/programs', { token, cache: 'no-store' });
}

export async function getBountyProgram(token: string, id: string) {
  return apiJson<BountyProgram>(`/bounty/programs/${id}`, { token, cache: 'no-store' });
}

export async function submitBountyReport(
  token: string,
  payload: { programId: string; title: string; description: string; severity: string },
) {
  return apiJson<BountyBugReport>('/bounty/reports', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function listBountyReports(token: string, programId: string) {
  return apiJson<BountyBugReport[]>(`/bounty/reports/${programId}`, { token, cache: 'no-store' });
}

export async function updateBountyReportStatus(
  token: string,
  reportId: string,
  status: 'VALID' | 'REJECTED' | 'DUPLICATE',
) {
  return apiJson<BountyBugReport>(`/bounty/reports/${reportId}/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}
