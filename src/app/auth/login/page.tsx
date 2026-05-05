import { Suspense } from 'react';
import { AuthLoginForm } from '@/components/auth-login-form';

export default function LoginPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <Suspense fallback={<p className="text-sm text-slate-500">Loading login…</p>}>
        <AuthLoginForm />
      </Suspense>
    </main>
  );
}
