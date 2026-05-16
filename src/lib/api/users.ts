import { apiJson } from './client';
import type { AuthUser } from './auth';

export type UpdateProviderProfilePayload = {
  bio?: string;
  portfolio?: unknown;
  availabilityStatus?: 'AVAILABLE' | 'BUSY' | 'UNAVAILABLE';
  skills?: string[];
  certifications?: string[];
};

export async function updateProviderProfile(token: string, payload: UpdateProviderProfilePayload) {
  return apiJson<AuthUser>('/users/me/provider-profile', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
