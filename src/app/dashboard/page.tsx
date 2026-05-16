'use client';

import Link from 'next/link';
import { Card, Button } from '@hackersdeal/ui';
import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth-context';
import {
  getAdminAnalytics,
  getClientAnalytics,
  getProviderAnalytics,
  type AdminAnalyticsSummary,
  type ClientAnalytics,
  type ProviderAnalytics,
} from '@/lib/api/analytics';

export default function DashboardPage() {
  const { user, token, authError, refreshUser } = useAuth();
  const [adminStats, setAdminStats] = useState<AdminAnalyticsSummary | null>(null);
  const [clientStats, setClientStats] = useState<ClientAnalytics | null>(null);
  const [providerStats, setProviderStats] = useState<ProviderAnalytics | null>(null);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!token || !user) return;
    const run = async () => {
      if (user.role === 'ADMIN') {
        setAdminStats(await getAdminAnalytics(token));
      } else if (user.role === 'CLIENT') {
        setClientStats(await getClientAnalytics(token));
      } else if (user.role === 'PROVIDER') {
        setProviderStats(await getProviderAnalytics(token));
      }
    };
    void run().catch(() => undefined);
  }, [token, user]);

  return (
    <section className="mx-auto max-w-4xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Welcome back{user?.email ? `, ${user.email}` : ''}.
        </p>
      </header>
      {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}

      {user?.role === 'ADMIN' && adminStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <Metric label="Users" value={adminStats.users} />
          <Metric label="Projects" value={adminStats.projects} />
          <Metric label="Released GMV ₹" value={adminStats.releasedPaymentsGross} />
          <Metric label="Open disputes" value={adminStats.activeDisputes} />
          <Metric label="KYC queue" value={adminStats.pendingKyc} />
          <Metric label="Withdrawals pending" value={adminStats.pendingWithdrawals} />
        </div>
      ) : null}

      {user?.role === 'CLIENT' && clientStats ? (
        <div className="grid gap-4 sm:grid-cols-3">
          <Metric label="Projects owned" value={clientStats.projectsOwned} />
          <Metric
            label="Escrow balance ₹"
            value={Number(clientStats.wallet?.escrowBalance ?? 0).toFixed(0)}
          />
          <Metric label="Total spent ₹" value={Number(clientStats.wallet?.totalSpent ?? 0).toFixed(0)} />
        </div>
      ) : null}

      {user?.role === 'PROVIDER' && providerStats ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Metric label="Bids submitted" value={providerStats.bidsSubmitted} />
          <Metric label="Rating" value={(providerStats.profile?.rating ?? 0).toFixed(1)} />
          <Metric label="Completed" value={providerStats.profile?.completedProjects ?? 0} />
          <Metric
            label="Available ₹"
            value={Number(providerStats.wallet?.availableBalance ?? 0).toFixed(0)}
          />
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {user?.role === 'ADMIN' ? (
          <Link href="/dashboard/admin">
            <Button>Admin panel</Button>
          </Link>
        ) : null}
        {user?.role === 'CLIENT' ? (
          <>
            <Link href="/dashboard/projects/create">
              <Button>Create project</Button>
            </Link>
            <Link href="/dashboard/organization">
              <Button variant="secondary">Organizations</Button>
            </Link>
          </>
        ) : null}
        {user?.role === 'PROVIDER' ? (
          <Link href="/projects">
            <Button>Browse projects</Button>
          </Link>
        ) : null}
        <Link href="/marketplace">
          <Button variant="secondary">Marketplace</Button>
        </Link>
      </div>

      {user?.role === 'PROVIDER' && user.providerProfile ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <Card className="text-sm text-slate-600">
            <p className="font-medium text-slate-900">Bid credits</p>
            <p className="mt-2">{user.providerProfile.bidCredits}</p>
          </Card>
          <Card className="text-sm text-slate-600">
            <p className="font-medium text-slate-900">Reputation</p>
            <p className="mt-2">{user.providerProfile.reputationScore.toFixed(2)}</p>
          </Card>
        </div>
      ) : null}
    </section>
  );
}

function Metric({ label, value }: { label: string; value: string | number }) {
  return (
    <Card>
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-slate-900">{value}</p>
    </Card>
  );
}
