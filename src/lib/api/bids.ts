import { ApiError } from './auth';
import { apiJson } from './client';

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

export async function createBid(token: string, payload: CreateBidPayload) {
  try {
    return await apiJson<BidItem>('/bids', { method: 'POST', token, body: JSON.stringify(payload) });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to create bid');
  }
}

export async function getBidsForProject(token: string, projectId: string) {
  try {
    return await apiJson<BidItem[]>(`/bids/project/${projectId}`, { token, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load project bids');
  }
}

export async function getMyBids(token: string) {
  try {
    return await apiJson<BidItem[]>('/bids/my', { token, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load my bids');
  }
}

export async function updateBidStatus(token: string, bidId: string, status: 'ACCEPTED' | 'REJECTED') {
  try {
    return await apiJson<BidItem>(`/bids/${bidId}/status`, {
      method: 'PATCH',
      token,
      body: JSON.stringify({ status }),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to update bid status');
  }
}
