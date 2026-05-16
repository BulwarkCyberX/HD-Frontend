import { apiJson } from './client';

export async function sendWeeklyDigestsAdmin(token: string) {
  return apiJson<{ sent: number; since: string }>('/notifications/admin/weekly-digest', {
    method: 'POST',
    token,
  });
}
