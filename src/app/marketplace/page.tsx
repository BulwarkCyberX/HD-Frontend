'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import {
  fetchFeaturedProviders,
  fetchPublicProjects,
  type PublicProject,
  type PublicProjectFilters,
} from '@/lib/api/public';
import { createSavedSearch, searchPublicProviders } from '@/lib/api/search';

type Tab = 'projects' | 'providers';

export default function MarketplacePage() {
  const { token, isAuthenticated } = useAuth();
  const [tab, setTab] = useState<Tab>('projects');
  const [projects, setProjects] = useState<PublicProject[]>([]);
  const [providers, setProviders] = useState<
    {
      id: string;
      email: string;
      providerProfile: { rating: number; reputationScore: number; completedProjects: number; skills: string[] };
    }[]
  >([]);
  const [featured, setFeatured] = useState<unknown[]>([]);
  const [q, setQ] = useState('');
  const [budgetType, setBudgetType] = useState('');
  const [sort, setSort] = useState<PublicProjectFilters['sort']>('newest');
  const [loading, setLoading] = useState(true);
  const [saveName, setSaveName] = useState('');
  const [message, setMessage] = useState('');

  const loadProjects = async (query?: string) => {
    const filters: PublicProjectFilters = { sort };
    if (query) filters.q = query;
    if (budgetType) filters.budgetType = budgetType;
    setProjects(await fetchPublicProjects(filters));
  };

  const loadProviders = async (query?: string) => {
    if (!query || query.length < 2) {
      setProviders([]);
      return;
    }
    const rows = await searchPublicProviders(query);
    setProviders(
      rows as {
        id: string;
        email: string;
        providerProfile: {
          rating: number;
          reputationScore: number;
          completedProjects: number;
          skills: string[];
        };
      }[],
    );
  };

  const load = async (query?: string) => {
    setLoading(true);
    try {
      const f = await fetchFeaturedProviders();
      setFeatured(f);
      if (tab === 'projects') await loadProjects(query);
      else await loadProviders(query);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [tab, sort, budgetType]);

  const saveSearch = async () => {
    if (!token || !saveName.trim()) return;
    await createSavedSearch(token, saveName.trim(), { q, budgetType, sort, tab });
    setMessage('Search saved.');
    setSaveName('');
  };

  return (
    <main className="mx-auto max-w-6xl space-y-10 px-4 py-12">
      <section className="space-y-4">
        <h1 className="text-3xl font-semibold text-slate-900">Security marketplace</h1>
        <p className="max-w-2xl text-slate-600">
          Discover public penetration testing and security engagements. No login required to browse.
        </p>
        <div className="flex gap-2">
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${tab === 'projects' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
            onClick={() => setTab('projects')}
          >
            Projects
          </button>
          <button
            type="button"
            className={`rounded-md px-3 py-1.5 text-sm ${tab === 'providers' ? 'bg-slate-900 text-white' : 'bg-slate-100'}`}
            onClick={() => setTab('providers')}
          >
            Providers
          </button>
        </div>
        <form
          className="flex max-w-2xl flex-wrap gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            void load(q.trim() || undefined);
          }}
        >
          <Input
            className="min-w-[200px] flex-1"
            placeholder={tab === 'projects' ? 'Search projects…' : 'Search providers (email)…'}
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          {tab === 'projects' ? (
            <>
              <select
                className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                value={budgetType}
                onChange={(e) => setBudgetType(e.target.value)}
              >
                <option value="">All budgets</option>
                <option value="FIXED">Fixed</option>
                <option value="HOURLY">Hourly</option>
                <option value="MILESTONE">Milestone</option>
              </select>
              <select
                className="rounded-md border border-slate-300 px-2 py-2 text-sm"
                value={sort}
                onChange={(e) => setSort(e.target.value as PublicProjectFilters['sort'])}
              >
                <option value="newest">Newest</option>
                <option value="budget_asc">Budget ↑</option>
                <option value="budget_desc">Budget ↓</option>
              </select>
            </>
          ) : null}
          <Button type="submit">Search</Button>
        </form>
        {isAuthenticated ? (
          <div className="flex max-w-md flex-wrap gap-2">
            <Input placeholder="Save search as…" value={saveName} onChange={(e) => setSaveName(e.target.value)} />
            <Button type="button" variant="secondary" onClick={() => void saveSearch()}>
              Save search
            </Button>
          </div>
        ) : null}
        {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      </section>

      {tab === 'projects' && featured.length > 0 ? (
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
        <h2 className="text-lg font-semibold text-slate-900">
          {tab === 'projects' ? 'Open projects' : 'Matching providers'}
        </h2>
        {loading ? <p className="mt-2 text-sm text-slate-600">Loading…</p> : null}
        {tab === 'projects' ? (
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
        ) : (
          <div className="mt-4 space-y-3">
            {providers.length === 0 ? (
              <Card className="text-sm text-slate-600">Enter at least 2 characters to search providers.</Card>
            ) : (
              providers.map((p) => (
                <Link
                  key={p.id}
                  href={`/providers/${p.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-tropical-jade-300"
                >
                  <p className="font-medium text-slate-900">{p.email}</p>
                  <p className="text-xs text-slate-600">
                    Rating {p.providerProfile.rating.toFixed(1)} · {p.providerProfile.completedProjects} completed
                  </p>
                </Link>
              ))
            )}
          </div>
        )}
      </section>
    </main>
  );
}
