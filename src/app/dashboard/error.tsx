'use client';

import { useEffect } from 'react';
import { Button } from '@hackersdeal/ui';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto max-w-lg space-y-4 p-6 text-center">
      <h1 className="text-lg font-semibold text-slate-900">Something went wrong</h1>
      <p className="text-sm text-slate-600">{error.message || 'Unexpected error in dashboard.'}</p>
      <Button type="button" onClick={() => reset()}>
        Try again
      </Button>
    </div>
  );
}
