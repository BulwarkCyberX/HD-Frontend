import Link from 'next/link';
import { Button, Card } from '@hackersdeal/ui';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
      <section className="max-w-2xl space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-emerald-700">
          Frontend Foundation
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-slate-900 sm:text-5xl">
          Security projects marketplace UI scaffold
        </h1>
        <p className="text-lg text-slate-600">
          Clean app shell with auth forms, dashboard navigation, and mock project workflows.
        </p>
        <div className="flex gap-3">
          <Link href="/auth/login">
            <Button>Login</Button>
          </Link>
          <Link href="/auth/signup">
            <Button variant="secondary">Signup</Button>
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Auth UI</h2>
          <p className="mt-2 text-sm text-slate-600">
            Login/signup forms validated with react-hook-form and zod.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Protected routes</h2>
          <p className="mt-2 text-sm text-slate-600">
            Dashboard and projects routes use mock auth guard behavior.
          </p>
        </Card>
        <Card>
          <h2 className="text-base font-semibold text-slate-900">Mock data layer</h2>
          <p className="mt-2 text-sm text-slate-600">
            Service functions in lib/api provide mock login/register/projects calls.
          </p>
        </Card>
      </section>
    </main>
  );
}
