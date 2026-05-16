import { apiJson } from './client';

export type KycStatusResponse = {
  status: 'NOT_STARTED' | 'PENDING' | 'APPROVED' | 'REJECTED';
  approved: boolean;
  submission: {
    id: string;
    status: string;
    panNumberMasked: string | null;
    panHolderName: string | null;
    bankAccountLast4: string | null;
    bankIfsc: string | null;
    adminNotes: string | null;
    reviewedAt: string | null;
    createdAt: string;
  } | null;
};

export async function getKycStatus(token: string) {
  return apiJson<KycStatusResponse>('/kyc/me', { token, cache: 'no-store' });
}

export type AdminKycRow = {
  id: string;
  userId: string;
  status: string;
  panNumberMasked: string | null;
  panHolderName: string | null;
  bankAccountLast4: string | null;
  bankIfsc: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
};

export async function listPendingKyc(token: string) {
  return apiJson<AdminKycRow[]>('/kyc/admin/pending', { token, cache: 'no-store' });
}

export async function reviewKyc(token: string, id: string, payload: { approve: boolean; adminNotes?: string }) {
  return apiJson<unknown>(`/kyc/admin/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function submitKyc(
  token: string,
  payload: {
    panNumber: string;
    panHolderName: string;
    bankAccountNumber: string;
    bankIfsc: string;
    bankAccountHolder: string;
  },
) {
  return apiJson<unknown>('/kyc/submit', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}
