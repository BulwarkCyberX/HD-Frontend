import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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
    const res = await fetch(`${API_BASE_URL}/notifications`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    const json = (await res.json()) as unknown;
    if (!res.ok) {
      const message =
        typeof json === 'object' && json && 'message' in json
          ? String((json as { message: string | string[] }).message)
          : `Request failed with status ${res.status}`;
      throw new ApiError(res.status, message);
    }
    return json as NotificationItem[];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load notifications');
  }
}

export async function markNotificationRead(token: string, id: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/notifications/${id}/read`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json()) as unknown;
    if (!res.ok) {
      const message =
        typeof json === 'object' && json && 'message' in json
          ? String((json as { message: string | string[] }).message)
          : `Request failed with status ${res.status}`;
      throw new ApiError(res.status, message);
    }
    return json as NotificationItem;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to update notification');
  }
}
