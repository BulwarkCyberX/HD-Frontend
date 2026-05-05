import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type FileRecord = {
  id: string;
  url: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadedBy: string | null;
  projectId: string | null;
  workspaceReportId: string | null;
  bugReportId: string | null;
  messageId: string | null;
  vdpSubmissionId: string | null;
  createdAt: string;
};

type UploadTarget =
  | { projectId: string }
  | { workspaceReportId: string }
  | { bugReportId: string }
  | { messageId: string }
  | { vdpSubmissionId: string };

export async function uploadFile(token: string, file: File, target: UploadTarget) {
  const formData = new FormData();
  formData.append('file', file);
  if ('projectId' in target) formData.append('projectId', target.projectId);
  if ('workspaceReportId' in target) formData.append('workspaceReportId', target.workspaceReportId);
  if ('bugReportId' in target) formData.append('bugReportId', target.bugReportId);
  if ('messageId' in target) formData.append('messageId', target.messageId);
  if ('vdpSubmissionId' in target) formData.append('vdpSubmissionId', target.vdpSubmissionId);

  const res = await fetch(`${API_BASE_URL}/files/upload`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}` },
    body: formData,
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as FileRecord;
}

export async function uploadVdpAttachmentPublic(
  file: File,
  vdpSubmissionId: string,
  contactEmail: string,
) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('vdpSubmissionId', vdpSubmissionId);
  formData.append('contactEmail', contactEmail);

  const res = await fetch(`${API_BASE_URL}/files/vdp-attach`, {
    method: 'POST',
    body: formData,
  });
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as FileRecord;
}

export function fileDownloadUrl(fileId: string) {
  return `${API_BASE_URL}/files/${fileId}`;
}

/** Authenticated download — browser cannot attach Bearer headers via `<a href>`. */
export async function fetchAuthenticatedFile(token: string, fileId: string) {
  const res = await fetch(`${API_BASE_URL}/files/${fileId}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new ApiError(res.status, text || 'Failed to download file');
  }
  return res.blob();
}
