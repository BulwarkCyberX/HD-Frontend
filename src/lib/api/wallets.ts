import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type WalletSummary = {
  availableBalance: string;
  pendingBalance: string;
  escrowBalance: string;
  lifetimeEarnings: string;
  totalSpent: string;
  currency: 'INR' | 'USD';
  updatedAt: string | null;
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

export async function getWalletMe(token: string) {
  const res = await fetch(`${API_BASE_URL}/wallets/me`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: 'no-store',
  });
  return parse<WalletSummary>(res);
}
