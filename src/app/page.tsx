import Link from 'next/link';
import { Button, Card } from '@hackersdeal/ui';
import { AuthGate } from '@/components/auth-gate';

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl flex-col gap-10 px-4 py-16 sm:px-6">
      <section className="max-w-3xl space-y-6 hd-fade-up">
        <p className="text-sm font-medium uppercase tracking-wide text-tropical-aqua-300">
          Hire · Work · Secure
        </p>
        <h1 className="text-4xl font-semibold tracking-tight text-neutral-50 sm:text-6xl">
          Security talent and projects,{' '}
          <span className="bg-gradient-to-r from-tropical-aqua-300 via-tropical-sage-300 to-tropical-sunrise-300 bg-clip-text text-transparent">
            built for modern teams
          </span>
        </h1>
        <p className="text-lg text-neutral-300">
          Post a security project, hire verified experts, and collaborate end-to-end — from scope to delivery.
        </p>
        <AuthGate
          authenticated={
            <div className="flex gap-3">
              <Link href="/dashboard">
                <Button>Go to Dashboard</Button>
              </Link>
              <Link href="/projects">
                <Button variant="secondary">Browse Projects</Button>
              </Link>
            </div>
          }
          unauthenticated={
            <div className="flex gap-3">
              <Link href="/auth/login">
                <Button>Login</Button>
              </Link>
              <Link href="/auth/signup">
                <Button variant="secondary">Signup</Button>
              </Link>
            </div>
          }
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-3 hd-fade-in">
        <Card className="border-tropical-aqua-500/20">
          <h2 className="text-base font-semibold text-neutral-50">Auth that feels instant</h2>
          <p className="mt-2 text-sm text-neutral-300">Password or one-time code, plus SSO providers.</p>
        </Card>
        <Card className="border-tropical-sage-500/20">
          <h2 className="text-base font-semibold text-neutral-50">Protected workspace</h2>
          <p className="mt-2 text-sm text-neutral-300">Sessions and guards that stay consistent across pages.</p>
        </Card>
        <Card className="border-tropical-sunrise-500/20">
          <h2 className="text-base font-semibold text-neutral-50">Project flow built-in</h2>
          <p className="mt-2 text-sm text-neutral-300">Post, bid, chat, deliver, and review — end-to-end.</p>
        </Card>
      </section>
    </main>
  );
}
