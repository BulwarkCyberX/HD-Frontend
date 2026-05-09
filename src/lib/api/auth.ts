export type AuthUser = {
  id: string;
  email: string;
  role: 'CLIENT' | 'PROVIDER' | 'ADMIN';
  entityId: string | null;
  createdAt: string;
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

class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseResponse<T>(res: Response): Promise<T> {
  let json: unknown = null;
  try {
    json = await res.json();
  } catch {
    json = null;
  }

  if (!res.ok) {
    const message =
      typeof json === 'object' && json && 'message' in json
        ? String((json as { message: string | string[] }).message)
        : `Request failed with status ${res.status}`;
    throw new ApiError(res.status, message);
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
    return await parseResponse<AuthResponse>(res);
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('Unable to reach registration service');
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

export { ApiError };
