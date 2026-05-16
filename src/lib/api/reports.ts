import { ApiError } from './auth';
import { apiJson } from './client';

export type ReportAiTriageHints = {
  suggestedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' | null;
  submittedSeverity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  severityMatch: boolean;
  rationale: string;
  completeness: string;
  missingFields: string[];
  checklist: string[];
  duplicate: {
    likelyDuplicate: boolean;
    score: number;
    comparedReportId?: string;
    rationale?: string;
  } | null;
  generatedAt: string;
};

export type WorkspaceReport = {
  id: string;
  projectId: string;
  submittedBy: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'UNDER_REVIEW' | 'NEED_MORE_INFO' | 'VALID' | 'REJECTED';
  triageNotes: string | null;
  aiTriageHints?: ReportAiTriageHints | null;
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

export async function getReports(token: string, projectId: string) {
  try {
    return await apiJson<WorkspaceReport[]>(`/reports/${projectId}`, { token, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load reports');
  }
}

export async function createReport(token: string, payload: CreateReportPayload) {
  try {
    return await apiJson<WorkspaceReport>('/reports', { method: 'POST', token, body: JSON.stringify(payload) });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to submit report');
  }
}

export async function getAllReportsForAdmin(token: string) {
  try {
    return await apiJson<WorkspaceReport[]>('/reports/admin/all', { token, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load reports for triage');
  }
}

export async function runReportAiTriage(token: string, reportId: string) {
  return apiJson<WorkspaceReport>(`/reports/${reportId}/ai-triage`, { method: 'POST', token });
}

export async function triageReport(token: string, reportId: string, payload: TriageReportPayload) {
  try {
    return await apiJson<WorkspaceReport>(`/reports/${reportId}/triage`, {
      method: 'PATCH',
      token,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to triage report');
  }
}
