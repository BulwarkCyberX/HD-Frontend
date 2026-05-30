import { apiJson } from './client';

export type OrgSsoConfig = {
  id: string;
  protocol: 'OIDC' | 'SAML';
  enabled: boolean;
  issuerUrl: string;
  clientId: string;
  allowedEmailDomains: string[];
  updatedAt: string;
};

export async function getOrgSso(token: string, orgId: string) {
  return apiJson<OrgSsoConfig | null>(`/organizations/${orgId}/sso`, { token, cache: 'no-store' });
}

export async function upsertOrgSso(
  token: string,
  orgId: string,
  body: {
    protocol: 'OIDC' | 'SAML';
    enabled: boolean;
    issuerUrl: string;
    clientId: string;
    clientSecret?: string;
    allowedEmailDomains?: string[];
  },
) {
  return apiJson<OrgSsoConfig>(`/organizations/${orgId}/sso`, {
    method: 'PUT',
    token,
    body: JSON.stringify(body),
  });
}

export async function deleteOrgSso(token: string, orgId: string) {
  return apiJson<{ ok: boolean }>(`/organizations/${orgId}/sso`, { method: 'DELETE', token });
}

export function enterpriseLoginUrl(slug: string, apiBase: string) {
  return `${apiBase.replace(/\/$/, '')}/auth/enterprise/${slug}`;
}
