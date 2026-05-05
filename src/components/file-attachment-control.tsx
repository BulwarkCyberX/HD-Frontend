'use client';

import { useRef, useState } from 'react';
import { Button } from '@hackersdeal/ui';
import { uploadFile } from '@/lib/api/files';

type Target =
  | { projectId: string }
  | { workspaceReportId: string }
  | { bugReportId: string }
  | { messageId: string }
  | { vdpSubmissionId: string };

type Props = {
  token: string;
  target: Target;
  onUploaded?: (meta: { id: string; originalName: string }) => void;
  label?: string;
};

export function FileAttachmentControl({ token, target, onUploaded, label = 'Attach file' }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const onPick = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const record = await uploadFile(token, file, target);
      onUploaded?.({ id: record.id, originalName: record.originalName });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1">
      <input ref={inputRef} type="file" className="hidden" onChange={onPick} />
      <Button type="button" variant="secondary" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'Uploading…' : label}
      </Button>
      {error ? <p className="text-xs text-rose-600">{error}</p> : null}
    </div>
  );
}
