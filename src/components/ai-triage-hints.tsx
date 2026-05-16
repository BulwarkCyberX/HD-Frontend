'use client';

import { Badge } from '@hackersdeal/ui';
import type { ReportAiTriageHints } from '@/lib/api/reports';

export function AiTriageHints({ hints }: { hints: ReportAiTriageHints | null | undefined }) {
  if (!hints) {
    return <p className="text-xs text-slate-500">AI triage pending or unavailable.</p>;
  }

  return (
    <div className="rounded-md border border-violet-200 bg-violet-50 p-3 text-xs text-slate-700 space-y-2">
      <p className="font-semibold text-violet-900">AI triage assist (suggestions only)</p>
      <p>
        Suggested severity:{' '}
        {hints.suggestedSeverity ? (
          <Badge tone={hints.severityMatch ? 'success' : 'warning'}>{hints.suggestedSeverity}</Badge>
        ) : (
          '—'
        )}{' '}
        · Submitted: {hints.submittedSeverity}
        {!hints.severityMatch && hints.suggestedSeverity ? (
          <span className="text-amber-700"> — mismatch</span>
        ) : null}
      </p>
      <p>{hints.rationale}</p>
      <p>
        Completeness: {hints.completeness}
        {hints.missingFields.length > 0 ? ` · Missing: ${hints.missingFields.join(', ')}` : ''}
      </p>
      {hints.duplicate?.likelyDuplicate ? (
        <p className="text-amber-800">
          Possible duplicate ({Math.round(hints.duplicate.score * 100)}%): {hints.duplicate.rationale}
        </p>
      ) : null}
      <p className="text-slate-500">Generated {new Date(hints.generatedAt).toLocaleString()}</p>
    </div>
  );
}
