import Link from 'next/link';
import { Button, Card } from '@hackersdeal/ui';

const pillars = [
  {
    title: 'Escrow-backed payments',
    body: 'Client funds are held in ledger escrow until work is accepted. Disputes can trigger admin-reviewed refunds.',
  },
  {
    title: 'KYC for payouts',
    body: 'Researchers verify identity before withdrawing earnings, reducing fraud and chargeback risk.',
  },
  {
    title: 'Scoped security work',
    body: 'Projects define assets, in/out of scope, and testing windows — built for pentests, not generic gigs.',
  },
  {
    title: 'Dispute resolution',
    body: 'Threaded disputes with evidence uploads and admin triage, including escrow reversal when appropriate.',
  },
];

export default function TrustPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-tropical-jade-600">Trust & safety</p>
        <h1 className="text-4xl font-semibold text-slate-900">Built for security engagements</h1>
        <p className="mx-auto max-w-2xl text-slate-600">
          HackersDeal combines marketplace flexibility with controls enterprises expect for offensive security work.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {pillars.map((p) => (
          <Card key={p.title}>
            <h2 className="font-semibold text-slate-900">{p.title}</h2>
            <p className="mt-2 text-sm text-slate-600">{p.body}</p>
          </Card>
        ))}
      </div>

      <Card className="bg-tropical-sage-50/50 text-center">
        <p className="text-sm text-slate-700">
          Payments via Razorpay (INR). Platform fees apply on escrow release. Admin tools cover KYC, disputes, and
          email templates.
        </p>
        <div className="mt-4 flex flex-wrap justify-center gap-3">
          <Link href="/how-it-works">
            <Button variant="secondary">How it works</Button>
          </Link>
          <Link href="/auth/signup">
            <Button>Create account</Button>
          </Link>
        </div>
      </Card>
    </main>
  );
}
