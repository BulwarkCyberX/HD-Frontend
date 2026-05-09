import { Suspense } from 'react';
import { AuthLoginForm } from '@/components/auth-login-form';
import { RedirectIfAuthenticated } from '@/components/redirect-if-authenticated';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <Suspense fallback={<p className="text-sm text-neutral-400">Loading login…</p>}>
        <RedirectIfAuthenticated>
          <AuthLoginForm />
        </RedirectIfAuthenticated>
      </Suspense>
    </main>
  );
}
