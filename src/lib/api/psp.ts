import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

async function parseResponse<T>(res: Response): Promise<T> {
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
  }
  return json as T;
}

export async function createCheckout(
  token: string,
  payload: {
    projectId: string;
    amount: number;
    currency: 'INR' | 'USD';
    idempotencyKey?: string;
  },
) {
  const res = await fetch(`${API_BASE_URL}/payments/checkout/create`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return parseResponse<CheckoutSession>(res);
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
  const res = await fetch(`${API_BASE_URL}/payments/checkout/verify`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
    credentials: 'include',
  });
  return parseResponse<unknown>(res);
}

export async function getMyTransactions(token: string) {
  const res = await fetch(`${API_BASE_URL}/payments/transactions/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
    cache: 'no-store',
  });
  return parseResponse<PaymentTransaction[]>(res);
}
