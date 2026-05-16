'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { listAdminDisputes, type DisputeItem } from '@/lib/api/disputes';

export default function AdminDisputesPage() {
  return (
    <ProtectedRoute>
      <AdminDisputesContent />
    </ProtectedRoute>
  );
}

function AdminDisputesContent() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<DisputeItem[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setRows(await listAdminDisputes(token));
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'ADMIN' && token) return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load, token, user?.role]);

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Dispute center</h1>
      <p className="text-sm text-slate-600">
        Open a dispute to review timeline, evidence, and process escrow refunds.
      </p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {rows.length === 0 ? (
        <p className="text-sm text-slate-500">No disputes.</p>
      ) : (
        rows.map((d) => (
          <Link key={d.id} href={`/dashboard/admin/disputes/${d.id}`}>
            <Card className="transition hover:border-tropical-jade-300">
              <p className="font-medium text-slate-900">
                {d.title} · {d.category} · {d.status}
              </p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{d.description}</p>
              {d.project ? (
                <p className="mt-1 text-xs text-slate-500">Project: {d.project.title}</p>
              ) : null}
            </Card>
          </Link>
        ))
      )}
    </div>
  );
}
