import { ApiError } from './auth';

export type ProjectAsset = {
  type: 'DOMAIN' | 'URL' | 'IP';
  value: string;
};

export type ProjectItem = {
  id: string;
  title: string;
  description: string;
  assets: ProjectAsset[];
  inScope: string[];
  outOfScope: string[];
  testingWindow: string;
  budgetType: 'FIXED' | 'HOURLY' | 'MILESTONE';
  budgetAmount: number;
  timeline: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  clientId: string;
  selectedProviderId: string | null;
  selectedProvider: {
    id: string;
    email: string;
    providerProfile: {
      rating: number;
      totalReviews: number;
      completedProjects: number;
      validReportCount: number;
      reputationScore: number;
    } | null;
  } | null;
  review: {
    id: string;
    rating: number;
    comment: string | null;
    clientId: string;
    providerId: string;
    createdAt: string;
  } | null;
  payment: {
    id: string;
    amount: number;
    currency: 'INR' | 'USD';
    status: 'PENDING' | 'IN_ESCROW' | 'RELEASED' | 'REFUNDED';
    createdAt: string;
  } | null;
  status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
  createdAt: string;
};

export type CreateProjectPayload = {
  title: string;
  description: string;
  assets: ProjectAsset[];
  inScope: string[];
  outOfScope: string[];
  testingWindow: string;
  budgetType: 'FIXED' | 'HOURLY' | 'MILESTONE';
  budgetAmount: number;
  timeline: string;
  visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

export async function getProjects(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<ProjectItem[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to fetch projects');
  }
}

export async function getProjectById(token: string, id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<ProjectItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to fetch project details');
  }
}

export async function createProject(token: string, payload: CreateProjectPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<ProjectItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to create project');
  }
}
