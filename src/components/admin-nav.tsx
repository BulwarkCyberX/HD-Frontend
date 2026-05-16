'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const links = [
  { href: '/dashboard/admin', label: 'Overview', exact: true },
  { href: '/dashboard/admin/projects', label: 'Projects' },
  { href: '/dashboard/admin/reports', label: 'Reports' },
  { href: '/dashboard/admin/disputes', label: 'Disputes' },
  { href: '/dashboard/admin/kyc', label: 'KYC' },
  { href: '/dashboard/admin/withdrawals', label: 'Withdrawals' },
  { href: '/dashboard/admin/analytics', label: 'Analytics' },
  { href: '/dashboard/admin/emails', label: 'Email templates' },
  { href: '/dashboard/admin/settings', label: 'Settings' },
];

export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex flex-wrap gap-2 border-b border-slate-200 pb-3">
      {links.map((link) => {
        const active = link.exact
          ? pathname === link.href
          : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`rounded-md px-3 py-1.5 text-sm font-medium transition ${
              active
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
}
