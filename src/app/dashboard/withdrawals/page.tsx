'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { createWithdrawalRequest, listMyWithdrawals, type WithdrawalRow } from '@/lib/api/withdrawals';

export default function WithdrawalsPage() {
  const { token, logout } = useAuth();
  const [rows, setRows] = useState<WithdrawalRow[]>([]);
  const [amount, setAmount] = useState(100);
  const [currency, setCurrency] = useState<'INR' | 'USD'>('INR');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const list = await listMyWithdrawals(token);
      setRows(list);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) {
        logout();
        return;
      }
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async () => {
    if (!token) return;
    setSubmitting(true);
    setError('');
    setInfo('');
    try {
      await createWithdrawalRequest(token, { amount, currency });
      setInfo('Withdrawal request submitted for admin review.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Request failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-slate-900">Withdrawals</h1>
      <p className="text-sm text-slate-600">
        Available balance is debited when an admin approves your request (ledger-only payouts).
      </p>
      {loading ? <p className="text-sm text-slate-600">Loading...</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {info ? <p className="text-sm text-emerald-700">{info}</p> : null}

      <div className="max-w-md space-y-2 rounded-md border border-slate-200 p-4">
        <p className="text-sm font-medium text-slate-900">New request</p>
        <input
          type="number"
          min={1}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
        />
        <select
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          value={currency}
          onChange={(e) => setCurrency(e.target.value as 'INR' | 'USD')}
        >
          <option value="INR">INR</option>
          <option value="USD">USD</option>
        </select>
        <Button type="button" disabled={submitting} onClick={() => void submit()}>
          {submitting ? 'Submitting...' : 'Submit request'}
        </Button>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-slate-900">History</p>
        {rows.length === 0 ? (
          <p className="text-sm text-slate-500">No withdrawal requests yet.</p>
        ) : (
          <ul className="divide-y divide-slate-200 rounded-md border border-slate-200">
            {rows.map((r) => (
              <li key={r.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-sm">
                <span>
                  {r.amount} {r.currency}
                </span>
                <span className="text-slate-600">{r.status}</span>
                <span className="text-xs text-slate-500">{new Date(r.createdAt).toLocaleString()}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
