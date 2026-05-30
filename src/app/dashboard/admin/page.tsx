'use client';

import Link from 'next/link';
import { Card } from '@hackersdeal/ui';

const shortcuts = [
  {
    href: '/dashboard/admin/projects',
    title: 'All projects',
    description: 'View and edit every project: status, scope, budget, visibility, and provider assignment.',
  },
  {
    href: '/dashboard/admin/emails',
    title: 'Email templates',
    description: 'Edit transactional emails (signup, login OTP, password reset, bids, notifications).',
  },
  {
    href: '/dashboard/admin/reports',
    title: 'Report triage',
    description: 'Validate security findings submitted in workspaces.',
  },
  {
    href: '/dashboard/admin/disputes',
    title: 'Disputes',
    description: 'Resolve payment and delivery disputes.',
  },
  {
    href: '/dashboard/admin/kyc',
    title: 'KYC queue',
    description: 'Approve provider identity and payout verification.',
  },
  {
    href: '/dashboard/admin/withdrawals',
    title: 'Withdrawals',
    description: 'Approve provider payout requests after KYC.',
  },
  {
    href: '/dashboard/admin/fraud',
    title: 'Fraud flags',
    description: 'Review velocity-based fraud scores and clear false positives.',
  },
  {
    href: '/dashboard/admin/analytics',
    title: 'Analytics',
    description: 'Platform GMV, users, projects by status, and operational queues.',
  },
  {
    href: '/dashboard/admin/settings',
    title: 'Platform settings',
    description: 'Mail configuration notes and quick links to template editor.',
  },
];

export default function AdminOverviewPage() {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {shortcuts.map((item) => (
        <Link key={item.href} href={item.href}>
          <Card className="h-full transition hover:border-tropical-jade-300">
            <h2 className="font-semibold text-slate-900">{item.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </Card>
        </Link>
      ))}
    </div>
  );
}
