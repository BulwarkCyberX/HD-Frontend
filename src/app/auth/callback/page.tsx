'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card } from '@hackersdeal/ui';
import { getCurrentUser } from '@/lib/api/auth';
import { useAuth } from '@/hooks/auth-context';

function AuthCallbackInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setSession, logout } = useAuth();
  const [message, setMessage] = useState('Completing sign-in…');
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');
    const next = searchParams.get('next') || '/dashboard';
    if (!token) {
      setError('Missing token');
      setMessage('');
      return;
    }

    const run = async () => {
      setError('');
      setMessage('Completing sign-in…');
      try {
        const user = await getCurrentUser(token);
        setSession({ accessToken: token, user });
        router.replace(next);
      } catch (e) {
        logout();
        setError(e instanceof Error ? e.message : 'Unable to complete sign-in');
        setMessage('');
      }
    };

    void run();
  }, [logout, router, searchParams, setSession]);

  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <Card className="w-full max-w-md hd-fade-up">
        <h1 className="text-xl font-semibold text-neutral-50">Signing you in</h1>
        {message ? <p className="mt-2 text-sm text-neutral-300">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-rose-400">{error}</p> : null}
      </Card>
    </main>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
          <Card className="w-full max-w-md hd-fade-up">
            <h1 className="text-xl font-semibold text-neutral-50">Signing you in</h1>
            <p className="mt-2 text-sm text-neutral-300">Loading callback…</p>
          </Card>
        </main>
      }
    >
      <AuthCallbackInner />
    </Suspense>
  );
}

