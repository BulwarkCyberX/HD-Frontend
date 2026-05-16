'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { listEmailTemplates, type EmailTemplateSummary } from '@/lib/api/admin';

export default function AdminEmailsPage() {
  const { token } = useAuth();
  const [templates, setTemplates] = useState<EmailTemplateSummary[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) return;
    void listEmailTemplates(token)
      .then(setTemplates)
      .catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [token]);

  const byCategory = templates.reduce<Record<string, EmailTemplateSummary[]>>((acc, t) => {
    const c = t.category || 'general';
    acc[c] = acc[c] ?? [];
    acc[c].push(t);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">Email templates</h2>
        <p className="mt-1 text-sm text-slate-600">
          These templates power all transactional mail. Use placeholders like{' '}
          <code className="rounded bg-slate-100 px-1">{'{{firstName}}'}</code> in subject and body.
        </p>
      </div>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {Object.entries(byCategory).map(([category, rows]) => (
        <section key={category}>
          <h3 className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">{category}</h3>
          <div className="space-y-2">
            {rows.map((t) => (
              <Link key={t.key} href={`/dashboard/admin/emails/${encodeURIComponent(t.key)}`}>
                <Card className="transition hover:border-tropical-jade-300">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-medium text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.key}</p>
                      {t.description ? <p className="mt-1 text-sm text-slate-600">{t.description}</p> : null}
                    </div>
                    <div className="text-right text-xs text-slate-500">
                      <p>{t.subject}</p>
                      <p className="mt-1">Vars: {t.variables.join(', ') || '—'}</p>
                    </div>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
