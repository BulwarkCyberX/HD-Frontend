import { ApiError } from './auth';
import { apiJson } from './client';

export type NotificationItem = {
  id: string;
  userId: string;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

export async function listNotifications(token: string) {
  try {
    return await apiJson<NotificationItem[]>('/notifications', { token, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load notifications');
  }
}

export async function markNotificationRead(token: string, id: string) {
  try {
    return await apiJson<NotificationItem>(`/notifications/${id}/read`, { method: 'PATCH', token });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to update notification');
  }
}
