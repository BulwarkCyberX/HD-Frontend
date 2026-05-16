import { apiJson } from './client';

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

export async function createWithdrawalRequest(
  token: string,
  payload: { amount: number; currency: 'INR' | 'USD' },
) {
  return apiJson<WithdrawalRow>('/withdrawals', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function listMyWithdrawals(token: string) {
  return apiJson<WithdrawalRow[]>('/withdrawals/me', { token, cache: 'no-store' });
}

export type AdminWithdrawalRow = WithdrawalRow & {
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
};

export async function listPendingWithdrawals(token: string) {
  return apiJson<AdminWithdrawalRow[]>('/withdrawals/admin/pending', { token, cache: 'no-store' });
}

export async function approveWithdrawal(token: string, id: string) {
  return apiJson<WithdrawalRow>(`/withdrawals/admin/${id}/approve`, { method: 'PATCH', token });
}

export async function rejectWithdrawal(token: string, id: string) {
  return apiJson<WithdrawalRow>(`/withdrawals/admin/${id}/reject`, { method: 'PATCH', token });
}

