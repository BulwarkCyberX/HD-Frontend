import Link from 'next/link';
import { Button, Card } from '@hackersdeal/ui';

const steps = [
  {
    title: 'Post a scoped security project',
    body: 'Define assets, in/out of scope, testing windows, and budget. Publish publicly or keep the engagement private.',
  },
  {
    title: 'Receive qualified bids',
    body: 'Researchers and pentesters submit proposals with pricing and timelines. Compare reputation and valid report history.',
  },
  {
    title: 'Collaborate in a secure workspace',
    body: 'Chat, share evidence, deliver structured findings, and fund milestones through escrow-backed payments.',
  },
  {
    title: 'Validate and pay with confidence',
    body: 'Triage reports, release escrow when satisfied, and build long-term trust with vetted security talent.',
  },
];

export default function HowItWorksPage() {
  return (
    <main className="mx-auto max-w-4xl space-y-10 px-4 py-16">
      <header className="space-y-4 text-center">
        <p className="text-sm font-medium uppercase tracking-wide text-tropical-aqua-300">How it works</p>
        <h1 className="text-4xl font-semibold text-neutral-50">Security work, end to end</h1>
        <p className="mx-auto max-w-2xl text-neutral-300">
          HackersDeal is a cybersecurity-native marketplace — not a generic freelance board. Every flow is built
          for pentests, assessments, and coordinated disclosure.
        </p>
        <Link href="/auth/signup" className="inline-block">
          <Button>Get started</Button>
        </Link>
      </header>
      <ol className="space-y-4">
        {steps.map((step, i) => (
          <li key={step.title}>
            <Card surface="dark">
              <p className="text-xs font-medium text-tropical-aqua-300">Step {i + 1}</p>
              <h2 className="mt-1 text-lg font-semibold text-neutral-50">{step.title}</h2>
              <p className="mt-2 text-sm text-neutral-300">{step.body}</p>
            </Card>
          </li>
        ))}
      </ol>
      <p className="text-center text-sm text-neutral-400">
        <Link href="/pricing" className="text-tropical-aqua-300 underline">
          View pricing & fees
        </Link>
        {' · '}
        <Link href="/marketplace" className="text-tropical-aqua-300 underline">
          Browse marketplace
        </Link>
      </p>
    </main>
  );
}
