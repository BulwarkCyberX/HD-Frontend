'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { OAuthButtons } from '@/components/oauth-buttons';
import { ApiError, login, requestLoginCode, verifyLoginCode } from '@/lib/api/auth';
import { useAuth } from '@/hooks/auth-context';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

const codeSchema = z.object({
  email: z.string().email('Enter a valid email'),
  code: z.string().min(4, 'Enter the code').max(12, 'Enter the code'),
});

type LoginFormValues = z.infer<typeof loginSchema>;
type CodeFormValues = z.infer<typeof codeSchema>;

/** Testing-only quick login — hidden in production unless explicitly enabled via env. */
const showAdminQuickLogin =
  process.env.NODE_ENV === 'development' || process.env.NEXT_PUBLIC_ENABLE_ADMIN_QUICK_LOGIN === 'true';

const DEV_ADMIN_EMAIL = process.env.NEXT_PUBLIC_DEV_ADMIN_EMAIL ?? 'admin@hackersdeal.com';
const DEV_ADMIN_PASSWORD = process.env.NEXT_PUBLIC_DEV_ADMIN_PASSWORD ?? 'Admin12345!';
const ADMIN_PANEL_PATH = '/dashboard/admin/reports';

export function AuthLoginForm() {
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [verificationHelpEmail, setVerificationHelpEmail] = useState<string | null>(null);
  const [mode, setMode] = useState<'password' | 'code'>('password');
  const [codeRequested, setCodeRequested] = useState(false);
  const [adminQuickLoginBusy, setAdminQuickLoginBusy] = useState(false);
  const { setSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    if (searchParams.get('verified') === '1') {
      setServerMessage('Email verified. You can sign in now.');
    }
  }, [searchParams]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: codeErrors, isSubmitting: isSubmittingCode },
    getValues: getCodeValues,
  } = useForm<CodeFormValues>({ resolver: zodResolver(codeSchema), defaultValues: { code: '' } });

  const onSubmit = async (values: LoginFormValues) => {
    setServerMessage('');
    setServerError('');
    setVerificationHelpEmail(null);
    try {
      const result = await login(values);
      setSession(result);
      setServerMessage('Login successful');
      router.push(nextPath);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        if (error.code === 'EMAIL_NOT_VERIFIED') {
          setVerificationHelpEmail(values.email.trim().toLowerCase());
        }
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  const onRequestCode = async () => {
    setServerMessage('');
    setServerError('');
    const email = getCodeValues('email');
    try {
      await requestLoginCode({ email });
      setCodeRequested(true);
      setServerMessage('We sent a one-time code to your email (if delivery is enabled).');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Could not request code');
    }
  };

  const onQuickAdminLogin = async () => {
    setServerMessage('');
    setServerError('');
    setVerificationHelpEmail(null);
    setAdminQuickLoginBusy(true);
    try {
      const result = await login({ email: DEV_ADMIN_EMAIL, password: DEV_ADMIN_PASSWORD });
      setSession(result);
      setServerMessage('Admin login successful');
      router.push(ADMIN_PANEL_PATH);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Admin quick login failed');
    } finally {
      setAdminQuickLoginBusy(false);
    }
  };

  const onVerifyCode = async (values: CodeFormValues) => {
    setServerMessage('');
    setServerError('');
    try {
      const result = await verifyLoginCode(values);
      setSession(result);
      setServerMessage('Login successful');
      router.push(nextPath);
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Login failed');
    }
  };

  return (
    <Card surface="dark" className="w-full max-w-md hd-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Sign in</h1>
      <p className="mt-2 text-sm text-neutral-300">Use your email with a password or a one-time code.</p>

      <div className="mt-5 grid grid-cols-2 rounded-lg border border-neutral-800 bg-neutral-950/40 p-1">
        <button
          type="button"
          onClick={() => {
            setMode('password');
            setServerError('');
            setServerMessage('');
            setVerificationHelpEmail(null);
          }}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === 'password' ? 'bg-neutral-900 text-neutral-50' : 'text-neutral-300 hover:bg-neutral-900'
          }`}
        >
          Password
        </button>
        <button
          type="button"
          onClick={() => {
            setMode('code');
            setServerError('');
            setServerMessage('');
            setVerificationHelpEmail(null);
          }}
          className={`rounded-md px-3 py-2 text-sm font-medium transition ${
            mode === 'code' ? 'bg-neutral-900 text-neutral-50' : 'text-neutral-300 hover:bg-neutral-900'
          }`}
        >
          One-time code
        </button>
      </div>

      {mode === 'password' ? (
        <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <div className="space-y-1.5">
            <label htmlFor="email" className="text-sm font-medium text-neutral-200">
              Email
            </label>
            <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
            {errors.email ? <p className="text-xs text-rose-400">{errors.email.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="password" className="text-sm font-medium text-neutral-200">
              Password
            </label>
            <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
            {errors.password ? <p className="text-xs text-rose-400">{errors.password.message}</p> : null}
          </div>

          <Button className="w-full" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing in...' : 'Sign in'}
          </Button>
          <p className="text-center text-sm">
            <Link href="/auth/forgot-password" className="font-medium text-emerald-300 hover:text-emerald-200">
              Forgot password?
            </Link>
          </p>

          {showAdminQuickLogin ? (
            <div className="rounded-lg border border-dashed border-amber-500/40 bg-amber-500/5 p-3">
              <p className="text-center text-xs font-medium uppercase tracking-wide text-amber-200/90">
                Testing only
              </p>
              <Button
                type="button"
                variant="secondary"
                className="mt-2 w-full border-amber-500/30 bg-amber-500/10 text-amber-50 hover:bg-amber-500/20"
                disabled={isSubmitting || adminQuickLoginBusy}
                onClick={onQuickAdminLogin}
              >
                {adminQuickLoginBusy ? 'Opening admin panel...' : 'Quick login: Admin Panel'}
              </Button>
            </div>
          ) : null}
        </form>
      ) : (
        <form className="mt-6 space-y-4" onSubmit={handleSubmitCode(onVerifyCode)}>
          <div className="space-y-1.5">
            <label htmlFor="codeEmail" className="text-sm font-medium text-neutral-200">
              Email
            </label>
            <Input id="codeEmail" type="email" placeholder="you@example.com" {...registerCode('email')} />
            {codeErrors.email ? <p className="text-xs text-rose-400">{codeErrors.email.message}</p> : null}
          </div>

          {codeRequested ? (
            <div className="space-y-1.5">
              <label htmlFor="code" className="text-sm font-medium text-neutral-200">
                Code
              </label>
              <Input id="code" type="text" inputMode="numeric" placeholder="123456" {...registerCode('code')} />
              {codeErrors.code ? <p className="text-xs text-rose-400">{codeErrors.code.message}</p> : null}
            </div>
          ) : null}

          {!codeRequested ? (
            <Button className="w-full" type="button" disabled={isSubmittingCode} onClick={onRequestCode}>
              {isSubmittingCode ? 'Sending code...' : 'Send code'}
            </Button>
          ) : (
            <div className="space-y-2">
              <Button className="w-full" type="submit" disabled={isSubmittingCode}>
                {isSubmittingCode ? 'Verifying...' : 'Verify & sign in'}
              </Button>
              <button
                type="button"
                onClick={onRequestCode}
                className="w-full rounded-md px-3 py-2 text-sm font-medium text-neutral-300 transition hover:bg-neutral-900 hover:text-neutral-50"
              >
                Resend code
              </button>
            </div>
          )}
        </form>
      )}

      <div className="mt-6">
        <OAuthButtons nextPath={nextPath} />
      </div>

      {serverMessage ? <p className="mt-4 text-sm text-emerald-300">{serverMessage}</p> : null}
      {serverError ? <p className="mt-4 text-sm text-rose-400">{serverError}</p> : null}
      {mode === 'password' && verificationHelpEmail ? (
        <p className="mt-3 text-center text-sm text-neutral-300">
          <Link
            href={`/auth/check-inbox?email=${encodeURIComponent(verificationHelpEmail)}`}
            className="font-medium text-emerald-300 underline-offset-2 hover:text-emerald-200 hover:underline"
          >
            Didn&apos;t get the email? Open the verification page
          </Link>
        </p>
      ) : null}

      <p className="mt-4 text-sm text-neutral-300">
        No account?{' '}
        <Link href="/auth/signup" className="font-medium text-emerald-300 hover:text-emerald-200">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
