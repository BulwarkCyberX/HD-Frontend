'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@hackersdeal/ui';
import {
  approveTimeEntry,
  billTimeEntry,
  createTimeEntry,
  getHourlyEngagement,
  getHourlySummary,
  rejectTimeEntry,
  setHourlyEngagementStatus,
  submitTimeEntry,
  updateTimeEntry,
  upsertHourlyEngagement,
  type HourlyEngagement,
  type HourlySummary,
  type TimeEntryRow,
} from '@/lib/api/hourly';

type HourlyPanelProps = {
  token: string;
  projectId: string;
  isProjectOwner: boolean;
  isSelectedProvider: boolean;
  paymentInEscrow: boolean;
  defaultHourlyRate?: number;
  onRefresh: () => void;
  setActionMessage: (v: string) => void;
  setErrorMessage: (v: string) => void;
};

export function HourlyPanel({
  token,
  projectId,
  isProjectOwner,
  isSelectedProvider,
  paymentInEscrow,
  defaultHourlyRate,
  onRefresh,
  setActionMessage,
  setErrorMessage,
}: HourlyPanelProps) {
  const [engagement, setEngagement] = useState<HourlyEngagement | null>(null);
  const [summary, setSummary] = useState<HourlySummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [rate, setRate] = useState(defaultHourlyRate ?? 1500);
  const [weeklyCap, setWeeklyCap] = useState(40);
  const [workDate, setWorkDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [hours, setHours] = useState(2);
  const [description, setDescription] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');
    try {
      const row = await getHourlyEngagement(token, projectId);
      setEngagement(row);
      setRate(Number(row.hourlyRate));
      setWeeklyCap(row.weeklyCapHours);
      try {
        setSummary(await getHourlySummary(token, projectId));
      } catch {
        setSummary(null);
      }
    } catch (e) {
      setEngagement(null);
      setSummary(null);
      if (e instanceof Error && !e.message.toLowerCase().includes('not configured')) {
        setErrorMessage(e.message);
      }
    } finally {
      setLoading(false);
    }
  }, [token, projectId, setErrorMessage]);

  useEffect(() => {
    void load();
  }, [load]);

  const run = async (id: string, fn: () => Promise<unknown>) => {
    setBusyId(id);
    setErrorMessage('');
    try {
      await fn();
      await load();
      onRefresh();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Action failed');
    } finally {
      setBusyId(null);
    }
  };

  const saveEngagement = async () => {
    setBusyId('engagement');
    try {
      await upsertHourlyEngagement(token, projectId, { hourlyRate: rate, weeklyCapHours: weeklyCap });
      setActionMessage('Hourly engagement saved.');
      await load();
    } catch (e) {
      setErrorMessage(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusyId(null);
    }
  };

  const logTime = async () => {
    if (!engagement) return;
    await run('new', async () => {
      await createTimeEntry(token, { engagementId: engagement.id, workDate, hours, description });
      setDescription('');
      setActionMessage('Time entry created (draft).');
    });
  };

  if (loading) {
    return <p className="text-sm text-slate-500">Loading hourly engagement…</p>;
  }

  return (
    <div className="space-y-4">
      {isProjectOwner && !engagement ? (
        <Card className="space-y-3 text-sm">
          <p className="font-medium text-slate-900">Configure hourly billing</p>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="block">
              <span className="text-slate-600">Hourly rate (INR)</span>
              <Input className="mt-1" type="number" value={rate} onChange={(e) => setRate(Number(e.target.value))} />
            </label>
            <label className="block">
              <span className="text-slate-600">Weekly cap (hours)</span>
              <Input
                className="mt-1"
                type="number"
                value={weeklyCap}
                onChange={(e) => setWeeklyCap(Number(e.target.value))}
              />
            </label>
          </div>
          <Button type="button" disabled={busyId === 'engagement'} onClick={() => void saveEngagement()}>
            Save engagement
          </Button>
        </Card>
      ) : null}

      {engagement ? (
        <>
          <p className="text-sm text-slate-600">
            Rate: ₹{Number(engagement.hourlyRate).toLocaleString()}/hr · Weekly cap: {engagement.weeklyCapHours}h ·{' '}
            {engagement.status}
          </p>
          {summary ? (
            <p className="text-xs text-slate-500">
              Billed: {summary.billedHours}h (₹{summary.billedAmount.toLocaleString()}) · Pending approval/billing: ₹
              {summary.pendingAmount.toLocaleString()}
            </p>
          ) : null}
          {isProjectOwner ? (
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="secondary"
                disabled={busyId === 'status'}
                onClick={() =>
                  void run('status', () => setHourlyEngagementStatus(token, projectId, 'PAUSED'))
                }
              >
                Pause
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busyId === 'status'}
                onClick={() =>
                  void run('status', () => setHourlyEngagementStatus(token, projectId, 'ACTIVE'))
                }
              >
                Resume
              </Button>
              <Button
                type="button"
                variant="secondary"
                disabled={busyId === 'status'}
                onClick={() =>
                  void run('status', () => setHourlyEngagementStatus(token, projectId, 'CLOSED'))
                }
              >
                Close engagement
              </Button>
            </div>
          ) : null}

          {isSelectedProvider && engagement.status === 'ACTIVE' ? (
            <Card className="space-y-2 text-sm">
              <p className="font-medium text-slate-900">Log time</p>
              <div className="grid gap-2 sm:grid-cols-3">
                <Input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
                <Input type="number" step="0.25" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
                <Input
                  placeholder="What you worked on"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
              <Button type="button" disabled={busyId === 'new' || !description.trim()} onClick={() => void logTime()}>
                Add draft entry
              </Button>
            </Card>
          ) : null}

          <ul className="space-y-2">
            {engagement.timeEntries.length === 0 ? (
              <li className="text-sm text-slate-500">No time entries yet.</li>
            ) : (
              engagement.timeEntries.map((entry) => (
                <TimeEntryCard
                  key={entry.id}
                  token={token}
                  entry={entry}
                  hourlyRate={Number(engagement.hourlyRate)}
                  isProjectOwner={isProjectOwner}
                  isSelectedProvider={isSelectedProvider}
                  paymentInEscrow={paymentInEscrow}
                  busyId={busyId}
                  onRun={run}
                />
              ))
            )}
          </ul>
        </>
      ) : (
        <p className="text-sm text-slate-500">
          {isSelectedProvider
            ? 'Waiting for client to configure hourly engagement.'
            : 'Accept a provider bid or configure hourly rate to start time tracking.'}
        </p>
      )}
    </div>
  );
}

function TimeEntryCard({
  token,
  entry,
  hourlyRate,
  isProjectOwner,
  isSelectedProvider,
  paymentInEscrow,
  busyId,
  onRun,
}: {
  token: string;
  entry: TimeEntryRow;
  hourlyRate: number;
  isProjectOwner: boolean;
  isSelectedProvider: boolean;
  paymentInEscrow: boolean;
  busyId: string | null;
  onRun: (id: string, fn: () => Promise<unknown>) => Promise<void>;
}) {
  const [editing, setEditing] = useState(false);
  const [workDate, setWorkDate] = useState(String(entry.workDate).slice(0, 10));
  const [hours, setHours] = useState(Number(entry.hours));
  const [description, setDescription] = useState(entry.description);
  const amount = Number(entry.hours) * hourlyRate;
  return (
    <Card className="flex flex-wrap items-center justify-between gap-2 text-sm">
      <div className="min-w-0 flex-1">
        {editing ? (
          <div className="space-y-2">
            <Input type="date" value={workDate} onChange={(e) => setWorkDate(e.target.value)} />
            <Input type="number" step="0.25" value={hours} onChange={(e) => setHours(Number(e.target.value))} />
            <Input value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>
        ) : (
          <>
            <p className="font-medium text-slate-900">
              {String(entry.workDate).slice(0, 10)} · {Number(entry.hours)}h · {entry.status}
            </p>
            <p className="text-slate-600">{entry.description}</p>
            {entry.rejectedReason ? <p className="text-rose-600">{entry.rejectedReason}</p> : null}
            <p className="text-xs text-slate-500">≈ ₹{amount.toLocaleString()}</p>
          </>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {isSelectedProvider && entry.status === 'DRAFT' ? (
          <>
            {editing ? (
              <Button
                type="button"
                disabled={busyId === entry.id}
                onClick={() =>
                  void onRun(entry.id, async () => {
                    await updateTimeEntry(token, entry.id, { workDate, hours, description });
                    setEditing(false);
                  })
                }
              >
                Save
              </Button>
            ) : (
              <Button type="button" variant="secondary" onClick={() => setEditing(true)}>
                Edit
              </Button>
            )}
            <Button
              type="button"
              disabled={busyId === entry.id}
              onClick={() => void onRun(entry.id, () => submitTimeEntry(token, entry.id))}
            >
              Submit
            </Button>
          </>
        ) : null}
        {isProjectOwner && entry.status === 'SUBMITTED' ? (
          <>
            <Button
              type="button"
              disabled={busyId === entry.id}
              onClick={() => void onRun(entry.id, () => approveTimeEntry(token, entry.id))}
            >
              Approve
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busyId === entry.id}
              onClick={() => void onRun(entry.id, () => rejectTimeEntry(token, entry.id))}
            >
              Reject
            </Button>
          </>
        ) : null}
        {isProjectOwner && entry.status === 'APPROVED' && paymentInEscrow ? (
          <Button
            type="button"
            disabled={busyId === entry.id}
            onClick={() => void onRun(entry.id, () => billTimeEntry(token, entry.id))}
          >
            Bill & pay
          </Button>
        ) : null}
      </div>
    </Card>
  );
}
