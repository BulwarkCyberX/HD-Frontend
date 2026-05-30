'use client';

import { useState } from 'react';
import { Button, Input, Textarea } from '@hackersdeal/ui';
import { openDispute } from '@/lib/api/disputes';

const CATEGORIES = [
  'PAYMENT',
  'MILESTONE',
  'REPORT_QUALITY',
  'NON_DELIVERY',
  'FRAUD',
] as const;

type Props = {
  token: string;
  projectId: string;
  onOpened?: () => void;
};

export function OpenDisputeDialog({ token, projectId, onOpened }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>('PAYMENT');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async () => {
    setBusy(true);
    setError('');
    try {
      await openDispute(token, { projectId, category, title, description });
      setOpen(false);
      setTitle('');
      setDescription('');
      onOpened?.();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to open dispute');
    } finally {
      setBusy(false);
    }
  };

  if (!open) {
    return (
      <Button type="button" variant="secondary" onClick={() => setOpen(true)}>
        Open dispute
      </Button>
    );
  }

  return (
    <section className="rounded-md border border-amber-200 bg-amber-50/80 p-4 space-y-3">
      <p className="text-sm font-semibold text-slate-900">Open a dispute</p>
      <select
        className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
        value={category}
        onChange={(e) => setCategory(e.target.value as (typeof CATEGORIES)[number])}
      >
        {CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <Input placeholder="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <Textarea
        placeholder="Describe the issue and desired outcome"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <div className="flex gap-2">
        <Button type="button" disabled={busy || !title.trim()} onClick={() => void submit()}>
          {busy ? 'Submitting…' : 'Submit dispute'}
        </Button>
        <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
          Cancel
        </Button>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}
