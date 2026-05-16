import { apiJson } from './client';

export type UserSessionRow = {
  id: string;
  userAgent: string | null;
  ipAddress: string | null;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
};

export async function listAuthSessions(token: string) {
  return apiJson<UserSessionRow[]>('/auth/sessions', { token, cache: 'no-store' });
}

export async function revokeAuthSession(token: string, sessionId: string) {
  return apiJson<{ ok: true }>(`/auth/sessions/${sessionId}/revoke`, {
    method: 'POST',
    token,
  });
}

export async function revokeOtherAuthSessions(token: string) {
  return apiJson<{ ok: boolean }>('/auth/sessions/revoke-others', {
    method: 'POST',
    token,
  });
}
