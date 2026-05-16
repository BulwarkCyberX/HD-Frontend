'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { getKycStatus, submitKyc, type KycStatusResponse } from '@/lib/api/kyc';
import { getMyTransactions, type PaymentTransaction } from '@/lib/api/psp';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { token, user, logout } = useAuth();
  const [kyc, setKyc] = useState<KycStatusResponse | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [panNumber, setPanNumber] = useState('');
  const [panHolderName, setPanHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    void Promise.all([getKycStatus(token), getMyTransactions(token)])
      .then(([k, tx]) => {
        setKyc(k);
        setTransactions(tx);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load settings'));
  }, [token]);

  const submitKycForm = async () => {
    if (!token) return;
    setMessage('');
    setError('');
    try {
      await submitKyc(token, {
        panNumber,
        panHolderName,
        bankAccountNumber,
        bankIfsc,
        bankAccountHolder,
      });
      setMessage('KYC submitted for review.');
      setKyc(await getKycStatus(token));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'KYC submission failed');
    }
  };

  const revokeOthers = async () => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/auth/sessions/revoke-others`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      credentials: 'include',
    });
    setMessage('Other sessions revoked.');
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Account settings</h1>
        <p className="mt-1 text-sm text-slate-600">Profile, payouts, security, and billing.</p>
      </div>

      <Card>
        <h2 className="font-semibold text-slate-900">Account</h2>
        <p className="mt-2 text-sm text-slate-600">Email: {user?.email}</p>
        <p className="text-sm text-slate-600">Role: {user?.role}</p>
        <div className="mt-3 flex gap-2">
          <Link href="/dashboard/profile">
            <Button variant="secondary" type="button">
              View profile
            </Button>
          </Link>
          <Button variant="secondary" type="button" onClick={() => logout()}>
            Sign out
          </Button>
        </div>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">KYC & payouts</h2>
        <p className="mt-1 text-sm text-slate-600">
          Status: <span className="font-medium">{kyc?.status ?? '…'}</span>
          {kyc?.approved ? ' ✓' : ''}
        </p>
        {kyc?.submission?.adminNotes ? (
          <p className="mt-2 text-sm text-amber-700">Note: {kyc.submission.adminNotes}</p>
        ) : null}
        {kyc && !kyc.approved && kyc.status !== 'PENDING' ? (
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Input placeholder="PAN" value={panNumber} onChange={(e) => setPanNumber(e.target.value)} />
            <Input placeholder="Name on PAN" value={panHolderName} onChange={(e) => setPanHolderName(e.target.value)} />
            <Input
              placeholder="Bank account"
              value={bankAccountNumber}
              onChange={(e) => setBankAccountNumber(e.target.value)}
            />
            <Input placeholder="IFSC" value={bankIfsc} onChange={(e) => setBankIfsc(e.target.value)} />
            <Input
              className="sm:col-span-2"
              placeholder="Account holder name"
              value={bankAccountHolder}
              onChange={(e) => setBankAccountHolder(e.target.value)}
            />
            <Button type="button" onClick={() => void submitKycForm()}>
              Submit KYC
            </Button>
          </div>
        ) : null}
        <Link href="/dashboard/withdrawals" className="mt-3 inline-block text-sm text-tropical-jade-700 underline">
          Withdrawal history
        </Link>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Payment history</h2>
        {transactions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No checkout sessions yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {transactions.map((t) => (
              <li key={t.id} className="rounded border border-slate-200 px-3 py-2">
                <span className="font-medium">₹{t.amount}</span> · {t.status} · {t.provider}
                <span className="block text-xs text-slate-500">Project {t.projectId}</span>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Security</h2>
        <p className="mt-2 text-sm text-slate-600">Sessions use httpOnly cookies when supported.</p>
        <Button variant="secondary" type="button" className="mt-3" onClick={() => void revokeOthers()}>
          Revoke other sessions
        </Button>
      </Card>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
