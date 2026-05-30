import { apiJson } from './client';

export type FraudFlagRow = {
  id: string;
  userId: string;
  score: number;
  reasons: { entries?: Array<{ reason: string; detail?: Record<string, unknown>; at: string }> } | null;
  updatedAt: string;
  user: { email: string; role: string };
};

export async function listFraudFlags(token: string) {
  return apiJson<FraudFlagRow[]>('/admin/fraud/flags', { token, cache: 'no-store' });
}

export async function clearFraudFlag(token: string, userId: string) {
  return apiJson<{ ok: boolean }>(`/admin/fraud/flags/${userId}/clear`, {
    method: 'PATCH',
    token,
  });
}
