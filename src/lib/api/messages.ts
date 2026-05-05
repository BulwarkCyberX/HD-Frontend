import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type WorkspaceMessage = {
  id: string;
  projectId: string;
  senderId: string;
  message: string;
  createdAt: string;
  sender: {
    id: string;
    email: string;
    role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  };
  files?: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    createdAt: string;
  }[];
};

export async function getMessages(token: string, projectId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/messages/${projectId}`, {
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
    return json as WorkspaceMessage[];
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load messages');
  }
}

export async function sendMessage(token: string, payload: { projectId: string; message: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/messages`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const json = (await res.json()) as unknown;
    if (!res.ok) {
      const message =
        typeof json === 'object' && json && 'message' in json
          ? String((json as { message: string | string[] }).message)
          : `Request failed with status ${res.status}`;
      throw new ApiError(res.status, message);
    }
    return json as WorkspaceMessage;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to send message');
  }
}
