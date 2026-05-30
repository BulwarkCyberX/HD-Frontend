import Link from 'next/link';
import { fetchPublicProvider } from '@/lib/api/public';
import { Button } from '@hackersdeal/ui';

export default async function PublicProviderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  let provider;
  try {
    provider = await fetchPublicProvider(id);
  } catch {
    return (
      <main className="mx-auto max-w-3xl px-4 py-16">
        <p className="text-neutral-300">Provider not found.</p>
        <Link href="/marketplace" className="mt-4 inline-block text-sm text-tropical-aqua-300 underline">
          Back to marketplace
        </Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl space-y-6 px-4 py-12">
      <div>
        <p className="text-sm text-tropical-aqua-300">Security provider</p>
        <h1 className="text-3xl font-semibold text-neutral-50">{provider.displayName}</h1>
        <p className="mt-1 text-sm text-neutral-300">
          {provider.city ? `${provider.city}, ` : ''}
          {provider.country ?? 'Global'} · {provider.profile.availabilityStatus}
        </p>
      </div>

      {provider.profile.bio ? <p className="text-neutral-200">{provider.profile.bio}</p> : null}

      <section className="grid gap-4 sm:grid-cols-3">
        <Stat label="Rating" value={provider.profile.rating.toFixed(1)} />
        <Stat label="Completed" value={String(provider.profile.completedProjects)} />
        <Stat label="Valid reports" value={String(provider.profile.validReportCount)} />
      </section>

      {Array.isArray(provider.profile.portfolio) && provider.profile.portfolio.length > 0 ? (
        <section>
          <h2 className="font-semibold text-neutral-50">Portfolio</h2>
          <ul className="mt-2 space-y-2 text-sm text-neutral-200">
            {(provider.profile.portfolio as { title?: string; summary?: string }[]).map((item, i) => (
              <li key={i} className="rounded-md border border-neutral-700 p-3">
                {item.title ? <p className="font-medium">{item.title}</p> : null}
                {item.summary ? <p className="text-neutral-300">{item.summary}</p> : null}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {provider.profile.skills.length > 0 ? (
        <section>
          <h2 className="font-semibold text-neutral-50">Skills</h2>
          <div className="mt-2 flex flex-wrap gap-2">
            {provider.profile.skills.map((s) => (
              <span key={s} className="rounded-full bg-neutral-800 px-3 py-1 text-xs text-neutral-200">
                {s}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <Link href="/projects">
        <Button>Browse projects</Button>
      </Link>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-tropical-jade-200 bg-white p-4">
      <p className="text-xs uppercase text-slate-500">{label}</p>
      <p className="text-xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
