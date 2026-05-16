import { ApiError } from './auth';
import { apiJson } from './client';

export type ReviewItem = {
  id: string;
  projectId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export type CreateReviewPayload = {
  projectId: string;
  rating: number;
  comment?: string;
};

export async function createReview(token: string, payload: CreateReviewPayload) {
  try {
    return await apiJson<ReviewItem>('/reviews', { method: 'POST', token, body: JSON.stringify(payload) });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to submit review');
  }
}

export type ClientReviewItem = {
  id: string;
  projectId: string;
  clientId: string;
  providerId: string;
  rating: number;
  comment: string | null;
  createdAt: string;
};

export async function createClientReview(token: string, payload: CreateReviewPayload) {
  return apiJson<ClientReviewItem>('/reviews/client', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
