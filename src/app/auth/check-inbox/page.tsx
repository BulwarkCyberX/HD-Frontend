import { Suspense } from 'react';
import { AuthCheckInboxForm } from '@/components/auth-check-inbox-form';
import { Spinner } from '@/components/spinner';

export default function CheckInboxPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <Suspense fallback={<Spinner size="page" label="Loading…" />}>
        <AuthCheckInboxForm />
      </Suspense>
    </main>
  );
}
