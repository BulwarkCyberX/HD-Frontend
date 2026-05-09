'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ApiError, resendVerificationEmail, verifyEmailOtp } from '@/lib/api/auth';

export function AuthCheckInboxForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const emailParam = searchParams.get('email')?.trim() ?? '';
  const [code, setCode] = useState('');
  const [serverError, setServerError] = useState('');
  const [serverMessage, setServerMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [resendBusy, setResendBusy] = useState(false);

  useEffect(() => {
    if (!emailParam) {
      router.replace('/auth/signup');
    }
  }, [emailParam, router]);

  const onVerify = useCallback(async () => {
    if (!emailParam) return;
    const digits = code.replace(/\D/g, '').slice(0, 6);
    if (digits.length !== 6) {
      setServerError('Enter the 6-digit code from your email');
      return;
    }
    setBusy(true);
    setServerError('');
    setServerMessage('');
    try {
      await verifyEmailOtp({ email: emailParam, code: digits });
      router.push('/auth/login?verified=1');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Verification failed');
    } finally {
      setBusy(false);
    }
  }, [code, emailParam, router]);

  const onResend = async () => {
    if (!emailParam) return;
    setResendBusy(true);
    setServerError('');
    setServerMessage('');
    try {
      await resendVerificationEmail(emailParam);
      setServerMessage('If an unverified account exists for this email, we sent a new message.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Could not resend');
    } finally {
      setResendBusy(false);
    }
  };

  if (!emailParam) {
    return null;
  }

  return (
    <Card surface="dark" className="w-full max-w-md hd-fade-up">
      <div className="flex flex-col items-center text-center">
        <div
          className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl border border-emerald-500/30 bg-emerald-500/10 text-4xl shadow-[0_0_40px_-8px_rgba(52,211,153,0.45)]"
          style={{ animation: 'hdMailbox 2.6s ease-in-out infinite' }}
          aria-hidden
        >
          <span role="img" aria-label="Inbox">
            📬
          </span>
        </div>
        <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Check your inbox</h1>
        <p className="mt-2 text-sm text-neutral-300">
          We sent a verification message to{' '}
          <span className="font-medium text-emerald-200">{emailParam}</span>. Use the 6-digit code below, or tap the
          link in the email (valid for <strong className="text-neutral-100">24 hours</strong>).
        </p>
      </div>

      <style>{`
        @keyframes hdMailbox {
          0%, 100% { transform: translateY(0) scale(1); }
          45% { transform: translateY(-10px) scale(1.03); }
          55% { transform: translateY(-6px) scale(1.01); }
        }
      `}</style>

      <div className="mt-8 space-y-3">
        <label htmlFor="verifyCode" className="block text-left text-sm font-medium text-neutral-200">
          Email verification code
        </label>
        <Input
          id="verifyCode"
          type="text"
          inputMode="numeric"
          autoComplete="one-time-code"
          placeholder="000000"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          className="text-center font-mono text-lg tracking-[0.35em]"
        />
        <Button className="w-full" type="button" disabled={busy} onClick={() => void onVerify()}>
          {busy ? 'Verifying…' : 'Verify & continue to login'}
        </Button>
        <button
          type="button"
          disabled={resendBusy}
          onClick={() => void onResend()}
          className="w-full rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-neutral-50 disabled:opacity-50"
        >
          {resendBusy ? 'Sending…' : 'Resend verification email'}
        </button>
      </div>

      {serverMessage ? <p className="mt-4 text-sm text-emerald-300">{serverMessage}</p> : null}
      {serverError ? <p className="mt-4 text-sm text-rose-400">{serverError}</p> : null}

      <p className="mt-6 text-center text-sm text-neutral-400">
        Wrong address?{' '}
        <Link href="/auth/signup" className="font-medium text-emerald-300 hover:text-emerald-200">
          Go back
        </Link>
      </p>
    </Card>
  );
}
