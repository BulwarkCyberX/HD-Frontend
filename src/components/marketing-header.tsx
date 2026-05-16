import Link from 'next/link';
import { useAuth } from '@/hooks/auth-context';

export function MarketingHeader() {
  const { isAuthenticated, isLoading } = useAuth();

  const publicLinks = [
    { href: '/how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/trust', label: 'Trust' },
    { href: '/marketplace', label: 'Marketplace' },
  ];
  const links = isAuthenticated
    ? [...publicLinks, { href: '/dashboard', label: 'Dashboard' }]
    : [...publicLinks, { href: '/login', label: 'Log in' }, { href: '/signup', label: 'Sign up' }];

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          HackersDeal
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-600">
          {isLoading ? (
            <span className="h-7 w-24 animate-pulse rounded-md bg-slate-100" aria-label="Loading session" />
          ) : (
            links.map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-md px-2 py-1 transition-colors hover:bg-slate-100 hover:text-slate-900"
              >
                {l.label}
              </Link>
            ))
          )}
        </nav>
      </div>
    </header>
  );
}
