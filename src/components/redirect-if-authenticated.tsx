'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';

function safeNextPath(raw: string | null): string | null {
  if (!raw || !raw.startsWith('/')) return null;
  if (raw.startsWith('//')) return null;
  return raw;
}

export function RedirectIfAuthenticated({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (isLoading || !isAuthenticated) return;
    const next = safeNextPath(searchParams.get('next'));
    router.replace(next ?? '/dashboard');
  }, [isAuthenticated, isLoading, router, searchParams]);

  if (!isLoading && isAuthenticated) {
    return (
      <p className="mx-auto max-w-md px-4 py-16 text-center text-sm text-neutral-400">You are signed in. Redirecting…</p>
    );
  }

  return <>{children}</>;
}
