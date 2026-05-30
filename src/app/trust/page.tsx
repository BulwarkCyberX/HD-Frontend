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
        <p className="text-sm font-medium uppercase tracking-wide text-tropical-aqua-300">Trust & safety</p>
        <h1 className="text-4xl font-semibold text-neutral-50">Built for security engagements</h1>
        <p className="mx-auto max-w-2xl text-neutral-300">
          HackersDeal combines marketplace flexibility with controls enterprises expect for offensive security work.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        {pillars.map((p) => (
          <Card key={p.title} surface="dark">
            <h2 className="font-semibold text-neutral-50">{p.title}</h2>
            <p className="mt-2 text-sm text-neutral-300">{p.body}</p>
          </Card>
        ))}
      </div>

      <Card surface="dark" className="text-center">
        <p className="text-sm text-neutral-300">
          Payments via Razorpay (INR). Platform fees apply on escrow release. Admin tools cover KYC, disputes, and
          email templates. Enterprise orgs can enable OIDC SSO. Compliance drafts are in{' '}
          <code className="rounded bg-neutral-800 px-1 text-neutral-200">docs/compliance/</code>.
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
