'use client';

import { useCallback, useState } from 'react';
import { Button } from '@hackersdeal/ui';
import { createCheckout, verifyCheckout, type CheckoutSession } from '@/lib/api/psp';

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => { open: () => void };
  }
}

function loadRazorpayScript(): Promise<void> {
  if (typeof window === 'undefined') return Promise.resolve();
  if (window.Razorpay) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Razorpay'));
    document.body.appendChild(script);
  });
}

type Props = {
  token: string;
  projectId: string;
  amount: number;
  currency?: 'INR' | 'USD';
  onSuccess?: () => void;
  disabled?: boolean;
};

export function RazorpayCheckoutButton({
  token,
  projectId,
  amount,
  currency = 'INR',
  onSuccess,
  disabled,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const openCheckout = useCallback(async () => {
    setBusy(true);
    setError('');
    try {
      await loadRazorpayScript();
      const session: CheckoutSession = await createCheckout(token, { projectId, amount, currency });
      if (session.provider !== 'RAZORPAY' || !session.publicKey) {
        throw new Error('Razorpay is not configured for this checkout');
      }
      await new Promise<void>((resolve, reject) => {
        const rzp = new window.Razorpay!({
          key: session.publicKey,
          amount: session.amountMinor,
          currency: session.currency,
          name: 'HackersDeal',
          description: 'Project escrow funding',
          order_id: session.providerOrderId,
          handler: async (response: {
            razorpay_payment_id: string;
            razorpay_order_id: string;
            razorpay_signature: string;
          }) => {
            try {
              await verifyCheckout(token, {
                sessionId: session.sessionId,
                providerPaymentId: response.razorpay_payment_id,
                providerOrderId: response.razorpay_order_id,
                signature: response.razorpay_signature,
              });
              onSuccess?.();
              resolve();
            } catch (e) {
              reject(e);
            }
          },
          modal: {
            ondismiss: () => reject(new Error('Payment cancelled')),
          },
        });
        rzp.open();
      });
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Payment failed');
    } finally {
      setBusy(false);
    }
  }, [amount, currency, onSuccess, projectId, token]);

  return (
    <div className="space-y-2">
      <Button type="button" disabled={disabled || busy} onClick={() => void openCheckout()}>
        {busy ? 'Opening checkout…' : `Pay ₹${amount.toLocaleString()} via Razorpay`}
      </Button>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
