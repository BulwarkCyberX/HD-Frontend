'use client';

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import {
  addOrganizationMember,
  getOrganization,
  linkOrganizationProject,
  listLinkableProjects,
  unlinkOrganizationProject,
  type LinkableProject,
  type OrganizationDetail,
} from '@/lib/api/organizations';
import { OrgSsoSettings } from '@/components/org-sso-settings';

export default function OrganizationDetailPage() {
  return (
    <ProtectedRoute>
      <OrgDetailContent />
    </ProtectedRoute>
  );
}

function OrgDetailContent() {
  const { token, user } = useAuth();
  const params = useParams<{ id: string }>();
  const [org, setOrg] = useState<OrganizationDetail | null>(null);
  const [linkable, setLinkable] = useState<LinkableProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'MEMBER' | 'MANAGER' | 'ADMIN'>('MEMBER');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    const [detail, projects] = await Promise.all([
      getOrganization(token, params.id),
      listLinkableProjects(token, params.id),
    ]);
    setOrg(detail);
    setLinkable(projects);
    if (projects[0]) setSelectedProjectId((prev) => prev || projects[0].id);
  }, [params.id, token]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load]);

  const invite = async () => {
    if (!token || !email.trim()) return;
    await addOrganizationMember(token, params.id, { email: email.trim(), role });
    setEmail('');
    setMessage('Member invited.');
    await load();
  };

  const linkProject = async () => {
    if (!token || !selectedProjectId) return;
    setError('');
    try {
      await linkOrganizationProject(token, params.id, selectedProjectId);
      setMessage('Project linked.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Link failed');
    }
  };

  const unlinkProject = async (projectId: string) => {
    if (!token) return;
    setError('');
    try {
      await unlinkOrganizationProject(token, params.id, projectId);
      setMessage('Project unlinked.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Unlink failed');
    }
  };

  if (!org) return <p className="text-sm text-slate-600">Loading…</p>;

  const myRole = org.members.find((m) => m.user.id === user?.id)?.role;
  const canManageSso = myRole === 'OWNER';

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <Link href="/dashboard/organization" className="text-sm text-tropical-jade-700 underline">
        ← Organizations
      </Link>
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">{org.name}</h1>
        <p className="text-sm text-slate-500">{org.slug}</p>
      </header>

      <Card>
        <h2 className="font-semibold text-slate-900">Members</h2>
        <ul className="mt-2 space-y-1 text-sm text-slate-600">
          {org.members.map((m) => (
            <li key={m.id}>
              {m.user.email} · {m.role}
            </li>
          ))}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Input placeholder="user@email.com" value={email} onChange={(e) => setEmail(e.target.value)} />
          <select
            className="rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
            value={role}
            onChange={(e) => setRole(e.target.value as typeof role)}
          >
            <option value="MEMBER">Member</option>
            <option value="MANAGER">Manager</option>
            <option value="ADMIN">Admin</option>
          </select>
          <Button type="button" variant="secondary" onClick={() => void invite()}>
            Add member
          </Button>
        </div>
      </Card>

      {token ? (
        <OrgSsoSettings token={token} orgId={org.id} orgSlug={org.slug} canManage={canManageSso} />
      ) : null}

      <Card>
        <h2 className="font-semibold text-slate-900">Linked projects</h2>
        {org.projects.length === 0 ? (
          <p className="mt-2 text-sm text-slate-600">No projects linked to this org yet.</p>
        ) : (
          <ul className="mt-2 space-y-2 text-sm">
            {org.projects.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-2">
                <span>
                  <Link href={`/dashboard/projects/${p.id}`} className="text-tropical-jade-700 underline">
                    {p.title}
                  </Link>
                  {' '}
                  · {p.status} · ₹{p.budgetAmount}
                </span>
                <Button type="button" variant="secondary" onClick={() => void unlinkProject(p.id)}>
                  Unlink
                </Button>
              </li>
            ))}
          </ul>
        )}

        {linkable.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-end gap-2 border-t border-slate-200 pt-4">
            <div className="min-w-[200px] flex-1">
              <label className="mb-1 block text-xs font-medium text-slate-600">Link a project you own</label>
              <select
                className="w-full rounded-md border border-slate-300 bg-white px-2 py-2 text-sm text-slate-900"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
              >
                {linkable.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.title} · {p.status}
                  </option>
                ))}
              </select>
            </div>
            <Button type="button" onClick={() => void linkProject()}>
              Link project
            </Button>
          </div>
        ) : (
          <p className="mt-3 text-xs text-slate-500">
            No unlinked projects. Create a project first, then link it here.
          </p>
        )}
      </Card>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}
