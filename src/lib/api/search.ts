import { apiJson } from './client';
import type { PublicProject } from './public';

export type SavedSearch = {
  id: string;
  name: string;
  queryJson: unknown;
  createdAt: string;
};

export async function searchPublicProjects(q: string) {
  return apiJson<PublicProject[]>(`/public/search/projects?q=${encodeURIComponent(q)}`, {
    cache: 'no-store',
    retryOnUnauthorized: false,
  });
}

export async function searchPublicProviders(q: string) {
  return apiJson<unknown[]>(`/public/search/providers?q=${encodeURIComponent(q)}`, {
    cache: 'no-store',
    retryOnUnauthorized: false,
  });
}

export async function listSavedSearches(token: string) {
  return apiJson<SavedSearch[]>('/search/saved/me', { token, cache: 'no-store' });
}

export async function createSavedSearch(token: string, name: string, queryJson: object) {
  return apiJson<SavedSearch>('/search/saved', {
    method: 'POST',
    token,
    body: JSON.stringify({ name, queryJson }),
  });
}
