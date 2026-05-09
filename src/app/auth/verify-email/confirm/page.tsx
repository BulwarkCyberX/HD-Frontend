import { Suspense } from 'react';
import { AuthVerifyEmailToken } from '@/components/auth-verify-email-token';

export default function VerifyEmailConfirmPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <Suspense fallback={<p className="text-sm text-neutral-400">Verifying…</p>}>
        <AuthVerifyEmailToken />
      </Suspense>
    </main>
  );
}
