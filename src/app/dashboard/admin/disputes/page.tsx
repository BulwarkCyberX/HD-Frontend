'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Textarea } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { listAdminDisputes, resolveDispute, type DisputeItem } from '@/lib/api/disputes';

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
  const [resolution, setResolution] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    setRows(await listAdminDisputes(token));
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN' && token) return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [token, user?.role]);

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Dispute center</h1>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {rows.map((d) => (
        <Card key={d.id} className="space-y-2 text-sm">
          <p className="font-medium text-slate-900">
            {d.title} · {d.category} · {d.status}
          </p>
          <p className="text-slate-600">{d.description}</p>
          <Textarea
            placeholder="Resolution notes"
            value={resolution[d.id] ?? ''}
            onChange={(e) => setResolution((prev) => ({ ...prev, [d.id]: e.target.value }))}
          />
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              onClick={() =>
                void resolveDispute(token!, d.id, {
                  resolution: resolution[d.id] ?? 'Resolved',
                  status: 'RESOLVED',
                }).then(load)
              }
            >
              Resolve
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={() =>
                void resolveDispute(token!, d.id, {
                  resolution: resolution[d.id] ?? 'Refunded',
                  status: 'REFUNDED',
                }).then(load)
              }
            >
              Refund
            </Button>
          </div>
        </Card>
      ))}
    </div>
  );
}
