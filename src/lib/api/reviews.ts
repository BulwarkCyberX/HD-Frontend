import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

export async function createReview(token: string, payload: CreateReviewPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<ReviewItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to submit review');
  }
}
