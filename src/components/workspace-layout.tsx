'use client';

import Link from 'next/link';
import { useCallback, useState } from 'react';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ProtectedRoute } from '@/components/protected-route';

type ContentVariant = 'card' | 'flush';

type WorkspaceLayoutProps = {
  children: React.ReactNode;
  /** When true, unauthenticated visitors are redirected to login. */
  requireAuth?: boolean;
  contentVariant?: ContentVariant;
};

export function WorkspaceLayout({
  children,
  requireAuth = true,
  contentVariant = 'card',
}: WorkspaceLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeMobileNav = useCallback(() => setMobileNavOpen(false), []);

  const shell = (
    <div className="flex min-h-[calc(100vh-4rem)] bg-neutral-950">
      <DashboardSidebar mobileOpen={mobileNavOpen} onMobileClose={closeMobileNav} />
      <div className="flex min-h-full min-w-0 flex-1 flex-col">
        <header className="flex h-14 items-center justify-between gap-3 border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur md:hidden">
          <button
            type="button"
            className="rounded-md border border-neutral-700 bg-neutral-900 px-3 py-1.5 text-sm font-medium text-neutral-100 hover:bg-neutral-800"
            onClick={() => setMobileNavOpen(true)}
            aria-expanded={mobileNavOpen}
          >
            Menu
          </button>
          <p className="min-w-0 flex-1 truncate text-center text-sm font-semibold text-neutral-50">Workspace</p>
          <Link href="/" className="shrink-0 text-xs font-medium text-neutral-300 hover:text-white">
            Exit
          </Link>
        </header>
        <main className="flex-1 bg-neutral-950 p-4 sm:p-6 lg:p-8">
          {contentVariant === 'card' ? (
            <div className="mx-auto max-w-6xl rounded-xl border border-tropical-jade-200/90 bg-tropical-sage-50 p-6 text-slate-800 shadow-[0_14px_44px_rgba(9,124,135,0.12)] sm:p-8">
              {children}
            </div>
          ) : (
            <div className="mx-auto w-full max-w-6xl rounded-xl border border-tropical-jade-200/90 bg-tropical-sage-50 p-6 text-slate-800 shadow-[0_14px_44px_rgba(9,124,135,0.12)] sm:p-8">
              {children}
            </div>
          )}
        </main>
      </div>
    </div>
  );

  if (requireAuth) {
    return <ProtectedRoute>{shell}</ProtectedRoute>;
  }

  return shell;
}
