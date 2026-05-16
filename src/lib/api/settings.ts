import { apiJson } from './client';

export type UserSettings = {
  userId: string;
  emailDigestWeekly: boolean;
  lastEmailDigestAt: string | null;
};

export async function updateUserSettings(token: string, payload: { emailDigestWeekly: boolean }) {
  return apiJson<UserSettings>('/users/me/settings', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
