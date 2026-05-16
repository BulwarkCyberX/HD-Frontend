import { apiJson } from './client';

export type OrganizationSummary = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  members: { role: string }[];
  _count: { members: number; projects: number };
};

export type OrganizationDetail = {
  id: string;
  name: string;
  slug: string;
  createdAt: string;
  members: {
    id: string;
    role: string;
    user: { id: string; email: string; firstName: string | null; lastName: string | null };
  }[];
  projects: { id: string; title: string; status: string; budgetAmount: number }[];
};

export type LinkableProject = {
  id: string;
  title: string;
  status: string;
  budgetAmount: number;
  createdAt: string;
};

export async function listMyOrganizations(token: string) {
  return apiJson<OrganizationSummary[]>('/organizations/me', { token, cache: 'no-store' });
}

export async function createOrganization(token: string, payload: { name: string; slug: string }) {
  return apiJson<OrganizationSummary>('/organizations', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function getOrganization(token: string, id: string) {
  return apiJson<OrganizationDetail>(`/organizations/${id}`, { token, cache: 'no-store' });
}

export async function addOrganizationMember(
  token: string,
  orgId: string,
  payload: { email: string; role: 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' },
) {
  return apiJson<unknown>(`/organizations/${orgId}/members`, {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function listLinkableProjects(token: string, orgId: string) {
  return apiJson<LinkableProject[]>(`/organizations/${orgId}/projects/linkable`, {
    token,
    cache: 'no-store',
  });
}

export async function linkOrganizationProject(token: string, orgId: string, projectId: string) {
  return apiJson<{ organizationId: string; projectId: string }>(`/organizations/${orgId}/projects`, {
    method: 'POST',
    token,
    body: JSON.stringify({ projectId }),
  });
}

export async function unlinkOrganizationProject(token: string, orgId: string, projectId: string) {
  return apiJson<{ ok: true }>(`/organizations/${orgId}/projects/${projectId}`, {
    method: 'DELETE',
    token,
  });
}
