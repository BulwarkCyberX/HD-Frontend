'use client';

import Link from 'next/link';
import { NavUserMenu } from '@/components/nav-user-menu';
import { NotificationBell } from '@/components/notification-bell';
import { Spinner } from '@/components/spinner';
import { useAuth } from '@/hooks/auth-context';

export function Navbar() {
  const { isAuthenticated, isLoading } = useAuth();

  const publicLinks = [
    { href: '/how-it-works', label: 'How it works' },
    { href: '/pricing', label: 'Pricing' },
    { href: '/trust', label: 'Trust' },
    { href: '/marketplace', label: 'Marketplace' },
  ];
  const links = isAuthenticated
    ? [
        ...publicLinks,
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/projects', label: 'Projects' },
      ]
    : [...publicLinks, { href: '/auth/login', label: 'Login' }, { href: '/auth/signup', label: 'Signup' }];

  return (
    <header className="border-b border-neutral-800 bg-neutral-950/80 backdrop-blur supports-[backdrop-filter]:bg-neutral-950/70">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-neutral-50">
          Hackers<span className="text-tropical-aqua-400">Deal</span>
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm font-medium text-neutral-300">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 transition hover:bg-neutral-900 hover:text-tropical-sand-200"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          {isAuthenticated ? <NotificationBell /> : null}

          {isLoading ? (
            <div className="ml-1 flex items-center">
              <Spinner size="sm" className="border-tropical-aqua-400 border-t-transparent" />
            </div>
          ) : isAuthenticated ? (
            <NavUserMenu />
          ) : null}
        </div>
      </div>
    </header>
  );
}
