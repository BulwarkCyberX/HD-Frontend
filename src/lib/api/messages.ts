import { ApiError } from './auth';
import { apiJson } from './client';

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
    return await apiJson<WorkspaceMessage[]>(`/messages/${projectId}`, { token, cache: 'no-store' });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to load messages');
  }
}

export async function sendMessage(token: string, payload: { projectId: string; message: string }) {
  try {
    return await apiJson<WorkspaceMessage>('/messages', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to send message');
  }
}
