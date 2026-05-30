'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Badge, Card } from '@hackersdeal/ui';
import { useSearchParams } from 'next/navigation';
import { ProtectedRoute } from '@/components/protected-route';
import { Spinner } from '@/components/spinner';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { getMyBids, type BidItem } from '@/lib/api/bids';

export default function MyBidsPage() {
  const searchParams = useSearchParams();
  const { token, logout, user } = useAuth();
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setErrorMessage('');
      try {
        const rows = await getMyBids(token);
        setBids(rows);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load bids');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [logout, token]);

  return (
    <ProtectedRoute>
      <div className="mx-auto max-w-4xl space-y-5">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">My Bids</h1>
          <p className="mt-2 text-sm text-slate-600">Track your submitted provider proposals.</p>
        </div>
        {searchParams.get('submitted') === '1' ? (
          <p className="text-sm text-emerald-700">Bid submitted successfully.</p>
        ) : null}
        {user?.role !== 'PROVIDER' ? (
          <p className="text-sm text-rose-600">Only provider accounts can access this page.</p>
        ) : null}
        {loading ? <Spinner size="md" label="Loading bids…" /> : null}
        {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
        <div className="space-y-3">
          {bids.map((bid) => (
            <Card key={bid.id}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-base font-semibold text-slate-900">{bid.project?.title ?? bid.projectId}</p>
                  <p className="mt-2 text-sm text-slate-600">{bid.proposal}</p>
                  <p className="mt-2 text-xs text-slate-500">
                    Price: {bid.price} | Timeline: {bid.timeline}
                  </p>
                  <Link href={`/projects/${bid.projectId}`} className="mt-2 inline-block text-sm text-emerald-700 hover:text-emerald-800">
                    View project
                  </Link>
                  {bid.status === 'ACCEPTED' ? (
                    <Link
                      href={`/dashboard/projects/${bid.projectId}`}
                      className="mt-2 ml-3 inline-block text-sm text-indigo-700 hover:text-indigo-800"
                    >
                      Open workspace
                    </Link>
                  ) : null}
                </div>
                <Badge tone={bid.status === 'ACCEPTED' ? 'success' : bid.status === 'REJECTED' ? 'warning' : 'default'}>
                  {bid.status}
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
