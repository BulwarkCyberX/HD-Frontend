'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import {
  approveWithdrawal,
  listPendingWithdrawals,
  rejectWithdrawal,
  type AdminWithdrawalRow,
} from '@/lib/api/withdrawals';

export default function AdminWithdrawalsPage() {
  return (
    <ProtectedRoute>
      <AdminWithdrawalsContent />
    </ProtectedRoute>
  );
}

function AdminWithdrawalsContent() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<AdminWithdrawalRow[]>([]);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setRows(await listPendingWithdrawals(token));
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load, user?.role]);

  const act = async (id: string, action: 'approve' | 'reject') => {
    if (!token) return;
    setError('');
    setMessage('');
    try {
      if (action === 'approve') await approveWithdrawal(token, id);
      else await rejectWithdrawal(token, id);
      setMessage(action === 'approve' ? 'Marked as paid (ledger debited).' : 'Withdrawal rejected.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Withdrawal queue</h1>
        <p className="text-sm text-slate-600">Approve after KYC is verified. Paid status debits provider wallet.</p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {rows.length === 0 ? (
        <Card className="text-sm text-slate-600">No pending withdrawals.</Card>
      ) : (
        rows.map((w) => (
          <Card key={w.id} className="flex flex-wrap items-center justify-between gap-3 text-sm">
            <div>
              <p className="font-medium text-slate-900">
                {w.user.firstName} {w.user.lastName} · {w.user.email}
              </p>
              <p className="text-slate-600">
                ₹{w.amount} {w.currency} · requested {new Date(w.createdAt).toLocaleString()}
              </p>
            </div>
            <div className="flex gap-2">
              <Button type="button" onClick={() => void act(w.id, 'approve')}>
                Approve & pay
              </Button>
              <Button type="button" variant="secondary" onClick={() => void act(w.id, 'reject')}>
                Reject
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
