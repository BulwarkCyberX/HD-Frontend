'use client';

import { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Card, Textarea } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { getReportStatusTone } from '@/lib/reports/status';
import {
  getAllReportsForAdmin,
  triageReport,
  type TriageReportPayload,
  type WorkspaceReport,
} from '@/lib/api/reports';

export default function AdminReportsTriagePage() {
  const { token, user, logout } = useAuth();
  const [reports, setReports] = useState<WorkspaceReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});

  const isAdmin = useMemo(() => user?.role === 'ADMIN', [user]);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setErrorMessage('');
      setActionMessage('');
      try {
        const rows = await getAllReportsForAdmin(token);
        setReports(rows);
        setNotes(Object.fromEntries(rows.map((row) => [row.id, row.triageNotes ?? ''])));
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load triage queue');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [logout, token]);

  const handleTriage = async (
    reportId: string,
    status: TriageReportPayload['status'],
    fallbackMessage: string,
  ) => {
    if (!token) return;
    const triageNotes = (notes[reportId] ?? '').trim();
    if (!triageNotes) {
      setErrorMessage('Please add triage notes before updating status.');
      return;
    }
    setPendingId(reportId);
    setErrorMessage('');
    setActionMessage('');
    try {
      const updated = await triageReport(token, reportId, { status, triageNotes });
      setReports((prev) => prev.map((row) => (row.id === reportId ? updated : row)));
      setActionMessage(fallbackMessage);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to triage report');
    } finally {
      setPendingId(null);
    }
  };

  if (!isAdmin) {
    return (
      <Card>
        <p className="text-sm text-rose-600">Only admin users can access the triage dashboard.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">Report Triage Queue</h1>
        <p className="text-sm text-slate-600">Review provider submissions and set final triage status.</p>
      </div>

      {loading ? <p className="text-sm text-slate-600">Loading reports...</p> : null}
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
      {actionMessage ? <p className="text-sm text-emerald-700">{actionMessage}</p> : null}

      {reports.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">No reports in triage queue yet.</p>
        </Card>
      ) : (
        <div className="space-y-3">
          {reports.map((report) => (
            <Card key={report.id} className="space-y-3">
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                <Badge tone={getReportStatusTone(report.status)}>{report.status}</Badge>
              </div>
              <p className="text-sm text-slate-600">{report.description}</p>
              <p className="text-xs text-slate-500">
                Project: {report.project.title} | Provider: {report.submitter.email} | Severity: {report.severity}
              </p>
              <Textarea
                rows={3}
                placeholder="Triage notes"
                value={notes[report.id] ?? ''}
                onChange={(e) => setNotes((prev) => ({ ...prev, [report.id]: e.target.value }))}
              />
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  disabled={pendingId === report.id}
                  onClick={() => handleTriage(report.id, 'VALID', 'Report marked as VALID.')}
                >
                  Mark VALID
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  disabled={pendingId === report.id}
                  onClick={() => handleTriage(report.id, 'NEED_MORE_INFO', 'Marked as NEED_MORE_INFO.')}
                >
                  Request More Info
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="border border-rose-200 text-rose-700 hover:bg-rose-50"
                  disabled={pendingId === report.id}
                  onClick={() => handleTriage(report.id, 'REJECTED', 'Report marked as REJECTED.')}
                >
                  Mark REJECTED
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
