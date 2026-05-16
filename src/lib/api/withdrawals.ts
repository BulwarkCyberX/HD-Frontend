import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type WithdrawalRow = {
  id: string;
  userId: string;
  amount: string;
  currency: 'INR' | 'USD';
  status: string;
  adminReviewerId: string | null;
  reviewedAt: string | null;
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

export async function createWithdrawalRequest(
  token: string,
  payload: { amount: number; currency: 'INR' | 'USD' },
) {
  const res = await fetch(`${API_BASE_URL}/withdrawals`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  return parse<WithdrawalRow>(res);
}

export async function listMyWithdrawals(token: string) {
  const res = await fetch(`${API_BASE_URL}/withdrawals/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return parse<WithdrawalRow[]>(res);
}
