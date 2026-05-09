'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/auth-context';

const baseItems = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/projects', label: 'Projects' },
  { href: '/dashboard/projects/create', label: 'Create Project' },
  { href: '/dashboard/bids', label: 'My Bids' },
  { href: '/dashboard/bounty', label: 'Bug Bounty' },
  { href: '/dashboard/vdp', label: 'VDP' },
  { href: '/dashboard/profile', label: 'Profile' },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = [
    ...baseItems,
    ...(user?.role === 'ADMIN' ? [{ href: '/dashboard/admin/reports', label: 'Admin Reports' }] : []),
  ];

  return (
    <aside className="hidden w-64 shrink-0 border-r border-neutral-800 bg-neutral-950/70 backdrop-blur md:block">
      <div className="border-b border-neutral-800 p-4">
        <p className="text-sm font-semibold text-neutral-50">Workspace</p>
      </div>
      <nav className="space-y-1 p-3">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`block rounded-md px-3 py-2 text-sm transition ${
                active
                  ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/25'
                  : 'text-neutral-300 hover:bg-neutral-900 hover:text-neutral-50'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
