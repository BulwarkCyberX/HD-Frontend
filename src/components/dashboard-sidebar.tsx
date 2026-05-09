'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useAuth } from '@/hooks/auth-context';

const baseItems = [
  { href: '/dashboard', label: 'Dashboard', match: 'exact' as const },
  { href: '/projects', label: 'Projects', match: 'prefix' as const },
  { href: '/dashboard/projects/create', label: 'Create Project', match: 'exact' as const },
  { href: '/dashboard/bids', label: 'My Bids', match: 'prefix' as const },
  { href: '/dashboard/bounty', label: 'Bug Bounty', match: 'prefix' as const },
  { href: '/dashboard/vdp', label: 'VDP', match: 'prefix' as const },
  { href: '/dashboard/profile', label: 'Profile', match: 'prefix' as const },
  { href: '/dashboard/settings', label: 'Settings', match: 'prefix' as const },
];

type DashboardSidebarProps = {
  /** When true, show the slide-in panel (mobile / narrow viewports). */
  mobileOpen?: boolean;
  /** Called after navigating or when the backdrop is pressed. */
  onMobileClose?: () => void;
};

export function DashboardSidebar({ mobileOpen = false, onMobileClose }: DashboardSidebarProps) {
  const pathname = usePathname();
  const { user } = useAuth();
  const items = [
    ...baseItems,
    ...(user?.role === 'ADMIN'
      ? [{ href: '/dashboard/admin/reports', label: 'Admin Reports', match: 'prefix' as const }]
      : []),
  ];

  useEffect(() => {
    onMobileClose?.();
  }, [pathname, onMobileClose]);

  const linkClass = (active: boolean) =>
    `block rounded-md border-l-2 px-3 py-2 text-sm transition ${
      active
        ? 'border-tropical-jade-500 bg-neutral-900 font-medium text-white'
        : 'border-transparent text-neutral-300 hover:bg-neutral-900 hover:text-white'
    }`;

  const nav = (
    <nav className="space-y-1 p-3">
      {items.map((item) => {
        const active =
          item.match === 'prefix'
            ? pathname === item.href || pathname.startsWith(`${item.href}/`)
            : pathname === item.href;
        return (
          <Link
            key={item.href}
            href={item.href}
            className={linkClass(active)}
            onClick={() => onMobileClose?.()}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* Desktop / tablet: persistent rail */}
      <aside className="hidden w-64 shrink-0 border-r border-neutral-800 bg-neutral-950/70 backdrop-blur md:flex md:flex-col">
        <div className="border-b border-neutral-800 p-4">
          <p className="text-sm font-semibold text-neutral-50">Workspace</p>
        </div>
        {nav}
      </aside>

      {/* Narrow viewports: same links in a drawer */}
      {mobileOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true" aria-label="Workspace menu">
          <button
            type="button"
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            aria-label="Close menu"
            onClick={() => onMobileClose?.()}
          />
          <aside className="absolute inset-y-0 left-0 flex w-[min(100%,18rem)] flex-col border-r border-neutral-800 bg-neutral-950 shadow-2xl">
            <div className="border-b border-neutral-800 p-4">
              <p className="text-sm font-semibold text-neutral-50">Workspace</p>
            </div>
            {nav}
          </aside>
        </div>
      ) : null}
    </>
  );
}
