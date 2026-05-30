'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Button, Card, Input, Textarea } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { uploadVdpAttachmentPublic } from '@/lib/api/files';
import { getVdpPublic, submitVdpReport, type VdpPublic } from '@/lib/api/vdp';

export default function PublicVdpPage() {
  const params = useParams<{ id: string }>();
  const { token } = useAuth();
  const [vdp, setVdp] = useState<VdpPublic | null>(null);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [severity, setSeverity] = useState('');
  const [submissionId, setSubmissionId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    void (async () => {
      try {
        const row = await getVdpPublic(params.id);
        setVdp(row);
      } catch (e) {
        if (e instanceof ApiError) setError(e.message);
        else setError('Unable to load disclosure policy');
      }
    })();
  }, [params.id]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const row = await submitVdpReport({
        vdpId: params.id,
        title,
        description,
        contactEmail: contactEmail || undefined,
        severity: severity || undefined,
      });
      setSubmissionId(row.id);
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submission failed');
    }
  };

  if (error && !vdp) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-rose-400">{error}</p>
      </main>
    );
  }

  if (!vdp) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-12">
        <p className="text-neutral-400">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-8 px-4 py-12">
      <div>
        <h1 className="text-3xl font-semibold text-neutral-50">{vdp.title}</h1>
        <p className="mt-2 text-sm text-neutral-400">
          Responsible disclosure channel — no bounty payouts through this page.
        </p>
      </div>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Scope</h2>
        <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-700">
          {typeof vdp.scope === 'string' ? vdp.scope : JSON.stringify(vdp.scope, null, 2)}
        </pre>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Disclosure policy</h2>
        <div className="prose prose-sm max-w-none text-slate-700 whitespace-pre-wrap">{vdp.policy}</div>
      </Card>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Report a vulnerability</h2>
        {done ? (
          <div className="space-y-3 rounded-md border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
            <p>Thank you. Your reference id: {submissionId}</p>
            {contactEmail && submissionId ? (
              <div className="space-y-2">
                <p className="text-xs">
                  Optional: attach screenshots or logs. You must use the same email as in the report.
                </p>
                <VdpPublicFileUpload
                  vdpSubmissionId={submissionId}
                  contactEmail={contactEmail}
                  onDone={() => undefined}
                />
              </div>
            ) : null}
          </div>
        ) : (
          <form className="space-y-3" onSubmit={onSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Description</label>
              <Textarea rows={8} required minLength={10} value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Contact email (recommended)</label>
              <Input
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
                placeholder="security@yourdomain.com"
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700">Severity (optional)</label>
              <select
                className="w-full rounded-md border border-tropical-jade-200 bg-white px-3 py-2 text-sm text-slate-900"
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
              >
                <option value="">—</option>
                <option value="LOW">LOW</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit">Submit safely</Button>
          </form>
        )}
      </Card>

      {token ? (
        <p className="text-xs text-neutral-400">
          Organization users can also attach files while signed in from the dashboard flows.
        </p>
      ) : null}
    </main>
  );
}

function VdpPublicFileUpload({
  vdpSubmissionId,
  contactEmail,
  onDone,
}: {
  vdpSubmissionId: string;
  contactEmail: string;
  onDone: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const pick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setErr('');
    try {
      await uploadVdpAttachmentPublic(file, vdpSubmissionId, contactEmail);
      onDone();
    } catch (error) {
      setErr(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <input type="file" className="text-sm" disabled={busy} onChange={pick} />
      {err ? <p className="text-xs text-rose-600">{err}</p> : null}
    </div>
  );
}
