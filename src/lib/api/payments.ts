import { apiJson } from './client';

export type PaymentItem = {
  id: string;
  projectId: string;
  payerId: string;
  payeeId: string;
  amount: number;
  currency: 'INR' | 'USD';
  status: 'PENDING' | 'IN_ESCROW' | 'RELEASED' | 'REFUNDED';
  createdAt: string;
};

export async function depositPayment(
  token: string,
  payload: { projectId: string; amount: number; currency?: 'INR' | 'USD' },
) {
  return apiJson<PaymentItem>('/payments/deposit', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function releasePayment(token: string, payload: { projectId: string }) {
  return apiJson<PaymentItem>('/payments/release', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function completeProject(
  token: string,
  projectId: string,
  payload?: { explicitClientConfirmation?: boolean },
) {
  return apiJson<unknown>(`/projects/${projectId}/complete`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload ?? {}),
  });
}
