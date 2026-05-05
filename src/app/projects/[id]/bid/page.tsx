'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';
import { aiImproveProposal } from '@/lib/api/ai';
import { createBid } from '@/lib/api/bids';

const bidSchema = z.object({
  proposal: z.string().min(20, 'Proposal must be at least 20 characters'),
  price: z.number().min(1, 'Price must be greater than 0'),
  timeline: z.string().min(2, 'Timeline is required'),
});

type BidFormValues = z.infer<typeof bidSchema>;

export default function SubmitBidPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { token, user } = useAuth();
  const [serverError, setServerError] = useState('');
  const [serverSuccess, setServerSuccess] = useState('');
  const [aiBusy, setAiBusy] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<BidFormValues>({
    resolver: zodResolver(bidSchema),
    defaultValues: { proposal: '', price: 1000, timeline: '2 weeks' },
  });

  const proposalWatch = watch('proposal');

  const onSubmit = async (values: BidFormValues) => {
    setServerError('');
    setServerSuccess('');
    if (!token) {
      setServerError('You must be logged in to submit bids.');
      return;
    }
    if (user?.role !== 'PROVIDER') {
      setServerError('Only provider accounts can submit bids.');
      return;
    }

    try {
      await createBid(token, {
        projectId: params.id,
        proposal: values.proposal,
        price: values.price,
        timeline: values.timeline,
      });
      setServerSuccess('Bid submitted successfully.');
      router.push('/dashboard/bids?submitted=1');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Unable to submit bid');
    }
  };

  return (
    <ProtectedRoute>
      <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-3xl px-4 py-8 sm:px-6">
        <Card className="space-y-5">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Submit Bid</h1>
            <p className="mt-2 text-sm text-slate-600">
              Provide a clear proposal, estimated price, and delivery timeline.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
            <div className="space-y-1.5">
              <label htmlFor="proposal" className="text-sm font-medium text-slate-700">
                Proposal
              </label>
              <textarea
                id="proposal"
                rows={6}
                className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-emerald-500"
                {...register('proposal')}
              />
              {errors.proposal ? (
                <p className="text-xs text-rose-600">{errors.proposal.message}</p>
              ) : null}
              <Button
                type="button"
                variant="secondary"
                className="mt-2"
                disabled={aiBusy || !token || (proposalWatch?.length ?? 0) < 20}
                onClick={async () => {
                  if (!token) return;
                  setAiBusy(true);
                  setServerError('');
                  try {
                    const res = (await aiImproveProposal(token, proposalWatch)) as { improved?: string };
                    if (res.improved) setValue('proposal', res.improved);
                  } catch {
                    setServerError('Could not improve proposal.');
                  } finally {
                    setAiBusy(false);
                  }
                }}
              >
                {aiBusy ? 'Improving…' : 'Improve proposal (AI)'}
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="price" className="text-sm font-medium text-slate-700">
                  Price
                </label>
                <Input
                  id="price"
                  type="number"
                  min={1}
                  step="0.01"
                  {...register('price', { valueAsNumber: true })}
                />
                {errors.price ? <p className="text-xs text-rose-600">{errors.price.message}</p> : null}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="timeline" className="text-sm font-medium text-slate-700">
                  Timeline
                </label>
                <Input id="timeline" {...register('timeline')} />
                {errors.timeline ? (
                  <p className="text-xs text-rose-600">{errors.timeline.message}</p>
                ) : null}
              </div>
            </div>

            {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}
            {serverSuccess ? <p className="text-sm text-emerald-700">{serverSuccess}</p> : null}

            <div className="flex items-center gap-3">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Submitting...' : 'Submit Bid'}
              </Button>
              <Link href="/projects" className="text-sm text-slate-600 hover:text-slate-900">
                Cancel
              </Link>
            </div>
          </form>
        </Card>
      </main>
    </ProtectedRoute>
  );
}
