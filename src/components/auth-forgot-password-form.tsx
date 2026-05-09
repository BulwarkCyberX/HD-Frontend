'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ApiError, forgotPassword } from '@/lib/api/auth';

const schema = z.object({
  email: z.string().email('Enter a valid email'),
});

type FormValues = z.infer<typeof schema>;

export function AuthForgotPasswordForm() {
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (values: FormValues) => {
    setServerMessage('');
    setServerError('');
    try {
      await forgotPassword(values.email);
      setServerMessage('If an account exists for that email, we sent reset instructions.');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Request failed');
    }
  };

  return (
    <Card surface="dark" className="w-full max-w-md hd-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Forgot password</h1>
      <p className="mt-2 text-sm text-neutral-300">We will email you a secure link (valid for 1 hour) if the address is registered and verified.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-neutral-200">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-rose-400">{errors.email.message}</p> : null}
        </div>
        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending…' : 'Send reset link'}
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
