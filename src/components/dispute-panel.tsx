'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input, Textarea } from '@hackersdeal/ui';
import {
  addDisputeComment,
  addDisputeEvidence,
  getDispute,
  listProjectDisputes,
  type DisputeDetail,
  type DisputeItem,
} from '@/lib/api/disputes';
import { uploadFile } from '@/lib/api/files';

type Props = {
  token: string;
  projectId: string;
  isAdmin?: boolean;
};

export function DisputePanel({ token, projectId, isAdmin }: Props) {
  const [disputes, setDisputes] = useState<DisputeItem[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [detail, setDetail] = useState<DisputeDetail | null>(null);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const loadList = useCallback(async () => {
    const rows = await listProjectDisputes(token, projectId);
    setDisputes(rows);
    if (!activeId && rows[0]) setActiveId(rows[0].id);
  }, [activeId, projectId, token]);

  const loadDetail = useCallback(async () => {
    if (!activeId) {
      setDetail(null);
      return;
    }
    setDetail(await getDispute(token, activeId));
  }, [activeId, token]);

  useEffect(() => {
    void loadList().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load disputes'));
  }, [loadList]);

  useEffect(() => {
    void loadDetail().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load dispute'));
  }, [loadDetail]);

  const postComment = async () => {
    if (!activeId || !comment.trim()) return;
    setBusy(true);
    setError('');
    try {
      await addDisputeComment(token, activeId, { body: comment.trim() });
      setComment('');
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Comment failed');
    } finally {
      setBusy(false);
    }
  };

  const attachFile = async (file: File) => {
    if (!activeId) return;
    setBusy(true);
    setError('');
    try {
      const uploaded = await uploadFile(token, file, { projectId });
      await addDisputeEvidence(token, activeId, { fileAssetId: uploaded.id });
      await loadDetail();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  if (disputes.length === 0) {
    return (
      <p className="text-sm text-slate-500">No disputes on this project yet.</p>
    );
  }

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-semibold text-slate-900">Disputes</h3>
        {isAdmin ? (
          <Link href="/dashboard/admin/disputes" className="text-xs text-tropical-jade-700 underline">
            Admin center
          </Link>
        ) : null}
      </div>

      <div className="flex flex-wrap gap-2">
        {disputes.map((d) => (
          <button
            key={d.id}
            type="button"
            onClick={() => setActiveId(d.id)}
            className={`rounded-md px-2 py-1 text-xs ${
              activeId === d.id ? 'bg-tropical-jade-100 text-tropical-jade-900' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {d.title} · {d.status}
          </button>
        ))}
      </div>

      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {detail ? (
        <div className="space-y-3 text-sm">
          <p className="text-slate-600">{detail.description}</p>
          {detail.resolution ? (
            <p className="rounded-md bg-slate-50 p-2 text-slate-700">
              <span className="font-medium">Resolution:</span> {detail.resolution}
            </p>
          ) : null}

          <div>
            <p className="mb-1 font-medium text-slate-900">Timeline</p>
            <ul className="max-h-48 space-y-2 overflow-y-auto border-l-2 border-slate-200 pl-3">
              <li className="text-xs text-slate-500">
                Opened {new Date(detail.createdAt).toLocaleString()} by {detail.openedBy.email}
              </li>
              {detail.comments.map((c) => (
                <li key={c.id}>
                  <p className="text-xs text-slate-500">
                    {c.author.email} · {new Date(c.createdAt).toLocaleString()}
                    {c.internal ? ' (internal)' : ''}
                  </p>
                  <p className="text-slate-700">{c.body}</p>
                </li>
              ))}
            </ul>
          </div>

          {detail.evidence.length > 0 ? (
            <div>
              <p className="mb-1 font-medium text-slate-900">Evidence</p>
              <ul className="space-y-1">
                {detail.evidence.map((e) => (
                  <li key={e.id}>
                    <a
                      href={e.fileAsset.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-tropical-jade-700 underline"
                    >
                      {e.fileAsset.originalName}
                    </a>
                    {e.note ? <span className="text-slate-500"> — {e.note}</span> : null}
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          {detail.status === 'OPEN' || detail.status === 'UNDER_REVIEW' ? (
            <div className="space-y-2 border-t border-slate-200 pt-3">
              <Textarea
                placeholder="Add a comment…"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="min-h-[72px]"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" disabled={busy} onClick={() => void postComment()}>
                  Post comment
                </Button>
                <label className="inline-flex cursor-pointer items-center">
                  <Input
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void attachFile(f);
                      e.target.value = '';
                    }}
                  />
                  <span className="rounded-md border border-slate-300 px-3 py-1.5 text-sm hover:bg-slate-50">
                    Attach evidence
                  </span>
                </label>
              </div>
            </div>
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-slate-500">Loading dispute…</p>
      )}
    </Card>
  );
}
