import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type BidItem = {
  id: string;
  projectId: string;
  providerId: string;
  proposal: string;
  price: number;
  timeline: string;
  status: 'PENDING' | 'ACCEPTED' | 'REJECTED';
  createdAt: string;
  provider?: {
    id: string;
    email: string;
    providerProfile: {
      bidCredits: number;
      rating: number;
      totalReviews: number;
      completedProjects: number;
      validReportCount: number;
      reputationScore: number;
    } | null;
  };
  project?: {
    id: string;
    title: string;
    status: 'DRAFT' | 'ACTIVE' | 'IN_PROGRESS' | 'COMPLETED';
    visibility: 'PUBLIC' | 'PRIVATE' | 'INVITE_ONLY';
  };
};

export type CreateBidPayload = {
  projectId: string;
  proposal: string;
  price: number;
  timeline: string;
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

export async function createBid(token: string, payload: CreateBidPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/bids`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<BidItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to create bid');
  }
}

export async function getBidsForProject(token: string, projectId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/bids/project/${projectId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<BidItem[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load project bids');
  }
}

export async function getMyBids(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/bids/my`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<BidItem[]>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load my bids');
  }
}

export async function updateBidStatus(
  token: string,
  bidId: string,
  status: 'ACCEPTED' | 'REJECTED',
) {
  try {
    const res = await fetch(`${API_BASE_URL}/bids/${bidId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ status }),
    });
    return await parseResponse<BidItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to update bid status');
  }
}
