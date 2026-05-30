'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@hackersdeal/ui';
import {
  deleteOrgSso,
  enterpriseLoginUrl,
  getOrgSso,
  upsertOrgSso,
  type OrgSsoConfig,
} from '@/lib/api/enterprise-sso';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type Props = {
  token: string;
  orgId: string;
  orgSlug: string;
  canManage: boolean;
};

export function OrgSsoSettings({ token, orgId, orgSlug, canManage }: Props) {
  const [config, setConfig] = useState<OrgSsoConfig | null>(null);
  const [enabled, setEnabled] = useState(false);
  const [issuerUrl, setIssuerUrl] = useState('https://login.microsoftonline.com/{tenant}/v2.0');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [domains, setDomains] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const row = await getOrgSso(token, orgId);
    setConfig(row);
    if (row) {
      setEnabled(row.enabled);
      setIssuerUrl(row.issuerUrl);
      setClientId(row.clientId);
      setDomains(row.allowedEmailDomains.join(', '));
    }
  }, [orgId, token]);

  useEffect(() => {
    if (!canManage) return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load SSO failed'));
  }, [canManage, load]);

  if (!canManage) return null;

  const save = async () => {
    setError('');
    const body: Parameters<typeof upsertOrgSso>[2] = {
      protocol: 'OIDC',
      enabled,
      issuerUrl,
      clientId,
      allowedEmailDomains: domains
        .split(',')
        .map((d) => d.trim())
        .filter(Boolean),
    };
    if (clientSecret.trim()) body.clientSecret = clientSecret.trim();
    const res = await upsertOrgSso(token, orgId, body);
    setConfig(res);
    setClientSecret('');
    setMessage('SSO configuration saved.');
  };

  return (
    <Card className="space-y-3">
      <h2 className="font-semibold text-slate-900">Enterprise SSO (OIDC)</h2>
      <p className="text-xs text-slate-500">
        Members sign in via your identity provider. SAML is planned; use OIDC (Azure AD, Okta, Google Workspace).
      </p>
      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} />
        Enable SSO
      </label>
      <Input value={issuerUrl} onChange={(e) => setIssuerUrl(e.target.value)} placeholder="Issuer URL" />
      <Input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="Client ID" />
      <Input
        type="password"
        value={clientSecret}
        onChange={(e) => setClientSecret(e.target.value)}
        placeholder={config ? 'New client secret (leave blank to keep)' : 'Client secret'}
      />
      <Input
        value={domains}
        onChange={(e) => setDomains(e.target.value)}
        placeholder="Allowed email domains (comma-separated), e.g. acme.com"
      />
      {enabled ? (
        <p className="text-xs text-slate-600 break-all">
          Login URL: {enterpriseLoginUrl(orgSlug, API_BASE)}
        </p>
      ) : null}
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save().catch((e) => setError(e instanceof Error ? e.message : 'Save failed'))}>
          Save SSO
        </Button>
        {config ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              void deleteOrgSso(token, orgId)
                .then(() => {
                  setConfig(null);
                  setMessage('SSO removed.');
                })
                .catch((e) => setError(e instanceof Error ? e.message : 'Delete failed'))
            }
          >
            Remove SSO
          </Button>
        ) : null}
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
    </Card>
  );
}
