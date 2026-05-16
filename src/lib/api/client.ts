import { ApiError } from './auth';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export function formatErrorMessage(raw: unknown): string {
  if (raw == null) return '';
  if (Array.isArray(raw)) return raw.map(String).join(', ');
  return String(raw);
}

export async function parseApiResponse<T>(res: Response): Promise<T> {
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

let refreshInFlight: Promise<string | null> | null = null;

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;
  refreshInFlight = (async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
      });
      if (!res.ok) return null;
      const data = await parseApiResponse<{ accessToken: string }>(res);
      return data.accessToken ?? null;
    } catch {
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();
  return refreshInFlight;
}

export async function logoutSession() {
  await fetch(`${API_BASE_URL}/auth/logout`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
  }).catch(() => undefined);
}

export type ApiFetchOptions = RequestInit & {
  token?: string | null;
  retryOnUnauthorized?: boolean;
};

export type ApiFetchResult<T> = {
  data: T;
  /** Set when a 401 was recovered via cookie refresh. */
  accessToken?: string;
};

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<ApiFetchResult<T>> {
  const { token, retryOnUnauthorized = true, headers, ...init } = options;
  const url = path.startsWith('http') ? path : `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;

  const buildHeaders = (accessToken?: string | null) => {
    const h = new Headers(headers);
    if (!h.has('Content-Type') && init.body && !(init.body instanceof FormData)) {
      h.set('Content-Type', 'application/json');
    }
    const bearer = accessToken ?? token;
    if (bearer) h.set('Authorization', `Bearer ${bearer}`);
    return h;
  };

  const run = (accessToken?: string | null) =>
    fetch(url, {
      ...init,
      credentials: 'include',
      headers: buildHeaders(accessToken),
    });

  let res = await run();
  let refreshed: string | undefined;

  if (res.status === 401 && retryOnUnauthorized) {
    const next = await refreshAccessToken();
    if (next) {
      refreshed = next;
      res = await run(next);
    }
  }

  const data = await parseApiResponse<T>(res);
  return refreshed ? { data, accessToken: refreshed } : { data };
}

export async function apiJson<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { data } = await apiFetch<T>(path, options);
  return data;
}
