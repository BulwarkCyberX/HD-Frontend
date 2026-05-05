'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@hackersdeal/ui';
import { FileAttachmentControl } from '@/components/file-attachment-control';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import {
  getBountyProgram,
  listBountyReports,
  submitBountyReport,
  updateBountyReportStatus,
  type BountyBugReport,
  type BountyProgram,
} from '@/lib/api/bounty';

export default function BountyProgramPage() {
  const params = useParams<{ id: string }>();
  const { token, user } = useAuth();
  const [program, setProgram] = useState<BountyProgram | null>(null);
  const [reports, setReports] = useState<BountyBugReport[]>([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState('MEDIUM');
  const [submitting, setSubmitting] = useState(false);
  const [lastReportId, setLastReportId] = useState<string | null>(null);

  const canResearch =
    user?.role === 'PROVIDER' &&
    program?.status === 'ACTIVE' &&
    program.allowedResearcherIds.includes(user.id);

  const isOwner = user?.role === 'CLIENT' && program?.clientId === user.id;

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const [p, r] = await Promise.all([
        getBountyProgram(token, params.id),
        listBountyReports(token, params.id),
      ]);
      setProgram(p);
      setReports(r);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Unable to load program');
    }
  }, [token, params.id]);

  useEffect(() => {
    void load();
  }, [load]);

  const onSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !canResearch) return;
    setSubmitting(true);
    setError('');
    try {
      const created = await submitBountyReport(token, {
        programId: params.id,
        title,
        description,
        severity,
      });
      setLastReportId(created.id);
      setTitle('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Submit failed');
    } finally {
      setSubmitting(false);
    }
  };

  const onTriage = async (reportId: string, status: 'VALID' | 'REJECTED' | 'DUPLICATE') => {
    if (!token) return;
    try {
      await updateBountyReportStatus(token, reportId, status);
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    }
  };

  if (!program && !error) {
    return <p className="text-sm text-slate-500">Loading…</p>;
  }

  if (error && !program) {
    return <p className="text-sm text-rose-600">{error}</p>;
  }

  if (!program) return null;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <Link href="/dashboard/bounty" className="text-sm text-emerald-700 hover:underline">
          ← Back to bounty programs
        </Link>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">{program.title}</h1>
        <p className="mt-1 text-sm text-slate-600">{program.description || 'No description.'}</p>
        <p className="mt-2 text-xs text-slate-500">Status: {program.status}</p>
      </div>

      <Card className="space-y-2">
        <h2 className="font-semibold text-slate-900">Scope</h2>
        <pre className="max-h-48 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(program.scope, null, 2)}
        </pre>
      </Card>

      <Card className="space-y-2">
        <h2 className="font-semibold text-slate-900">Reward table</h2>
        <pre className="max-h-48 overflow-auto rounded-md bg-slate-50 p-3 text-xs text-slate-700">
          {JSON.stringify(program.rewardTable, null, 2)}
        </pre>
      </Card>

      {canResearch ? (
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Submit vulnerability</h2>
          <form className="space-y-2" onSubmit={onSubmitReport}>
            <input
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              placeholder="Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={5}
              placeholder="Description and reproduction"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              required
            />
            <select
              className="rounded-md border border-slate-300 px-3 py-2 text-sm"
              value={severity}
              onChange={(e) => setSeverity(e.target.value)}
            >
              <option value="LOW">LOW</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="HIGH">HIGH</option>
              <option value="CRITICAL">CRITICAL</option>
            </select>
            {error ? <p className="text-sm text-rose-600">{error}</p> : null}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting…' : 'Submit report'}
            </Button>
          </form>
          {lastReportId && token ? (
            <div className="rounded-md border border-slate-200 p-3">
              <p className="mb-2 text-xs text-slate-600">Attach evidence to your latest submission:</p>
              <FileAttachmentControl token={token} target={{ bugReportId: lastReportId }} />
            </div>
          ) : null}
        </Card>
      ) : null}

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-900">Submissions</h2>
        {reports.length === 0 ? (
          <p className="text-sm text-slate-500">No submissions yet.</p>
        ) : (
          <ul className="space-y-3">
            {reports.map((r) => (
              <li key={r.id} className="rounded-md border border-slate-200 p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{r.title}</p>
                    <p className="text-xs text-slate-500">
                      {r.severity} · {r.status} · {r.researcher.email}
                    </p>
                  </div>
                  {isOwner && r.status === 'SUBMITTED' ? (
                    <div className="flex flex-wrap gap-1">
                      <Button type="button" variant="secondary" onClick={() => onTriage(r.id, 'VALID')}>
                        Valid
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => onTriage(r.id, 'DUPLICATE')}>
                        Duplicate
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => onTriage(r.id, 'REJECTED')}>
                        Reject
                      </Button>
                    </div>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-slate-700">{r.description}</p>
                {r.files?.length ? (
                  <ul className="mt-2 text-xs text-slate-600">
                    {r.files.map((f) => (
                      <li key={f.id}>{f.originalName}</li>
                    ))}
                  </ul>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
