'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Input, Textarea, Badge } from '@hackersdeal/ui';
import { Spinner } from '@/components/spinner';
import { useAuth } from '@/hooks/auth-context';
import {
  acceptBidAsAdmin,
  getAdminProject,
  getProjectFinancials,
  updateAdminProject,
  type ProjectFinancials,
} from '@/lib/api/admin';

type AdminProjectDetail = {
  id: string;
  title: string;
  description: string;
  inScope: string[];
  outOfScope: string[];
  testingWindow: string;
  budgetType: string;
  budgetAmount: number;
  timeline: string;
  visibility: string;
  status: string;
  selectedProviderId: string | null;
  client: { email: string };
  payment: { id: string; status: string; amount: number; currency: string } | null;
  bids: {
    id: string;
    proposal: string;
    price: number;
    timeline: string;
    status: string;
    provider: { id: string; email: string };
  }[];
  milestones: { id: string; title: string; status: string; amount: unknown }[];
  disputes: { id: string; title: string; status: string; category: string }[];
};

export default function AdminProjectDetailPage() {
  const { token } = useAuth();
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<AdminProjectDetail | null>(null);
  const [financials, setFinancials] = useState<ProjectFinancials | null>(null);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    const [p, f] = await Promise.all([
      getAdminProject(token, params.id) as Promise<AdminProjectDetail>,
      getProjectFinancials(token, params.id),
    ]);
    setProject(p);
    setFinancials(f);
  }, [params.id, token]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load]);

  const save = async () => {
    if (!token || !project) return;
    try {
      await updateAdminProject(token, project.id, {
        title: project.title,
        description: project.description,
        status: project.status,
        visibility: project.visibility,
        budgetType: project.budgetType,
        budgetAmount: project.budgetAmount,
        timeline: project.timeline,
        testingWindow: project.testingWindow,
        inScope: project.inScope,
        outOfScope: project.outOfScope,
        selectedProviderId: project.selectedProviderId,
      });
      setMessage('Project updated.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    }
  };

  const assignBid = async (bidId: string) => {
    if (!token || !project) return;
    try {
      await acceptBidAsAdmin(token, project.id, bidId);
      setMessage('Bid accepted and provider assigned.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to accept bid');
    }
  };

  if (!project) return <Spinner size="md" label="Loading…" />;

  return (
    <section className="space-y-4">
      <Link href="/dashboard/admin/projects" className="text-sm text-tropical-jade-700 underline">
        ← All projects
      </Link>

      <Card className="space-y-3">
        <Input value={project.title} onChange={(e) => setProject({ ...project, title: e.target.value })} />
        <Textarea
          className="min-h-[100px]"
          value={project.description}
          onChange={(e) => setProject({ ...project, description: e.target.value })}
        />
        <div className="grid gap-3 sm:grid-cols-2">
          <Field label="Status">
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
              value={project.status}
              onChange={(e) => setProject({ ...project, status: e.target.value })}
            >
              {['DRAFT', 'ACTIVE', 'IN_PROGRESS', 'COMPLETED'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Visibility">
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
              value={project.visibility}
              onChange={(e) => setProject({ ...project, visibility: e.target.value })}
            >
              {['PUBLIC', 'PRIVATE', 'INVITE_ONLY'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Budget (₹)">
            <Input
              type="number"
              value={project.budgetAmount}
              onChange={(e) => setProject({ ...project, budgetAmount: Number(e.target.value) })}
            />
          </Field>
          <Field label="Budget type">
            <select
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
              value={project.budgetType}
              onChange={(e) => setProject({ ...project, budgetType: e.target.value })}
            >
              {['FIXED', 'HOURLY', 'MILESTONE'].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </Field>
        </div>
        <Textarea
          placeholder="In scope (one per line)"
          value={project.inScope.join('\n')}
          onChange={(e) => setProject({ ...project, inScope: e.target.value.split('\n').filter(Boolean) })}
        />
        <Textarea
          placeholder="Out of scope (one per line)"
          value={project.outOfScope.join('\n')}
          onChange={(e) =>
            setProject({ ...project, outOfScope: e.target.value.split('\n').filter(Boolean) })
          }
        />
        <Button type="button" onClick={() => void save()}>
          Save project settings
        </Button>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Bids — assign provider</h3>
        <ul className="mt-3 space-y-3">
          {project.bids.length === 0 ? (
            <li className="text-sm text-slate-600">No bids yet.</li>
          ) : (
            project.bids.map((b) => (
              <li key={b.id} className="rounded-md border border-slate-200 p-3 text-sm">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="font-medium text-slate-900">{b.provider.email}</p>
                    <p className="text-slate-600">
                      ₹{b.price} · {b.timeline} · <Badge tone={b.status === 'ACCEPTED' ? 'success' : 'warning'}>{b.status}</Badge>
                    </p>
                  </div>
                  {b.status === 'PENDING' ? (
                    <Button type="button" variant="secondary" onClick={() => void assignBid(b.id)}>
                      Accept & assign
                    </Button>
                  ) : null}
                </div>
                <p className="mt-2 text-slate-600 line-clamp-3">{b.proposal}</p>
              </li>
            ))
          )}
        </ul>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Financials</h3>
        <p className="mt-1 text-sm text-slate-600">Client: {project.client.email}</p>
        {financials ? (
          <div className="mt-3 space-y-3 text-sm">
            <p>
              Escrow payment:{' '}
              {financials.payment
                ? `${financials.payment.status} · ₹${financials.payment.amount}`
                : 'None'}
            </p>
            {financials.clientWallet ? (
              <p>
                Client wallet escrow: ₹{financials.clientWallet.escrowBalance} · spent ₹
                {financials.clientWallet.totalSpent}
              </p>
            ) : null}
            {financials.checkouts.length > 0 ? (
              <div>
                <p className="font-medium text-slate-800">PSP checkouts</p>
                <ul className="mt-1 space-y-1 text-slate-600">
                  {financials.checkouts.map((c) => (
                    <li key={c.id}>
                      {c.provider} · ₹{c.amount} · {c.status}
                      {c.paidAt ? ` · paid ${new Date(c.paidAt).toLocaleString()}` : ''}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}
            {financials.ledger.length > 0 ? (
              <details>
                <summary className="cursor-pointer font-medium text-slate-800">Ledger entries</summary>
                <ul className="mt-1 max-h-40 overflow-auto space-y-1 text-xs text-slate-600">
                  {financials.ledger.map((l) => (
                    <li key={l.id}>
                      {l.type} · {l.amount} {l.currency} · {l.status}
                    </li>
                  ))}
                </ul>
              </details>
            ) : null}
          </div>
        ) : null}
        <Link
          href={`/dashboard/projects/${project.id}`}
          className="mt-3 inline-block text-sm text-tropical-jade-700 underline"
        >
          Open client workspace view
        </Link>
      </Card>

      {project.disputes.length > 0 ? (
        <Card>
          <h3 className="font-semibold text-slate-900">Disputes</h3>
          <ul className="mt-2 space-y-1 text-sm text-slate-600">
            {project.disputes.map((d) => (
              <li key={d.id}>
                {d.title} · {d.category} · {d.status}
              </li>
            ))}
          </ul>
          <Link href="/dashboard/admin/disputes" className="mt-2 inline-block text-sm underline">
            Open dispute center
          </Link>
        </Card>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <label className="block text-sm text-slate-700">{label}{children}</label>;
}
