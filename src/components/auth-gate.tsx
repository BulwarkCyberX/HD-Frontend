'use client';

import { useAuth } from '@/hooks/auth-context';

export function AuthGate({
  authenticated,
  unauthenticated,
  loading = null,
}: {
  authenticated: React.ReactNode;
  unauthenticated: React.ReactNode;
  loading?: React.ReactNode;
}) {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <>{loading}</>;
  return <>{isAuthenticated ? authenticated : unauthenticated}</>;
}

