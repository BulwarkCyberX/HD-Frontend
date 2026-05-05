'use client';

import { useState } from 'react';
import { Button, Card, Input } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { createVdp } from '@/lib/api/vdp';

export default function VdpManagePage() {
  const { token, user } = useAuth();
  const [title, setTitle] = useState('');
  const [scopeJson, setScopeJson] = useState('{"domains":[],"apis":[]}');
  const [policy, setPolicy] = useState(
    'We ask that you give us reasonable time to remediate before public disclosure.',
  );
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || user?.role !== 'CLIENT') return;
    let scope: unknown;
    try {
      scope = JSON.parse(scopeJson) as unknown;
    } catch {
      setError('Scope must be valid JSON');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const row = await createVdp(token, { title, scope, policy });
      setCreatedId(row.id);
    } catch (err) {
      if (err instanceof ApiError) setError(err.message);
      else setError('Unable to create VDP');
    } finally {
      setBusy(false);
    }
  };

  if (user?.role !== 'CLIENT') {
    return (
      <div className="max-w-xl space-y-2">
        <h1 className="text-2xl font-semibold text-slate-900">Vulnerability Disclosure</h1>
        <p className="text-sm text-slate-600">Only client accounts can publish a VDP channel.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Vulnerability Disclosure Program</h1>
        <p className="mt-1 text-sm text-slate-600">
          Create a public reporting page. Share the link with researchers — no rewards are offered here.
        </p>
      </div>

      <Card className="space-y-4">
        <form className="space-y-3" onSubmit={onSubmit}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Scope (JSON)</label>
            <textarea
              className="font-mono w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
              rows={6}
              value={scopeJson}
              onChange={(e) => setScopeJson(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Disclosure policy</label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={8}
              value={policy}
              onChange={(e) => setPolicy(e.target.value)}
              required
              minLength={20}
            />
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={busy}>
            {busy ? 'Publishing…' : 'Publish VDP'}
          </Button>
        </form>
      </Card>

      {createdId ? (
        <Card className="space-y-2 border-emerald-200 bg-emerald-50/50">
          <p className="text-sm font-medium text-emerald-900">Public link</p>
          <p className="break-all font-mono text-sm text-emerald-800">
            {typeof window !== 'undefined' ? `${window.location.origin}/vdp/${createdId}` : `/vdp/${createdId}`}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
