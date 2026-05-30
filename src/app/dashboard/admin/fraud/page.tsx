'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { clearFraudFlag, listFraudFlags, type FraudFlagRow } from '@/lib/api/fraud';

export default function AdminFraudPage() {
  return (
    <ProtectedRoute>
      <AdminFraudContent />
    </ProtectedRoute>
  );
}

function AdminFraudContent() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<FraudFlagRow[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setRows(await listFraudFlags(token));
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load, user?.role]);

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">Fraud flags</h1>
      <p className="text-sm text-slate-600">
        Users flagged by bid velocity (&gt;20/h) or report velocity (&gt;15/h). KYC blocks withdrawals at score ≥
        80.
      </p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {rows.length === 0 ? (
        <Card className="text-sm text-slate-600">No flagged users (score ≥ 10).</Card>
      ) : (
        rows.map((r) => {
          const entries = r.reasons?.entries ?? [];
          const latest = entries[entries.length - 1];
          return (
            <Card key={r.id} className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">
                {r.user.email} · {r.user.role} · score {r.score}
              </p>
              {latest ? (
                <p className="text-xs text-slate-500">
                  Latest: {latest.reason} · {new Date(latest.at).toLocaleString()}
                </p>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                onClick={async () => {
                  if (!token) return;
                  await clearFraudFlag(token, r.userId);
                  setMessage(`Cleared flag for ${r.user.email}`);
                  await load();
                }}
              >
                Clear flag
              </Button>
            </Card>
          );
        })
      )}
    </div>
  );
}
