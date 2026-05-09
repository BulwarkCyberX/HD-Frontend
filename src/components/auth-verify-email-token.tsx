'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { ApiError, verifyEmailToken } from '@/lib/api/auth';

export function AuthVerifyEmailToken() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'idle' | 'working' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = searchParams.get('token')?.trim();
    if (!token) {
      setStatus('error');
      setMessage('Missing verification link. Request a new email from the sign-up flow.');
      return;
    }

    let cancelled = false;
    setStatus('working');
    setMessage('Confirming your email…');

    verifyEmailToken({ token })
      .then(() => {
        if (cancelled) return;
        setStatus('done');
        setMessage('Email verified. Redirecting to sign in…');
        router.replace('/auth/login?verified=1');
      })
      .catch((error) => {
        if (cancelled) return;
        setStatus('error');
        if (error instanceof ApiError) {
          setMessage(error.message);
          return;
        }
        setMessage(error instanceof Error ? error.message : 'Verification failed');
      });

    return () => {
      cancelled = true;
    };
  }, [router, searchParams]);

  return (
    <div className="w-full max-w-md rounded-xl border border-neutral-800 bg-neutral-950/60 px-6 py-10 text-center shadow-xl">
      <p className="text-sm text-neutral-200">{message}</p>
      {status === 'error' ? (
        <p className="mt-4 text-xs text-neutral-500">
          You can try entering the code manually on the check-inbox page linked from sign up.
        </p>
      ) : null}
    </div>
  );
}
