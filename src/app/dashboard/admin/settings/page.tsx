'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Button, Card } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { sendWeeklyDigestsAdmin } from '@/lib/api/notifications-admin';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}

function AdminSettingsContent() {
  const { token, user } = useAuth();
  const [digestMessage, setDigestMessage] = useState('');
  const [digestBusy, setDigestBusy] = useState(false);

  const runDigest = async () => {
    if (!token) return;
    setDigestBusy(true);
    setDigestMessage('');
    try {
      const res = await sendWeeklyDigestsAdmin(token);
      setDigestMessage(`Weekly digest sent to ${res.sent} users.`);
    } catch (e) {
      setDigestMessage(e instanceof Error ? e.message : 'Digest send failed');
    } finally {
      setDigestBusy(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  return (
    <section className="space-y-4">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Platform settings</h2>
        <p className="mt-1 text-sm text-slate-600">Operational configuration for HackersDeal.</p>
      </header>

      <Card>
        <h3 className="font-semibold text-slate-900">Weekly email digest</h3>
        <p className="mt-2 text-sm text-slate-600">
          Sends the <code className="rounded bg-slate-100 px-1">WEEKLY_DIGEST</code> template to users who opted
          in. For production, set{' '}
          <code className="rounded bg-slate-100 px-1">ENABLE_WEEKLY_DIGEST_CRON=true</code> on the API (Mondays
          ~09:00 UTC).
        </p>
        <Button type="button" className="mt-3" disabled={digestBusy} onClick={() => void runDigest()}>
          {digestBusy ? 'Sending…' : 'Send weekly digest now'}
        </Button>
        {digestMessage ? <p className="mt-2 text-sm text-slate-700">{digestMessage}</p> : null}
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Email templates</h3>
        <p className="mt-2 text-sm text-slate-600">
          All transactional emails (signup verification, login OTP, password reset, project created, bid
          confirmation, notifications, weekly digest) are stored in the database and editable without redeploying
          code.
        </p>
        <Link
          href="/dashboard/admin/emails"
          className="mt-3 inline-block text-sm font-medium text-tropical-jade-700 underline"
        >
          Open email template editor →
        </Link>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Mail delivery (environment)</h3>
        <p className="mt-2 text-sm text-slate-600">
          SMTP / SendGrid credentials are configured via API environment variables (
          <code className="rounded bg-slate-100 px-1">GMAIL_SMTP_*</code>,{' '}
          <code className="rounded bg-slate-100 px-1">SENDGRID_API_KEY</code>,{' '}
          <code className="rounded bg-slate-100 px-1">MAIL_FROM_ADDRESS</code>). Update those in your hosting
          provider; template content is managed above.
        </p>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900">Payments</h3>
        <p className="mt-2 text-sm text-slate-600">
          Razorpay keys (<code className="rounded bg-slate-100 px-1">RAZORPAY_KEY_*</code>) and webhooks are set
          in <code className="rounded bg-slate-100 px-1">apps/api/.env</code>. Platform fee basis points are
          seeded via <code className="rounded bg-slate-100 px-1">prisma/seed.js</code>.
        </p>
      </Card>
    </section>
  );
}
