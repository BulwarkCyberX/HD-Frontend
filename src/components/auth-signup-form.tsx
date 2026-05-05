'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ApiError, register as registerApi } from '@/lib/api/auth';
import { useAuth } from '@/hooks/auth-context';

const signupSchema = z
  .object({
    name: z.string().min(2, 'Name is required'),
    email: z.string().email('Enter a valid email'),
    password: z.string().min(8, 'Password must be at least 8 characters'),
    confirmPassword: z.string().min(8, 'Confirm your password'),
  })
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthSignupForm() {
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const { setSession } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const onSubmit = async (values: SignupFormValues) => {
    setServerMessage('');
    setServerError('');
    try {
      const result = await registerApi({
        email: values.email,
        password: values.password,
        role: 'CLIENT',
      });
      setSession(result);
      setServerMessage('Registration successful');
      router.push('/dashboard');
    } catch (error) {
      if (error instanceof ApiError) {
        setServerError(error.message);
        return;
      }
      setServerError(error instanceof Error ? error.message : 'Signup failed');
    }
  };

  return (
    <Card className="w-full max-w-md">
      <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Create an account</h1>
      <p className="mt-2 text-sm text-slate-600">
        Account creation is connected to backend auth endpoints.
      </p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="space-y-1.5">
          <label htmlFor="name" className="text-sm font-medium text-slate-700">
            Name
          </label>
          <Input id="name" type="text" placeholder="Security Pro" {...register('name')} />
          {errors.name ? <p className="text-xs text-rose-600">{errors.name.message}</p> : null}
        </div>

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

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-slate-700">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="********"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-rose-600">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button className="w-full" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      {serverMessage ? <p className="mt-4 text-sm text-emerald-700">{serverMessage}</p> : null}
      {serverError ? <p className="mt-4 text-sm text-rose-600">{serverError}</p> : null}

      <p className="mt-4 text-sm text-slate-600">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-emerald-700 hover:text-emerald-800">
          Login
        </Link>
      </p>
    </Card>
  );
}
