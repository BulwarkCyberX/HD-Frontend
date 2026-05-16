'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { getKycStatus, submitKyc, type KycStatusResponse } from '@/lib/api/kyc';
import { getMyTransactions, type PaymentTransaction } from '@/lib/api/psp';
import {
  listAuthSessions,
  revokeAuthSession,
  revokeOtherAuthSessions,
  type UserSessionRow,
} from '@/lib/api/sessions';
import { updateUserSettings } from '@/lib/api/settings';

export default function SettingsPage() {
  return (
    <ProtectedRoute>
      <SettingsContent />
    </ProtectedRoute>
  );
}

function SettingsContent() {
  const { token, user, logout, refreshUser } = useAuth();
  const [emailDigestWeekly, setEmailDigestWeekly] = useState(true);
  const [kyc, setKyc] = useState<KycStatusResponse | null>(null);
  const [transactions, setTransactions] = useState<PaymentTransaction[]>([]);
  const [panNumber, setPanNumber] = useState('');
  const [panHolderName, setPanHolderName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankIfsc, setBankIfsc] = useState('');
  const [bankAccountHolder, setBankAccountHolder] = useState('');
  const [sessions, setSessions] = useState<UserSessionRow[]>([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const reloadSessions = async () => {
    if (!token) return;
    setSessions(await listAuthSessions(token));
  };

  useEffect(() => {
    if (!token) return;
    void Promise.all([getKycStatus(token), getMyTransactions(token), listAuthSessions(token), refreshUser()])
      .then(([k, tx, s]) => {
        setKyc(k);
        setTransactions(tx);
        setSessions(s);
      })
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load settings'));
  }, [token, refreshUser]);

  useEffect(() => {
    if (user?.settings) {
      setEmailDigestWeekly(user.settings.emailDigestWeekly);
    }
  }, [user?.settings]);

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
    await revokeOtherAuthSessions(token);
    setMessage('Other sessions revoked.');
    await reloadSessions();
  };

  const revokeOne = async (sessionId: string) => {
    if (!token) return;
    await revokeAuthSession(token, sessionId);
    setMessage('Session revoked.');
    await reloadSessions();
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
        <h2 className="font-semibold text-slate-900">Integrations</h2>
        <p className="mt-2 text-sm text-slate-600">API keys and outbound webhooks for automation.</p>
        <Link href="/dashboard/integrations" className="mt-2 inline-block text-sm font-medium text-tropical-jade-700 underline">
          Manage integrations →
        </Link>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Notifications</h2>
        <label className="mt-3 flex items-center gap-2 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={emailDigestWeekly}
            onChange={async (e) => {
              if (!token) return;
              const next = e.target.checked;
              setEmailDigestWeekly(next);
              await updateUserSettings(token, { emailDigestWeekly: next });
              await refreshUser();
              setMessage('Notification preferences saved.');
            }}
          />
          Weekly email digest (bids, milestones, and activity summary)
        </label>
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
        <p className="mt-2 text-sm text-slate-600">Active sessions (httpOnly refresh cookies).</p>
        {sessions.length === 0 ? (
          <p className="mt-2 text-sm text-slate-500">No active sessions.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {sessions.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 px-3 py-2">
                <span className="text-slate-600">
                  {s.userAgent?.slice(0, 60) ?? 'Unknown device'}
                  <span className="block text-xs text-slate-500">
                    {s.ipAddress ?? 'IP hidden'} · Last used {new Date(s.lastUsedAt).toLocaleString()}
                  </span>
                </span>
                <Button type="button" variant="secondary" onClick={() => void revokeOne(s.id)}>
                  Revoke
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button variant="secondary" type="button" className="mt-3" onClick={() => void revokeOthers()}>
          Revoke all other sessions
        </Button>
      </Card>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
