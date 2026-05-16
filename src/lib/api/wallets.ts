import { apiJson } from './client';

export type WalletSummary = {
  availableBalance: string;
  pendingBalance: string;
  escrowBalance: string;
  lifetimeEarnings: string;
  totalSpent: string;
  currency: 'INR' | 'USD';
  updatedAt: string | null;
};

export async function getWalletMe(token: string) {
  return apiJson<WalletSummary>('/wallets/me', { token, cache: 'no-store' });
}
