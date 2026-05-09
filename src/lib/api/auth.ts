export type AuthUser = {
  id: string;
  email: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  entityId: string | null;
  createdAt: string;
  emailVerified?: boolean;
  providerProfile?: {
    bidCredits: number;
    rating: number;
    totalReviews: number;
    completedProjects: number;
    validReportCount: number;
    reputationScore: number;
  } | null;
  clientProfile?: {
    id: string;
    userId: string;
    companySize: string | null;
    createdAt: string;
  } | null;
};

export type AuthResponse = {
  accessToken: string;
  user: AuthUser;
};

export type RegisterPendingResponse = {
  needsEmailVerification: true;
  email: string;
};

export type RegisterResult = AuthResponse | RegisterPendingResponse;

type LoginPayload = {
  email: string;
  password: string;
};

type RequestLoginCodePayload = {
  email: string;
};

type VerifyLoginCodePayload = {
  email: string;
  code: string;
};

type RegisterPayload = {
  email: string;
  password: string;
  role?: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  firstName: string;
  lastName: string;
  country: string;
  city: string;
  state: string;
  postalCode: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  status: number;
  /** Machine-readable code when the API returns one (e.g. EMAIL_NOT_VERIFIED). */
  code?: string;

  constructor(status: number, message: string, code?: string) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

function formatErrorMessage(raw: unknown): string {
  if (raw == null) return '';
  if (Array.isArray(raw)) return raw.map(String).join(', ');
  return String(raw);
}

async function parseResponse<T>(res: Response): Promise<T> {
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const body = typeof json === 'object' && json !== null ? (json as Record<string, unknown>) : null;
    const rawMessage = body?.message;
    const message =
      rawMessage !== undefined && rawMessage !== null
        ? formatErrorMessage(rawMessage)
        : `Request failed with status ${res.status}`;
    const code = typeof body?.code === 'string' ? body.code : undefined;
    throw new ApiError(res.status, message, code);
  }

  return json as T;
}

export async function login(payload: LoginPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<AuthResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to reach authentication service');
  }
}

export async function requestLoginCode(payload: RequestLoginCodePayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/code/request`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<{ ok: true }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to reach authentication service');
  }
}

export async function verifyLoginCode(payload: VerifyLoginCodePayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/login/code/verify`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<AuthResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to reach authentication service');
  }
}

export async function register(payload: RegisterPayload) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<RegisterResult>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to reach registration service');
  }
}

export async function verifyEmailOtp(payload: { email: string; code: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email/otp`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<{ verified: true }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to verify email');
  }
}

export async function verifyEmailToken(payload: { token: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/verify-email/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<{ verified: true }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to verify email');
  }
}

export async function resendVerificationEmail(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/resend-verification`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await parseResponse<{ ok: true }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to resend verification email');
  }
}

export async function forgotPassword(email: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    return await parseResponse<{ ok: true }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to request password reset');
  }
}

export async function resetPassword(payload: { token: string; password: string }) {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/reset-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    return await parseResponse<{ ok: true }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to reset password');
  }
}

export async function checkEmailAvailability(email: string) {
  try {
    const url = new URL(`${API_BASE_URL}/auth/check-email`);
    url.searchParams.set('email', email);
    const res = await fetch(url.toString(), { cache: 'no-store' });
    return await parseResponse<{ available: boolean }>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to check email availability');
  }
}

export async function getCurrentUser(token: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return await parseResponse<AuthUser>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to fetch current user');
  }
}

export async function getProviderProfile(token: string, providerId: string) {
  try {
    const res = await fetch(`${API_BASE_URL}/users/provider/${providerId}`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: 'no-store',
    });
    return await parseResponse<AuthUser>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to fetch provider profile');
  }
}

