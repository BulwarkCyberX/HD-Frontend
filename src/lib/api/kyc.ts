import { ApiError } from './auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

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

export async function getKycStatus(token: string) {
  const res = await fetch(`${API_BASE_URL}/kyc/me`, {
    headers: { Authorization: `Bearer ${token}` },
    credentials: 'include',
    cache: 'no-store',
  });
  return parseResponse<KycStatusResponse>(res);
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
  const res = await fetch(`${API_BASE_URL}/kyc/submit`, {
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
