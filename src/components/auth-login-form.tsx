'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ApiError, login } from '@/lib/api/auth';
import { useAuth } from '@/hooks/auth-context';

const loginSchema = z.object({
  email: z.string().email('Enter a valid email'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function AuthLoginForm() {
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const { setSession } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next') || '/dashboard';

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (values: LoginFormValues) => {
    setServerMessage('');
    setServerError('');
    try {
      const result = await login(values);
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
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Login</h1>
      <p className="mt-2 text-sm text-slate-600">
        This form validates input and authenticates against backend `/auth/login`.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-rose-600">{errors.email.message}</p> : null}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">
            Password
          </label>
          <Input id="password" type="password" placeholder="********" {...register('password')} />
          {errors.password ? (
            <p className="text-xs text-rose-600">{errors.password.message}</p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Signing in...' : 'Sign in'}
        </Button>
      </form>

      {serverMessage ? <p className="mt-4 text-sm text-emerald-700">{serverMessage}</p> : null}
      {serverError ? <p className="mt-4 text-sm text-rose-600">{serverError}</p> : null}

      <p className="mt-4 text-sm text-slate-600">
        No account?{' '}
        <Link href="/auth/signup" className="font-medium text-emerald-700 hover:text-emerald-800">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
