import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type PaymentItem = {
  id: string;
  projectId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: 'INR' | 'USD';
  status: 'PENDING' | 'IN_ESCROW' | 'RELEASED' | 'REFUNDED';
  createdAt: string;
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

export async function depositPayment(
  token: string,
  payload: { projectId: string; amount: number; currency?: 'INR' | 'USD' },
) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/deposit`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<PaymentItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to deposit payment');
  }
}

export async function releasePayment(token: string, payload: { projectId: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/payments/release`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    return await parseResponse<PaymentItem>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to release payment');
  }
}

export async function completeProject(
  token: string,
  projectId: string,
  payload?: { explicitClientConfirmation?: boolean },
) {
  try {
    const res = await fetch(`${API_BASE_URL}/projects/${projectId}/complete`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload ?? {}),
    });
    return await parseResponse<unknown>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to mark project complete');
  }
}
