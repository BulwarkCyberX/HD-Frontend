import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type WorkspaceReport = {
  id: string;
  projectId: string;
  submittedBy: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'NEED_MORE_INFO' | 'VALID' | 'REJECTED';
  triageNotes: string | null;
  validatedBy: string | null;
  createdAt: string;
  submitter: {
    id: string;
    email: string;
    role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  };
  validator: {
    id: string;
    email: string;
    role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  } | null;
  project: {
    id: string;
    title: string;
    clientId: string;
    selectedProviderId: string | null;
  };
  files?: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }[];
};

export type CreateReportPayload = {
  projectId: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
};

export type TriageReportPayload = {
  status: 'VALID' | 'REJECTED' | 'NEED_MORE_INFO';
  triageNotes: string;
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

export async function getReports(token: string, projectId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<WorkspaceReport[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load reports');
  }
}

export async function createReport(token: string, payload: CreateReportPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<WorkspaceReport>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to submit report');
  }
}

export async function getAllReportsForAdmin(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/admin/all`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<WorkspaceReport[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load reports for triage');
  }
}

export async function triageReport(token: string, reportId: string, payload: TriageReportPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reports/${reportId}/triage`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<WorkspaceReport>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to triage report');
  }
}
