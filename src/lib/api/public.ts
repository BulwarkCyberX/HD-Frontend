import { apiJson } from './client';

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

export type PublicProjectFilters = {
  q?: string;
  minBudget?: string;
  maxBudget?: string;
  budgetType?: string;
  skill?: string;
  sort?: 'newest' | 'budget_asc' | 'budget_desc';
};

export async function fetchPublicProjects(params?: PublicProjectFilters) {
  const qs = params
    ? `?${new URLSearchParams(
        Object.entries(params)
          .filter(([, v]) => v != null && v !== '')
          .map(([k, v]) => [k, String(v)]),
      )}`
    : '';
  return apiJson<PublicProject[]>(`/public/projects${qs}`, { cache: 'no-store', retryOnUnauthorized: false });
}

export async function fetchPublicProject(id: string) {
  return apiJson<PublicProject>(`/public/projects/${id}`, { cache: 'no-store', retryOnUnauthorized: false });
}

export async function fetchPublicProvider(id: string) {
  return apiJson<PublicProvider>(`/public/providers/${id}`, { cache: 'no-store', retryOnUnauthorized: false });
}

export async function fetchFeaturedProviders() {
  return apiJson<unknown[]>('/public/providers/featured/list', { cache: 'no-store', retryOnUnauthorized: false });
}

export async function searchPublicProjects(q: string) {
  return apiJson<unknown[]>(`/public/search/projects?q=${encodeURIComponent(q)}`, {
    cache: 'no-store',
    retryOnUnauthorized: false,
  });
}
