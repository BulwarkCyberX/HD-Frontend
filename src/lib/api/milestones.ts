import { apiJson } from './client';

export type MilestoneRow = {
  id: string;
  projectId: string;
  title: string;
  description: string;
  sortOrder: number;
  amount: string;
  currency: 'INR' | 'USD';
  status: string;
  partialPercent: number | null;
  releasedAmount: string | null;
  fundedAt: string | null;
  submittedAt: string | null;
  approvedAt: string | null;
  releasedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export async function listMilestones(token: string, projectId: string) {
  return apiJson<MilestoneRow[]>(`/milestones/project/${projectId}`, { token, cache: 'no-store' });
}

export async function createMilestone(
  token: string,
  payload: {
    projectId: string;
    title: string;
    description?: string;
    amount: number;
    currency: 'INR' | 'USD';
    sortOrder?: number;
  },
) {
  return apiJson<MilestoneRow>('/milestones', { method: 'POST', token, body: JSON.stringify(payload) });
}

export async function fundMilestone(token: string, milestoneId: string) {
  return apiJson<MilestoneRow>(`/milestones/${milestoneId}/fund`, { method: 'POST', token });
}

export async function startMilestone(token: string, milestoneId: string) {
  return apiJson<MilestoneRow>(`/milestones/${milestoneId}/start`, { method: 'POST', token });
}

export async function submitMilestone(token: string, milestoneId: string) {
  return apiJson<MilestoneRow>(`/milestones/${milestoneId}/submit`, { method: 'POST', token });
}

export async function approveMilestone(token: string, milestoneId: string, partialPercent?: number) {
  return apiJson<MilestoneRow>(`/milestones/${milestoneId}/approve`, {
    method: 'POST',
    token,
    body: JSON.stringify({ partialPercent }),
  });
}

export async function releaseMilestone(token: string, milestoneId: string) {
  return apiJson<MilestoneRow>(`/milestones/${milestoneId}/release`, { method: 'POST', token });
}

export async function rejectMilestone(token: string, milestoneId: string) {
  return apiJson<MilestoneRow>(`/milestones/${milestoneId}/reject`, { method: 'POST', token });
}

export async function listMilestoneComments(token: string, milestoneId: string) {
  return apiJson<
    { id: string; body: string; createdAt: string; author: { id: string; email: string; role: string } }[]
  >(`/milestones/${milestoneId}/comments`, { token, cache: 'no-store' });
}

export async function addMilestoneComment(token: string, milestoneId: string, body: string) {
  return apiJson<{ id: string; body: string; createdAt: string }>(`/milestones/${milestoneId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify({ body }),
  });
}
