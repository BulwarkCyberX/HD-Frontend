'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Input, Textarea } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import {
  getEmailTemplate,
  previewEmailTemplate,
  updateEmailTemplate,
  type EmailTemplateDetail,
} from '@/lib/api/admin';

export default function AdminEmailEditorPage() {
  const { token } = useAuth();
  const params = useParams<{ key: string }>();
  const key = decodeURIComponent(params.key);
  const [tpl, setTpl] = useState<EmailTemplateDetail | null>(null);
  const [previewHtml, setPreviewHtml] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    const row = await getEmailTemplate(token, key);
    setTpl(row);
    const preview = await previewEmailTemplate(token, key);
    setPreviewHtml(preview.html);
  }, [key, token]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load]);

  const save = async () => {
    if (!token || !tpl) return;
    setMessage('');
    setError('');
    try {
      await updateEmailTemplate(token, key, {
        name: tpl.name,
        description: tpl.description,
        subject: tpl.subject,
        title: tpl.title,
        preheader: tpl.preheader ?? '',
        innerHtml: tpl.innerHtml,
        textBody: tpl.textBody,
      });
      setMessage('Template saved. New emails will use this content.');
      const preview = await previewEmailTemplate(token, key);
      setPreviewHtml(preview.html);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  if (!tpl) {
    return <p className="text-sm text-slate-600">Loading template…</p>;
  }

  return (
    <div className="space-y-4">
      <Link href="/dashboard/admin/emails" className="text-sm text-tropical-jade-700 underline">
        ← All templates
      </Link>
      <div>
        <h2 className="text-lg font-semibold text-slate-900">{tpl.name}</h2>
        <p className="text-xs text-slate-500">{tpl.key}</p>
        <p className="mt-1 text-sm text-slate-600">Click a variable to insert into the HTML body:</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {tpl.variables.map((v) => (
            <button
              key={v}
              type="button"
              className="rounded-md bg-slate-100 px-2 py-1 text-xs font-mono text-slate-700 hover:bg-slate-200"
              onClick={() =>
                setTpl({ ...tpl, innerHtml: `${tpl.innerHtml}{{${v}}}` })
              }
            >
              {`{{${v}}}`}
            </button>
          ))}
        </div>
      </div>

      <Card className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-slate-700">Subject</label>
          <Input value={tpl.subject} onChange={(e) => setTpl({ ...tpl, subject: e.target.value })} />
          <label className="block text-sm font-medium text-slate-700">Title (HTML document)</label>
          <Input value={tpl.title} onChange={(e) => setTpl({ ...tpl, title: e.target.value })} />
          <label className="block text-sm font-medium text-slate-700">Preheader</label>
          <Input
            value={tpl.preheader ?? ''}
            onChange={(e) => setTpl({ ...tpl, preheader: e.target.value })}
          />
          <label className="block text-sm font-medium text-slate-700">HTML body (inner)</label>
          <Textarea
            className="min-h-[220px] font-mono text-xs"
            value={tpl.innerHtml}
            onChange={(e) => setTpl({ ...tpl, innerHtml: e.target.value })}
          />
          <label className="block text-sm font-medium text-slate-700">Plain text</label>
          <Textarea
            className="min-h-[120px] font-mono text-xs"
            value={tpl.textBody}
            onChange={(e) => setTpl({ ...tpl, textBody: e.target.value })}
          />
          <Button type="button" onClick={() => void save()}>
            Save template
          </Button>
        </div>
        <div>
          <p className="mb-2 text-sm font-medium text-slate-700">Live preview (sample data)</p>
          <div
            className="max-h-[600px] overflow-auto rounded border border-slate-200 bg-white"
            dangerouslySetInnerHTML={{ __html: previewHtml }}
          />
        </div>
      </Card>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
