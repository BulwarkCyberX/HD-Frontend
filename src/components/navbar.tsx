'use client';

import Link from 'next/link';
import { NotificationBell } from '@/components/notification-bell';

const links = [
  { href: '/auth/login', label: 'Login' },
  { href: '/auth/signup', label: 'Signup' },
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
];

export function Navbar() {
  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-lg font-semibold tracking-tight text-slate-900">
          HackersDeal
        </Link>
        <div className="flex items-center gap-2">
          <nav className="flex items-center gap-2 text-sm font-medium text-slate-600">
            {links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-md px-3 py-1.5 transition hover:bg-slate-100 hover:text-slate-900"
              >
                {item.label}
              </Link>
            ))}
          </nav>
          <NotificationBell />
        </div>
      </div>
    </header>
  );
}
