'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import {
  WEBHOOK_EVENTS,
  createApiKey,
  createWebhook,
  deleteWebhook,
  patchWebhook,
  listApiKeys,
  listWebhookDeliveries,
  listWebhooks,
  revokeApiKey,
  retryWebhookDelivery,
  testWebhook,
  type ApiKeyRow,
  type ApiScope,
  type WebhookDeliveryRow,
  type WebhookEvent,
  type WebhookRow,
} from '@/lib/api/integrations';

export default function IntegrationsPage() {
  return (
    <ProtectedRoute>
      <IntegrationsContent />
    </ProtectedRoute>
  );
}

function IntegrationsContent() {
  const { token } = useAuth();
  const [keys, setKeys] = useState<ApiKeyRow[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookRow[]>([]);
  const [newKeyLabel, setNewKeyLabel] = useState('Production');
  const [keyScopes, setKeyScopes] = useState<ApiScope[]>(['read']);
  const [createdKey, setCreatedKey] = useState('');
  const [whLabel, setWhLabel] = useState('Slack / SIEM');
  const [whUrl, setWhUrl] = useState('https://example.com/webhooks/hackersdeal');
  const [whEvents, setWhEvents] = useState<WebhookEvent[]>(['REPORT_VALIDATED', 'MILESTONE_RELEASED']);
  const [createdSecret, setCreatedSecret] = useState('');
  const [deliveries, setDeliveries] = useState<WebhookDeliveryRow[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reload = async () => {
    if (!token) return;
    const [k, w] = await Promise.all([listApiKeys(token), listWebhooks(token)]);
    setKeys(k);
    setWebhooks(w);
  };

  useEffect(() => {
    if (!token) return;
    void reload().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [token]);

  const toggleEvent = (ev: WebhookEvent) => {
    setWhEvents((prev) => (prev.includes(ev) ? prev.filter((x) => x !== ev) : [...prev, ev]));
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Integrations</h1>
        <p className="mt-1 text-sm text-slate-600">
          API keys for read access and outbound webhooks for Jira, Slack, or SIEM.
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-900">API keys</h2>
        <p className="text-xs text-slate-500">
          Header: <code className="rounded bg-slate-100 px-1">X-API-Key: hd_live_…</code>
        </p>
        <ul className="list-inside list-disc text-xs text-slate-600">
          <li>
            <code className="rounded bg-slate-100 px-1">GET /v1/projects?limit=50&cursor=</code>
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">GET /v1/projects/:id</code>
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">GET /v1/projects/:id/reports</code>
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">GET /v1/projects/:id/milestones</code>
          </li>
          <li>
            <code className="rounded bg-slate-100 px-1">POST /v1/projects/:id/reports</code> (scope{' '}
            <code className="rounded bg-slate-100 px-1">write:reports</code>)
          </li>
        </ul>
        <div className="flex flex-wrap gap-3 text-xs">
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={keyScopes.includes('read')}
              onChange={() =>
                setKeyScopes((prev) =>
                  prev.includes('read') ? prev.filter((s) => s !== 'read') : [...prev, 'read'],
                )
              }
            />
            read
          </label>
          <label className="flex items-center gap-1">
            <input
              type="checkbox"
              checked={keyScopes.includes('write:reports')}
              onChange={() =>
                setKeyScopes((prev) =>
                  prev.includes('write:reports')
                    ? prev.filter((s) => s !== 'write:reports')
                    : [...prev, 'write:reports'],
                )
              }
            />
            write:reports
          </label>
        </div>
        <p className="text-xs text-slate-500">Rate limit: 120 requests/min per API key (when Redis is running).</p>
        <div className="flex gap-2">
          <Input value={newKeyLabel} onChange={(e) => setNewKeyLabel(e.target.value)} placeholder="Key label" />
          <Button
            type="button"
            onClick={async () => {
              if (!token || keyScopes.length === 0) return;
              const res = await createApiKey(token, newKeyLabel, keyScopes);
              setCreatedKey(res.apiKey);
              setMessage('Copy your API key now — it will not be shown again.');
              await reload();
            }}
          >
            Create key
          </Button>
        </div>
        {createdKey ? (
          <p className="break-all rounded bg-amber-50 p-2 font-mono text-xs text-amber-900">{createdKey}</p>
        ) : null}
        <ul className="space-y-2 text-sm">
          {keys.map((k) => (
            <li key={k.id} className="flex items-center justify-between rounded border border-slate-200 p-2">
              <span>
                {k.label} · <span className="font-mono text-xs">{k.keyPrefix}…</span>
                <span className="ml-1 text-xs text-slate-500">({k.scopes.join(', ')})</span>
              </span>
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!token) return;
                  await revokeApiKey(token, k.id);
                  await reload();
                }}
              >
                Revoke
              </Button>
            </li>
          ))}
        </ul>
      </Card>

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-900">Webhooks</h2>
        <p className="text-xs text-slate-500">
          Signed with <code className="rounded bg-slate-100 px-1">X-HackersDeal-Signature: sha256=…</code>. Failed
          deliveries retry up to 4 times (exponential backoff) when Redis is running.
        </p>
        <Input value={whLabel} onChange={(e) => setWhLabel(e.target.value)} placeholder="Label" />
        <Input value={whUrl} onChange={(e) => setWhUrl(e.target.value)} placeholder="https://…" />
        <div className="flex flex-wrap gap-2 text-xs">
          {WEBHOOK_EVENTS.map((ev) => (
            <label key={ev} className="flex items-center gap-1">
              <input type="checkbox" checked={whEvents.includes(ev)} onChange={() => toggleEvent(ev)} />
              {ev}
            </label>
          ))}
        </div>
        <Button
          type="button"
          onClick={async () => {
            if (!token || whEvents.length === 0) return;
            const res = await createWebhook(token, { label: whLabel, url: whUrl, events: whEvents });
            setCreatedSecret(res.signingSecret);
            setMessage('Webhook created. Save the signing secret.');
            await reload();
          }}
        >
          Add webhook
        </Button>
        {createdSecret ? (
          <p className="break-all rounded bg-violet-50 p-2 font-mono text-xs text-violet-900">
            Signing secret: {createdSecret}
          </p>
        ) : null}
        <ul className="space-y-2 text-sm">
          {webhooks.map((w) => (
            <li key={w.id} className="rounded border border-slate-200 p-2">
              <p className="font-medium">{w.label}</p>
              <p className="text-xs text-slate-500 break-all">{w.url}</p>
              <p className="text-xs text-slate-500">{w.events.join(', ')} · {w._count.deliveries} deliveries</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!token) return;
                    await patchWebhook(token, w.id, !w.enabled);
                    await reload();
                  }}
                >
                  {w.enabled ? 'Disable' : 'Enable'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!token) return;
                    await testWebhook(token, w.id);
                    setMessage('Test webhook queued — check deliveries in a few seconds.');
                  }}
                >
                  Send test
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!token) return;
                    setDeliveries(await listWebhookDeliveries(token, w.id));
                  }}
                >
                  Recent deliveries
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={async () => {
                    if (!token) return;
                    await deleteWebhook(token, w.id);
                    await reload();
                  }}
                >
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
        {deliveries.length > 0 ? (
          <ul className="text-xs text-slate-600 space-y-1 border-t pt-2">
            {deliveries.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center gap-2">
                <span>
                  {d.event} · {d.success ? 'OK' : 'FAIL'} {d.statusCode ?? ''} ·{' '}
                  {new Date(d.createdAt).toLocaleString()}
                </span>
                {!d.success ? (
                  <Button
                    type="button"
                    variant="secondary"
                    className="!py-0.5 !px-2 !text-[10px]"
                    onClick={async () => {
                      if (!token) return;
                      await retryWebhookDelivery(token, d.id);
                      setMessage('Delivery re-queued for retry.');
                    }}
                  >
                    Retry
                  </Button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : null}
      </Card>
    </div>
  );
}


