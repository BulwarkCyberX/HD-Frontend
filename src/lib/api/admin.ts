import { apiJson } from './client';

export type EmailTemplateSummary = {
  id: string;
  key: string;
  name: string;
  category: string;
  description: string;
  subject: string;
  title: string;
  preheader: string | null;
  variables: string[];
  updatedAt: string;
};

export type EmailTemplateDetail = EmailTemplateSummary & {
  innerHtml: string;
  textBody: string;
};

export type AdminProjectRow = {
  id: string;
  title: string;
  description: string;
  budgetType: string;
  budgetAmount: number;
  status: string;
  visibility: string;
  clientId: string;
  selectedProviderId: string | null;
  createdAt: string;
  client: { id: string; email: string; firstName: string | null; lastName: string | null };
  payment: { id: string; amount: number; currency: string; status: string } | null;
  _count: { bids: number; reports: number; milestones: number; disputes: number };
};

export type ProjectFinancials = {
  payment: { id: string; amount: number; currency: string; status: string } | null;
  checkouts: {
    id: string;
    amount: number;
    currency: string;
    provider: string;
    status: string;
    providerOrderId: string | null;
    paidAt: string | null;
    createdAt: string;
  }[];
  ledger: {
    id: string;
    type: string;
    amount: string;
    currency: string;
    status: string;
    referenceId: string;
    createdAt: string;
  }[];
  clientWallet: {
    escrowBalance: string;
    availableBalance: string;
    totalSpent: string;
    currency: string;
  } | null;
};

export async function getAdminOverview(token: string) {
  return apiJson<{ sections: { id: string; label: string; href: string }[] }>('/admin/overview', {
    token,
    cache: 'no-store',
  });
}

export async function listEmailTemplates(token: string) {
  return apiJson<EmailTemplateSummary[]>('/admin/email-templates', { token, cache: 'no-store' });
}

export async function getEmailTemplate(token: string, key: string) {
  return apiJson<EmailTemplateDetail>(`/admin/email-templates/${encodeURIComponent(key)}`, {
    token,
    cache: 'no-store',
  });
}

export async function updateEmailTemplate(
  token: string,
  key: string,
  payload: Partial<
    Pick<EmailTemplateDetail, 'subject' | 'title' | 'preheader' | 'innerHtml' | 'textBody' | 'name' | 'description'>
  >,
) {
  return apiJson<EmailTemplateDetail>(`/admin/email-templates/${encodeURIComponent(key)}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function previewEmailTemplate(
  token: string,
  key: string,
  variables?: Record<string, string>,
) {
  return apiJson<{ subject: string; html: string; text: string }>(
    `/admin/email-templates/${encodeURIComponent(key)}/preview`,
    { method: 'POST', token, body: JSON.stringify({ variables }) },
  );
}

export async function listAdminProjects(
  token: string,
  params?: { status?: string; visibility?: string; q?: string },
) {
  const qs = new URLSearchParams();
  if (params?.status) qs.set('status', params.status);
  if (params?.visibility) qs.set('visibility', params.visibility);
  if (params?.q) qs.set('q', params.q);
  const query = qs.toString();
  return apiJson<AdminProjectRow[]>(`/admin/projects${query ? `?${query}` : ''}`, {
    token,
    cache: 'no-store',
  });
}

export async function getAdminProject(token: string, id: string) {
  return apiJson<unknown>(`/admin/projects/${id}`, { token, cache: 'no-store' });
}

export async function updateAdminProject(token: string, id: string, payload: Record<string, unknown>) {
  return apiJson<unknown>(`/admin/projects/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function acceptBidAsAdmin(token: string, projectId: string, bidId: string) {
  return apiJson<unknown>(`/admin/projects/${projectId}/bids/${bidId}/accept`, {
    method: 'POST',
    token,
  });
}

export async function getProjectFinancials(token: string, projectId: string) {
  return apiJson<ProjectFinancials>(`/admin/projects/${projectId}/financials`, {
    token,
    cache: 'no-store',
  });
}
