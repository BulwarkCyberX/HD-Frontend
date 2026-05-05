'use client';

import { Card } from '@hackersdeal/ui';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth-context';

export default function DashboardPage() {
  const { user, authError, refreshUser } = useAuth();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Dashboard</h1>
        <p className="mt-2 text-sm text-slate-600">
          Connected dashboard using real backend auth context.
        </p>
      </div>
      {authError ? <p className="text-sm text-rose-600">{authError}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-dashed text-sm text-slate-600">
          <p className="font-medium text-slate-900">User Email</p>
          <p className="mt-2">{user?.email ?? 'Not available'}</p>
        </Card>
        <Card className="border-dashed text-sm text-slate-600">
          <p className="font-medium text-slate-900">User Role</p>
          <p className="mt-2">{user?.role ?? 'Not available'}</p>
        </Card>
        {user?.role === 'PROVIDER' ? (
          <>
            <Card className="border-dashed text-sm text-slate-600">
              <p className="font-medium text-slate-900">Bid Credits</p>
              <p className="mt-2">{user.providerProfile?.bidCredits ?? 0}</p>
            </Card>
            <Card className="border-dashed text-sm text-slate-600">
              <p className="font-medium text-slate-900">Average Rating</p>
              <p className="mt-2">{(user.providerProfile?.rating ?? 0).toFixed(1)} / 5</p>
            </Card>
            <Card className="border-dashed text-sm text-slate-600">
              <p className="font-medium text-slate-900">Total Reviews</p>
              <p className="mt-2">{user.providerProfile?.totalReviews ?? 0}</p>
            </Card>
            <Card className="border-dashed text-sm text-slate-600">
              <p className="font-medium text-slate-900">Completed Projects</p>
              <p className="mt-2">{user.providerProfile?.completedProjects ?? 0}</p>
            </Card>
            <Card className="border-dashed text-sm text-slate-600">
              <p className="font-medium text-slate-900">Valid Reports</p>
              <p className="mt-2">{user.providerProfile?.validReportCount ?? 0}</p>
            </Card>
            <Card className="border-dashed text-sm text-slate-600">
              <p className="font-medium text-slate-900">Reputation Score</p>
              <p className="mt-2">{(user.providerProfile?.reputationScore ?? 0).toFixed(2)}</p>
            </Card>
          </>
        ) : null}
      </div>
    </div>
  );
}
