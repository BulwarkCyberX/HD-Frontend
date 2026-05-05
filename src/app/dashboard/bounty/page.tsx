'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { createBountyProgram, listBountyPrograms, type BountyProgram } from '@/lib/api/bounty';

export default function BountyDashboardPage() {
  const { token, user } = useAuth();
  const [programs, setPrograms] = useState<BountyProgram[]>([]);
  const [error, setError] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [scopeJson, setScopeJson] = useState('{"assets":[],"notes":""}');
  const [rewardJson, setRewardJson] = useState('{"critical":5000,"high":2000}');
  const [allowedIds, setAllowedIds] = useState('');
  const [status, setStatus] = useState<'DRAFT' | 'ACTIVE'>('DRAFT');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const list = await listBountyPrograms(token);
      setPrograms(list);
    } catch (e) {
      if (e instanceof ApiError) setError(e.message);
      else setError('Failed to load programs');
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || user?.role !== 'CLIENT') return;
    let scope: unknown;
    let rewardTable: unknown;
    try {
      scope = JSON.parse(scopeJson) as unknown;
      rewardTable = JSON.parse(rewardJson) as unknown;
    } catch {
      setError('Scope and reward table must be valid JSON.');
      return;
    }
    const allowedResearcherIds = allowedIds
      .split(/[\s,]+/)
      .map((s) => s.trim())
      .filter(Boolean);

    setSubmitting(true);
    setError('');
    try {
      await createBountyProgram(token, {
        title,
        description,
        scope,
        rewardTable,
        status,
        allowedResearcherIds,
      });
      setTitle('');
      setDescription('');
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Create failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (user?.role !== 'CLIENT') {
    return (
      <div className="mx-auto max-w-3xl space-y-4">
        <h1 className="text-2xl font-semibold text-slate-900">Private Bug Bounty</h1>
        <p className="text-sm text-slate-600">
          Only client accounts can create programs. As a researcher, open programs you are invited to from the list
          below.
        </p>
        <Card className="space-y-2">
          {programs.length === 0 ? (
            <p className="text-sm text-slate-500">No programs available.</p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {programs.map((p) => (
                <li key={p.id} className="py-2">
                  <Link href={`/dashboard/bounty/${p.id}`} className="font-medium text-emerald-800 hover:underline">
                    {p.title}
                  </Link>
                  <span className="ml-2 text-xs text-slate-500">{p.status}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Private Bug Bounty</h1>
        <p className="mt-1 text-sm text-slate-600">
          Invite researchers by user id and activate when ready. Programs stay private to invited researchers only.
        </p>
      </div>

      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-slate-900">Create program</h2>
        <form className="space-y-3" onSubmit={onCreate}>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} required minLength={3} />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Description</label>
            <textarea
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Scope (JSON)</label>
            <textarea
              className="font-mono w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
              rows={5}
              value={scopeJson}
              onChange={(e) => setScopeJson(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Reward table (JSON)</label>
            <textarea
              className="font-mono w-full rounded-md border border-slate-300 px-3 py-2 text-xs"
              rows={4}
              value={rewardJson}
              onChange={(e) => setRewardJson(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700">Invited researcher user ids (comma-separated)</label>
            <Input
              placeholder="cuid1, cuid2"
              value={allowedIds}
              onChange={(e) => setAllowedIds(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm text-slate-700">Initial status</label>
            <select
              className="rounded-md border border-slate-300 px-2 py-1 text-sm"
              value={status}
              onChange={(e) => setStatus(e.target.value as 'DRAFT' | 'ACTIVE')}
            >
              <option value="DRAFT">DRAFT</option>
              <option value="ACTIVE">ACTIVE</option>
            </select>
          </div>
          {error ? <p className="text-sm text-rose-600">{error}</p> : null}
          <Button type="submit" disabled={submitting}>
            {submitting ? 'Saving…' : 'Create program'}
          </Button>
        </form>
      </Card>

      <Card className="space-y-2">
        <h2 className="text-lg font-semibold text-slate-900">Your programs</h2>
        {programs.length === 0 ? (
          <p className="text-sm text-slate-500">No programs yet.</p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {programs.map((p) => (
              <li key={p.id} className="flex items-center justify-between py-2">
                <div>
                  <Link href={`/dashboard/bounty/${p.id}`} className="font-medium text-emerald-800 hover:underline">
                    {p.title}
                  </Link>
                  <p className="text-xs text-slate-500">{p.status}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
