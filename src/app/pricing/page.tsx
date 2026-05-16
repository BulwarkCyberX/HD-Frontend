import Link from 'next/link';
import { Button, Card } from '@hackersdeal/ui';

export default function PricingPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-16">
      <header className="space-y-3 text-center">
        <h1 className="text-4xl font-semibold text-slate-900">Pricing & fees</h1>
        <p className="text-slate-600">Transparent economics for clients and security researchers.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">For clients</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Free to post projects and receive bids</li>
            <li>Escrow funding via Razorpay (INR) before work begins</li>
            <li>Platform fee applied on escrow release (configurable bps)</li>
            <li>Optional milestone-based payouts</li>
          </ul>
        </Card>
        <Card>
          <h2 className="text-lg font-semibold text-slate-900">For researchers</h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>Bid credits to submit proposals on active projects</li>
            <li>KYC required before withdrawals</li>
            <li>Earnings land in your wallet after client release</li>
            <li>Reputation grows with validated reports and reviews</li>
          </ul>
        </Card>
      </div>

      <Card className="bg-tropical-sage-50/50">
        <h2 className="font-semibold text-slate-900">Trust & safety included</h2>
        <p className="mt-2 text-sm text-slate-600">
          Dispute resolution, admin triage for findings, ledger-backed escrow, and editable transactional
          emails — built for security engagements at production quality.
        </p>
      </Card>

      <div className="text-center">
        <Link href="/auth/signup" className="inline-block">
          <Button>Create account</Button>
        </Link>
      </div>
    </main>
  );
}
