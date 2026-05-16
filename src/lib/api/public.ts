const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export type PublicProject = {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  budgetAmount: number;
  timeline: string;
  status: string;
  inScope: string[];
  outOfScope: string[];
  testingWindow: string;
  createdAt: string;
  projectSkills?: { skill: { slug: string; label: string } }[];
};

export type PublicProvider = {
  id: string;
  displayName: string;
  country: string | null;
  city: string | null;
  memberSince: string;
  profile: {
    skills: string[];
    certifications: string[];
    rating: number;
    totalReviews: number;
    completedProjects: number;
    validReportCount: number;
    reputationScore: number;
    bio: string;
    portfolio: unknown;
    availabilityStatus: string;
    providerSkills: { skill: { slug: string; label: string } }[];
  };
};

async function parseJson<T>(res: Response): Promise<T> {
  const json = (await res.json()) as unknown;
  if (!res.ok) {
    throw new Error(typeof json === 'object' && json && 'message' in json ? String((json as { message: string }).message) : 'Request failed');
  }
  return json as T;
}

export async function fetchPublicProjects(params?: Record<string, string>) {
  const qs = params ? `?${new URLSearchParams(params)}` : '';
  const res = await fetch(`${API_BASE_URL}/public/projects${qs}`, { cache: 'no-store' });
  return parseJson<PublicProject[]>(res);
}

export async function fetchPublicProject(id: string) {
  const res = await fetch(`${API_BASE_URL}/public/projects/${id}`, { cache: 'no-store' });
  return parseJson<PublicProject>(res);
}

export async function fetchPublicProvider(id: string) {
  const res = await fetch(`${API_BASE_URL}/public/providers/${id}`, { cache: 'no-store' });
  return parseJson<PublicProvider>(res);
}

export async function fetchFeaturedProviders() {
  const res = await fetch(`${API_BASE_URL}/public/providers/featured/list`, { cache: 'no-store' });
  return parseJson<unknown[]>(res);
}

export async function searchPublicProjects(q: string) {
  const res = await fetch(`${API_BASE_URL}/public/search/projects?q=${encodeURIComponent(q)}`, { cache: 'no-store' });
  return parseJson<unknown[]>(res);
}
