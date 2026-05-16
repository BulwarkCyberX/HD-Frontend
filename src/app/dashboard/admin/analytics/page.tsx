'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { getAdminAnalytics, type AdminAnalyticsSummary } from '@/lib/api/analytics';

export default function AdminAnalyticsPage() {
  const { token } = useAuth();
  const [data, setData] = useState<AdminAnalyticsSummary | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    void getAdminAnalytics(token)
      .then(setData)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [token]);

  if (!data) {
    return <p className="text-sm text-slate-600">{error || 'Loading analytics…'}</p>;
  }

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Platform analytics</h2>
        <p className="mt-1 text-sm text-slate-600">GMV, operations queues, and project distribution.</p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Users" value={String(data.users)} />
        <StatCard label="Projects" value={String(data.projects)} />
        <StatCard label="Released GMV (₹)" value={String(data.releasedPaymentsGross)} />
        <StatCard label="Active disputes" value={String(data.activeDisputes)} />
        <StatCard label="Pending KYC" value={String(data.pendingKyc)} href="/dashboard/admin/kyc" />
        <StatCard label="Pending withdrawals" value={String(data.pendingWithdrawals)} href="/dashboard/admin/kyc" />
      </div>

      {data.platformWallet ? (
        <Card>
          <h3 className="font-semibold text-slate-900">Platform wallet</h3>
          <p className="mt-2 text-sm text-slate-600">
            Available: ₹{data.platformWallet.availableBalance} · Lifetime fees: ₹
            {data.platformWallet.lifetimeEarnings}
          </p>
        </Card>
      ) : null}

      <Card>
        <h3 className="mb-3 font-semibold text-slate-900">Projects by status</h3>
        <ul className="grid gap-2 sm:grid-cols-2">
          {data.projectsByStatus.map((row) => (
            <li key={row.status} className="flex justify-between rounded-md bg-slate-50 px-3 py-2 text-sm">
              <span className="text-slate-700">{row.status}</span>
              <span className="font-medium text-slate-900">{row.count}</span>
            </li>
          ))}
        </ul>
      </Card>
    </section>
  );
}

function StatCard({ label, value, href }: { label: string; value: string; href?: string }) {
  const inner = (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
  if (href) {
    return (
      <Link href={href} className="block transition hover:opacity-90">
        {inner}
      </Link>
    );
  }
  return inner;
}
