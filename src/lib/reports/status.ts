import type { WorkspaceReport } from '@/lib/api/reports';

type ReportBadgeTone = 'default' | 'warning' | 'success';

export function getReportStatusTone(status: WorkspaceReport['status']): ReportBadgeTone {
  if (status === 'VALID') return 'success';
  if (status === 'SUBMITTED' || status === 'UNDER_REVIEW' || status === 'NEED_MORE_INFO') {
    return 'warning';
  }
  return 'default';
}
