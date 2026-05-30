'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card, Input, Button } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { listAdminProjects, type AdminProjectRow } from '@/lib/api/admin';

export default function AdminProjectsPage() {
  const { token } = useAuth();
  const [rows, setRows] = useState<AdminProjectRow[]>([]);
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setRows(
      await listAdminProjects(token, {
        q: q.trim() || undefined,
        status: status || undefined,
      }),
    );
  }, [q, status, token]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load]);

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">All projects</h2>
        <p className="mt-1 text-sm text-slate-600">Manage status, visibility, budget, and assignments platform-wide.</p>
      </header>
      <form
        className="flex flex-wrap gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          void load();
        }}
      >
        <Input placeholder="Search title, description, client email…" value={q} onChange={(e) => setQ(e.target.value)} />
        <select
          className="rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          <option value="">All statuses</option>
          <option value="DRAFT">DRAFT</option>
          <option value="ACTIVE">ACTIVE</option>
          <option value="IN_PROGRESS">IN_PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <Button type="submit">Filter</Button>
      </form>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <ul className="space-y-2">
        {rows.map((p) => (
          <li key={p.id}>
            <Link href={`/dashboard/admin/projects/${p.id}`}>
              <Card className="transition hover:border-tropical-jade-300">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{p.title}</p>
                    <p className="text-xs text-slate-500">
                      {p.client.email} · {p.visibility} · {p.status}
                    </p>
                  </div>
                  <p className="text-sm text-slate-600">
                    ₹{p.budgetAmount} · {p._count.bids} bids · {p._count.reports} reports
                    {p.payment ? ` · pay ${p.payment.status}` : ''}
                  </p>
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
