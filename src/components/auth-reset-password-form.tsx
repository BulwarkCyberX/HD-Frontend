'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Suspense, useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ApiError, resetPassword } from '@/lib/api/auth';

const schema = z
  .object({
    password: z
      .string()
      .min(12, 'Password must be at least 12 characters')
      .max(128)
      .regex(/[a-z]/, 'Add a lowercase letter')
      .regex(/[A-Z]/, 'Add an uppercase letter')
      .regex(/\d/, 'Add a number')
      .regex(/[^\w\s]/, 'Add a special character')
      .refine((v) => !/\s/.test(v), 'Password cannot contain spaces'),
    confirmPassword: z.string().min(12, 'Confirm your password'),
  })
  .refine((v) => v.password === v.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type FormValues = z.infer<typeof schema>;

function AuthResetPasswordFormInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = useMemo(() => searchParams.get('token')?.trim() ?? '', [searchParams]);
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    if (!token) {
      setServerError('Invalid or missing reset link.');
      return;
    }
    setServerMessage('');
    setServerError('');
    try {
      await resetPassword({ token, password: values.password });
      setServerMessage('Password updated. Redirecting to sign in…');
      router.replace('/auth/login');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Reset failed');
    }
  };

  if (!token) {
    return (
      <Card surface="dark" className="w-full max-w-md hd-fade-up">
        <p className="text-sm text-rose-400">This page needs a valid reset link from your email.</p>
        <p className="mt-4 text-sm text-neutral-300">
          <Link href="/auth/forgot-password" className="font-medium text-emerald-300 hover:text-emerald-200">
            Request a new link
          </Link>
        </p>
      </Card>
    );
  }

  return (
    <Card surface="dark" className="w-full max-w-md hd-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Set a new password</h1>
      <p className="mt-2 text-sm text-neutral-300">Choose a strong password for your account.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-neutral-200">
            New password
          </label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password ? <p className="text-xs text-rose-400">{errors.password.message}</p> : null}
        </div>
        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-200">
            Confirm password
          </label>
          <Input id="confirmPassword" type="password" placeholder="••••••••" {...register('confirmPassword')} />
          {errors.confirmPassword ? (
            <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
          ) : null}
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving…' : 'Update password'}
        </Button>
      </form>

      {serverMessage ? <p className="mt-4 text-sm text-emerald-300">{serverMessage}</p> : null}
      {serverError ? <p className="mt-4 text-sm text-rose-400">{serverError}</p> : null}

      <p className="mt-4 text-sm text-neutral-300">
        <Link href="/auth/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Back to sign in
        </Link>
      </p>
    </Card>
  );
}

export function AuthResetPasswordForm() {
  return (
    <Suspense fallback={<p className="text-sm text-neutral-400">Loading…</p>}>
      <AuthResetPasswordFormInner />
    </Suspense>
  );
}
