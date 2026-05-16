'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import {
  createOrganization,
  listMyOrganizations,
  type OrganizationSummary,
} from '@/lib/api/organizations';

export default function OrganizationPage() {
  return (
    <ProtectedRoute>
      <OrganizationContent />
    </ProtectedRoute>
  );
}

function OrganizationContent() {
  const { token, user } = useAuth();
  const [orgs, setOrgs] = useState<OrganizationSummary[]>([]);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setOrgs(await listMyOrganizations(token));
  }, [token]);

  useEffect(() => {
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Failed to load'));
  }, [load]);

  const create = async () => {
    if (!token || !name.trim() || !slug.trim()) return;
    try {
      await createOrganization(token, { name: name.trim(), slug: slug.trim().toLowerCase() });
      setName('');
      setSlug('');
      setMessage('Organization created.');
      await load();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Create failed');
    }
  };

  if (user?.role !== 'CLIENT') {
    return <p className="text-sm text-slate-600">Organizations are available for client accounts.</p>;
  }

  return (
    <section className="mx-auto max-w-3xl space-y-6">
      <header>
        <h1 className="text-2xl font-semibold text-slate-900">Organizations</h1>
        <p className="mt-1 text-sm text-slate-600">Manage team access and linked security projects.</p>
      </header>

      <Card className="space-y-3">
        <h2 className="font-semibold text-slate-900">Create organization</h2>
        <Input placeholder="Company name" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          placeholder="URL slug (e.g. acme-security)"
          value={slug}
          onChange={(e) => setSlug(e.target.value.replace(/\s+/g, '-'))}
        />
        <Button type="button" onClick={() => void create()}>
          Create
        </Button>
      </Card>

      <div className="space-y-2">
        {orgs.map((o) => (
          <Link key={o.id} href={`/dashboard/organization/${o.id}`}>
            <Card className="transition hover:border-tropical-jade-300">
              <p className="font-medium text-slate-900">{o.name}</p>
              <p className="text-xs text-slate-500">
                {o.slug} · {o._count.members} members · {o._count.projects} projects · role{' '}
                {o.members[0]?.role}
              </p>
            </Card>
          </Link>
        ))}
      </div>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </section>
  );
}
