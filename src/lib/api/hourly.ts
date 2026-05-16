import { apiJson } from './client';

export type TimeEntryRow = {
  id: string;
  engagementId: string;
  providerId: string;
  workDate: string;
  hours: number | string;
  description: string;
  status: 'DRAFT' | 'SUBMITTED' | 'APPROVED' | 'REJECTED' | 'BILLED';
  submittedAt: string | null;
  approvedAt: string | null;
  rejectedReason: string | null;
  billedAt: string | null;
  billedAmount: number | string | null;
  createdAt: string;
};

export type HourlyEngagement = {
  id: string;
  projectId: string;
  hourlyRate: number | string;
  currency: 'INR' | 'USD';
  weeklyCapHours: number;
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED';
  timeEntries: TimeEntryRow[];
};

export async function getHourlyEngagement(token: string, projectId: string) {
  return apiJson<HourlyEngagement>(`/hourly/project/${projectId}`, { token });
}

export async function upsertHourlyEngagement(
  token: string,
  projectId: string,
  payload: { hourlyRate: number; weeklyCapHours?: number; currency?: 'INR' | 'USD' },
) {
  return apiJson<HourlyEngagement>(`/hourly/project/${projectId}/engagement`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function createTimeEntry(
  token: string,
  payload: { engagementId: string; workDate: string; hours: number; description: string },
) {
  return apiJson<TimeEntryRow>('/hourly/time-entries', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function submitTimeEntry(token: string, entryId: string) {
  return apiJson<TimeEntryRow>(`/hourly/time-entries/${entryId}/submit`, { method: 'POST', token });
}

export async function approveTimeEntry(token: string, entryId: string) {
  return apiJson<TimeEntryRow>(`/hourly/time-entries/${entryId}/approve`, { method: 'POST', token });
}

export async function rejectTimeEntry(token: string, entryId: string, reason?: string) {
  return apiJson<TimeEntryRow>(`/hourly/time-entries/${entryId}/reject`, {
    method: 'POST',
    token,
    body: JSON.stringify({ reason }),
  });
}

export async function billTimeEntry(token: string, entryId: string) {
  return apiJson<TimeEntryRow>(`/hourly/time-entries/${entryId}/bill`, { method: 'POST', token });
}

export async function updateTimeEntry(
  token: string,
  entryId: string,
  payload: { workDate?: string; hours?: number; description?: string },
) {
  return apiJson<TimeEntryRow>(`/hourly/time-entries/${entryId}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function setHourlyEngagementStatus(
  token: string,
  projectId: string,
  status: 'ACTIVE' | 'PAUSED' | 'CLOSED',
) {
  return apiJson<HourlyEngagement>(`/hourly/project/${projectId}/engagement/status`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ status }),
  });
}

export type HourlySummary = {
  projectId: string;
  hourlyRate: number | string;
  currency: string;
  engagementStatus: string;
  weeklyCapHours: number;
  draftHours: number;
  submittedHours: number;
  approvedHours: number;
  billedHours: number;
  billedAmount: number;
  pendingAmount: number;
  entryCount: number;
};

export async function getHourlySummary(token: string, projectId: string) {
  return apiJson<HourlySummary>(`/hourly/project/${projectId}/summary`, { token });
}
