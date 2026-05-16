import { apiJson } from './client';

export type CheckoutSession = {
  sessionId: string;
  provider: 'RAZORPAY' | 'STRIPE' | 'MANUAL';
  providerOrderId: string;
  amount: number;
  currency: 'INR' | 'USD';
  amountMinor: number;
  publicKey: string;
  idempotencyKey: string;
};

export type PaymentTransaction = {
  id: string;
  projectId: string;
  amount: number;
  currency: 'INR' | 'USD';
  provider: string;
  status: string;
  providerOrderId: string | null;
  providerPaymentId: string | null;
  failureReason: string | null;
  paidAt: string | null;
  createdAt: string;
  payment: { id: string; status: string } | null;
};

export async function createCheckout(
  token: string,
  payload: {
    projectId: string;
    amount: number;
    currency: 'INR' | 'USD';
    idempotencyKey?: string;
  },
) {
  return apiJson<CheckoutSession>('/payments/checkout/create', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function verifyCheckout(
  token: string,
  payload: {
    sessionId: string;
    providerPaymentId: string;
    providerOrderId: string;
    signature: string;
  },
) {
  return apiJson<unknown>('/payments/checkout/verify', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getMyTransactions(token: string) {
  return apiJson<PaymentTransaction[]>('/payments/transactions/me', { token, cache: 'no-store' });
}
