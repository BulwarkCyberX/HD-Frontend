import { Suspense } from 'react';
import { AuthCheckInboxForm } from '@/components/auth-check-inbox-form';

export default function CheckInboxPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <Suspense fallback={<p className="text-sm text-neutral-400">Loading…</p>}>
        <AuthCheckInboxForm />
      </Suspense>
    </main>
  );
}
