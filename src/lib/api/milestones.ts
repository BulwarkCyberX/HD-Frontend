import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

async function parse<T>(res: Response): Promise<T> {
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

export async function listMilestones(token: string, projectId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/project/${projectId}`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return parse<MilestoneRow[]>(res);
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
  const res = await fetch(`${API_BASE_URL}/milestones`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parse<MilestoneRow>(res);
}

export async function fundMilestone(token: string, milestoneId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/fund`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse<MilestoneRow>(res);
}

export async function startMilestone(token: string, milestoneId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/start`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse<MilestoneRow>(res);
}

export async function submitMilestone(token: string, milestoneId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/submit`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse<MilestoneRow>(res);
}

export async function approveMilestone(token: string, milestoneId: string, partialPercent?: number) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ partialPercent }),
  });
  return parse<MilestoneRow>(res);
}

export async function releaseMilestone(token: string, milestoneId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/release`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse<MilestoneRow>(res);
}

export async function rejectMilestone(token: string, milestoneId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/reject`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
  });
  return parse<MilestoneRow>(res);
}

export async function listMilestoneComments(token: string, milestoneId: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/comments`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return parse<
    { id: string; body: string; createdAt: string; author: { id: string; email: string; role: string } }[]
  >(res);
}

export async function addMilestoneComment(token: string, milestoneId: string, body: string) {
  const res = await fetch(`${API_BASE_URL}/milestones/${milestoneId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ body }),
  });
  return parse<{ id: string; body: string; createdAt: string }>(res);
}
