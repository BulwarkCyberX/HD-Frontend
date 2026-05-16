import { apiJson } from './client';

export type DisputeItem = {
  id: string;
  projectId: string;
  openedById: string;
  category: string;
  status: string;
  title: string;
  description: string;
  resolution: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  project?: { id: string; title: string };
};

export type DisputeComment = {
  id: string;
  body: string;
  internal: boolean;
  createdAt: string;
  author: { id: string; email: string; role: string };
};

export type DisputeEvidence = {
  id: string;
  note: string | null;
  createdAt: string;
  fileAsset: {
    id: string;
    originalName: string;
    mimeType: string;
    size: number;
    url: string;
  };
};

export type DisputeDetail = DisputeItem & {
  project: {
    id: string;
    title: string;
    clientId: string;
    selectedProviderId: string | null;
    status: string;
  };
  openedBy: { id: string; email: string; role: string };
  comments: DisputeComment[];
  evidence: DisputeEvidence[];
};

export async function listProjectDisputes(token: string, projectId: string) {
  return apiJson<DisputeItem[]>(`/disputes/project/${projectId}`, { token, cache: 'no-store' });
}

export async function getDispute(token: string, disputeId: string) {
  return apiJson<DisputeDetail>(`/disputes/${disputeId}`, { token, cache: 'no-store' });
}

export async function openDispute(
  token: string,
  payload: { projectId: string; category: string; title: string; description: string },
) {
  return apiJson<DisputeItem>('/disputes', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function listAdminDisputes(token: string) {
  return apiJson<DisputeItem[]>('/disputes/admin/all', { token, cache: 'no-store' });
}

export async function markDisputeReview(token: string, disputeId: string) {
  return apiJson<DisputeItem>(`/disputes/admin/${disputeId}/review`, {
    method: 'PATCH',
    token,
  });
}

export async function addDisputeComment(
  token: string,
  disputeId: string,
  payload: { body: string; internal?: boolean },
) {
  return apiJson<DisputeComment>(`/disputes/${disputeId}/comments`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function addDisputeEvidence(
  token: string,
  disputeId: string,
  payload: { fileAssetId: string; note?: string },
) {
  return apiJson<DisputeEvidence>(`/disputes/${disputeId}/evidence`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function resolveDispute(
  token: string,
  disputeId: string,
  payload: {
    resolution: string;
    status: 'RESOLVED' | 'REFUNDED' | 'REJECTED';
    processEscrowRefund?: boolean;
  },
) {
  return apiJson<DisputeItem>(`/disputes/admin/${disputeId}/resolve`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}
