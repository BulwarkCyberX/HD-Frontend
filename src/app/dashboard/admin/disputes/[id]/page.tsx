'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Button, Card, Textarea } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { Spinner } from '@/components/spinner';
import { useAuth } from '@/hooks/auth-context';
import {
  addDisputeComment,
  getDispute,
  markDisputeReview,
  resolveDispute,
  type DisputeDetail,
} from '@/lib/api/disputes';

export default function AdminDisputeDetailPage() {
  return (
    <ProtectedRoute>
      <AdminDisputeDetailContent />
    </ProtectedRoute>
  );
}

function AdminDisputeDetailContent() {
  const { token, user } = useAuth();
  const params = useParams<{ id: string }>();
  const disputeId = params.id;
  const [detail, setDetail] = useState<DisputeDetail | null>(null);
  const [resolution, setResolution] = useState('');
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    const row = await getDispute(token, disputeId);
    setDetail(row);
    if (!resolution && row.resolution) setResolution(row.resolution);
  }, [disputeId, resolution, token]);

  useEffect(() => {
    if (user?.role !== 'ADMIN' || !token) return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load, token, user?.role]);

  const postInternal = async () => {
    if (!token || !comment.trim()) return;
    await addDisputeComment(token, disputeId, { body: comment.trim(), internal: true });
    setComment('');
    await load();
    setMessage('Internal note added.');
  };

  const resolve = async (status: 'RESOLVED' | 'REFUNDED' | 'REJECTED', processEscrowRefund?: boolean) => {
    if (!token) return;
    setError('');
    setMessage('');
    try {
      await resolveDispute(token, disputeId, {
        status,
        resolution: resolution.trim() || (status === 'REFUNDED' ? 'Escrow refunded to client' : 'Closed by admin'),
        processEscrowRefund,
      });
      setMessage(status === 'REFUNDED' ? 'Dispute refunded; escrow returned to client wallet.' : 'Dispute updated.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Action failed');
    }
  };

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  if (!detail) {
    return <Spinner size="md" label="Loading dispute…" />;
  }

  const closed = ['RESOLVED', 'REFUNDED', 'REJECTED'].includes(detail.status);

  return (
    <div className="space-y-4">
      <Link href="/dashboard/admin/disputes" className="text-sm text-tropical-jade-700 underline">
        ← Dispute center
      </Link>
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">{detail.title}</h1>
        <p className="text-sm text-slate-600">
          {detail.category} · {detail.status} · Project:{' '}
          <Link href={`/dashboard/admin/projects/${detail.project.id}`} className="underline">
            {detail.project.title}
          </Link>
        </p>
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}

      <Card className="space-y-3 text-sm">
        <p className="text-slate-700">{detail.description}</p>
        <p className="text-xs text-slate-500">
          Opened by {detail.openedBy.email} · {new Date(detail.createdAt).toLocaleString()}
        </p>
      </Card>

      <Card>
        <h2 className="font-semibold text-slate-900">Timeline</h2>
        <ul className="mt-3 max-h-64 space-y-3 overflow-y-auto border-l-2 border-slate-200 pl-3 text-sm">
          {detail.comments.map((c) => (
            <li key={c.id}>
              <p className="text-xs text-slate-500">
                {c.author.email} ({c.author.role}) · {new Date(c.createdAt).toLocaleString()}
                {c.internal ? ' · internal' : ''}
              </p>
              <p className="text-slate-700">{c.body}</p>
            </li>
          ))}
        </ul>
      </Card>

      {detail.evidence.length > 0 ? (
        <Card>
          <h2 className="font-semibold text-slate-900">Evidence</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {detail.evidence.map((e) => (
              <li key={e.id}>
                <a href={e.fileAsset.url} target="_blank" rel="noreferrer" className="underline">
                  {e.fileAsset.originalName}
                </a>
              </li>
            ))}
          </ul>
        </Card>
      ) : null}

      {!closed ? (
        <Card className="space-y-3">
          <h2 className="font-semibold text-slate-900">Admin actions</h2>
          <Textarea
            placeholder="Resolution notes (visible to parties)"
            value={resolution}
            onChange={(e) => setResolution(e.target.value)}
          />
          <Textarea
            placeholder="Internal note (admin only)"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
          />
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => void markDisputeReview(token!, disputeId).then(load)}>
              Mark under review
            </Button>
            <Button type="button" onClick={() => void postInternal()}>
              Save internal note
            </Button>
            <Button type="button" onClick={() => void resolve('RESOLVED')}>
              Resolve
            </Button>
            <Button type="button" variant="secondary" onClick={() => void resolve('REFUNDED', true)}>
              Refund escrow
            </Button>
            <Button type="button" variant="secondary" onClick={() => void resolve('REJECTED')}>
              Reject
            </Button>
          </div>
        </Card>
      ) : detail.resolution ? (
        <Card>
          <p className="text-sm text-slate-700">
            <span className="font-medium">Resolution:</span> {detail.resolution}
          </p>
        </Card>
      ) : null}
    </div>
  );
}
