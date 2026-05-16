'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Input } from '@hackersdeal/ui';
import { fetchFeaturedProviders, fetchPublicProjects, type PublicProject } from '@/lib/api/public';

export default function MarketplacePage() {
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [featured, setFeatured] = useState<unknown[]>([]);
  const [q, setQ] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (query?: string) => {
    setLoading(true);
    try {
      const [p, f] = await Promise.all([
        fetchPublicProjects(query ? { q: query } : undefined),
        fetchFeaturedProviders(),
      ]);
      setProjects(p);
      setFeatured(f);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, []);

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Security marketplace</h1>
        <p className="max-w-2xl text-slate-600">
          Discover public penetration testing and security engagements. No login required to browse.
        </p>
        <form
          className="flex max-w-xl gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load(q.trim() || undefined);
          }}
        >
          <Input placeholder="Search projects…" value={q} onChange={(e) => setQ(e.target.value)} />
          <Button type="submit">Search</Button>
        </form>
      </section>

      {featured.length > 0 ? (
        <section>
          <h2 className="text-lg font-semibold text-slate-900">Featured providers</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {featured.map((row) => {
              const p = row as {
                id: string;
                firstName: string | null;
                lastName: string | null;
                providerProfile: { reputationScore: number; completedProjects: number };
              };
              const name = [p.firstName, p.lastName].filter(Boolean).join(' ') || 'Provider';
              return (
                <Link
                  key={p.id}
                  href={`/providers/${p.id}`}
                  className="rounded-lg border border-tropical-jade-200 bg-white p-4 hover:border-tropical-aqua-400"
                >
                  <p className="font-medium text-slate-900">{name}</p>
                  <p className="text-xs text-slate-600">
                    Score {p.providerProfile.reputationScore.toFixed(0)} · {p.providerProfile.completedProjects}{' '}
                    projects
                  </p>
                </Link>
              );
            })}
          </div>
        </section>
      ) : null}

      <section>
        <h2 className="text-lg font-semibold text-slate-900">Open projects</h2>
        {loading ? <p className="mt-2 text-sm text-slate-600">Loading…</p> : null}
        <div className="mt-4 space-y-3">
          {projects.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-tropical-jade-300"
            >
              <p className="font-medium text-slate-900">{project.title}</p>
              <p className="mt-1 line-clamp-2 text-sm text-slate-600">{project.description}</p>
              <p className="mt-2 text-xs text-slate-500">
                ₹{project.budgetAmount} · {project.budgetType} · {project.status}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
