'use client';

import { Card } from '@hackersdeal/ui';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth-context';

export default function ProfilePage() {
  const { user, refreshUser } = useAuth();

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">
          Profile and trust metrics overview.
        </p>
      </div>
      <Card className="border-dashed text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">Email:</span> {user?.email ?? 'Not available'}
        </p>
        <p className="mt-2">
          <span className="font-medium text-slate-900">Role:</span> {user?.role ?? 'Not available'}
        </p>
      </Card>
      {user?.role === 'PROVIDER' && user.providerProfile ? (
        <Card className="border-dashed text-sm text-slate-600">
          <p className="font-medium text-slate-900">Provider Reputation Metrics</p>
          <p className="mt-2">Rating: {user.providerProfile.rating.toFixed(1)} / 5</p>
          <p>Total reviews: {user.providerProfile.totalReviews}</p>
          <p>Completed projects: {user.providerProfile.completedProjects}</p>
          <p>Valid reports: {user.providerProfile.validReportCount}</p>
          <p>Reputation score: {user.providerProfile.reputationScore.toFixed(2)}</p>
        </Card>
      ) : null}
    </div>
  );
}
