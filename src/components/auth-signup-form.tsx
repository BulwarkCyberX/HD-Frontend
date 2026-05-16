'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Card, Input } from '@hackersdeal/ui';
import { OAuthButtons } from '@/components/oauth-buttons';
import { ApiError, checkEmailAvailability, register as registerApi, type AuthResponse } from '@/lib/api/auth';
import { useAuth } from '@/hooks/auth-context';

const countries = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'IN', name: 'India' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
] as const;

function passwordRules(pw: string) {
  const v = pw ?? '';
  return {
    length: v.length >= 12,
    lower: /[a-z]/.test(v),
    upper: /[A-Z]/.test(v),
    number: /\d/.test(v),
    special: /[^\w\s]/.test(v),
    noSpaces: !/\s/.test(v),
  };
}

const signupSchema = z
  .object({
    firstName: z.string().min(1, 'First name is required').max(80),
    lastName: z.string().min(1, 'Last name is required').max(80),
    email: z.string().email('Enter a valid email'),
    country: z.string().length(2, 'Select a country'),
    city: z.string().min(1, 'City is required').max(120),
    state: z.string().min(1, 'State is required').max(120),
    postalCode: z.string().min(2, 'Postal code is required').max(16),
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
  .refine((values) => values.password === values.confirmPassword, {
    path: ['confirmPassword'],
    message: 'Passwords must match',
  });

type SignupFormValues = z.infer<typeof signupSchema>;

export function AuthSignupForm() {
  const [serverMessage, setServerMessage] = useState('');
  const [serverError, setServerError] = useState('');
  const [emailStatus, setEmailStatus] = useState<{ state: 'idle' | 'checking' | 'ok' | 'taken'; message?: string }>(
    { state: 'idle' },
  );
  const [autoStateBusy, setAutoStateBusy] = useState(false);
  const { setSession } = useAuth();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({ resolver: zodResolver(signupSchema) });

  const watchEmail = watch('email');
  const watchPassword = watch('password');
  const watchCountry = watch('country');
  const watchPostal = watch('postalCode');

  const pw = useMemo(() => passwordRules(watchPassword ?? ''), [watchPassword]);
  const pwScore = (Object.values(pw).filter(Boolean).length / Object.keys(pw).length) * 100;

  useEffect(() => {
    const email = (watchEmail ?? '').trim().toLowerCase();
    if (!email) {
      setEmailStatus({ state: 'idle' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailStatus({ state: 'idle' });
      return;
    }

    setEmailStatus({ state: 'checking' });
    const t = setTimeout(() => {
      checkEmailAvailability(email)
        .then((res) => {
          setEmailStatus(res.available ? { state: 'ok' } : { state: 'taken', message: 'Email is already registered' });
        })
        .catch(() => setEmailStatus({ state: 'idle' }));
    }, 450);

    return () => clearTimeout(t);
  }, [watchEmail]);

  useEffect(() => {
    const cc = (watchCountry ?? '').trim().toLowerCase();
    const postal = (watchPostal ?? '').trim();
    if (!cc || !postal || postal.length < 3) return;

    setAutoStateBusy(true);
    const t = setTimeout(() => {
      fetch(`https://api.zippopotam.us/${encodeURIComponent(cc)}/${encodeURIComponent(postal)}`, { cache: 'no-store' })
        .then(async (r) => (r.ok ? ((await r.json()) as any) : null))
        .then((json) => {
          const place = json?.places?.[0];
          const state = place?.state || place?.['state abbreviation'];
          const city = place?.['place name'];
          if (state) setValue('state', String(state), { shouldValidate: true });
          if (city) setValue('city', String(city), { shouldValidate: true });
        })
        .catch(() => {
          // ignore
        })
        .finally(() => setAutoStateBusy(false));
    }, 400);

    return () => clearTimeout(t);
  }, [setValue, watchCountry, watchPostal]);

  const onSubmit = async (values: SignupFormValues) => {
    setServerMessage('');
    setServerError('');
    try {
      const result = await registerApi({
        firstName: values.firstName,
        lastName: values.lastName,
        email: values.email,
        country: values.country,
        city: values.city,
        state: values.state,
        postalCode: values.postalCode,
        password: values.password,
        role: 'CLIENT',
      });
      if ('needsEmailVerification' in result) {
        router.push(`/auth/check-inbox?email=${encodeURIComponent(result.email)}`);
        return;
      }
      setSession(result as AuthResponse);
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
    <Card surface="dark" className="w-full max-w-md hd-fade-up">
      <h1 className="text-2xl font-semibold tracking-tight text-neutral-50">Create an account</h1>
      <p className="mt-2 text-sm text-neutral-300">Sign up with your details and a strong password.</p>

      <form className="mt-6 space-y-4" onSubmit={handleSubmit(onSubmit)}>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="firstName" className="text-sm font-medium text-neutral-200">
              First Name
            </label>
            <Input id="firstName" type="text" placeholder="Naresh" {...register('firstName')} />
            {errors.firstName ? <p className="text-xs text-rose-400">{errors.firstName.message}</p> : null}
          </div>
          <div className="space-y-1.5">
            <label htmlFor="lastName" className="text-sm font-medium text-neutral-200">
              Last Name
            </label>
            <Input id="lastName" type="text" placeholder="Dagla" {...register('lastName')} />
            {errors.lastName ? <p className="text-xs text-rose-400">{errors.lastName.message}</p> : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="text-sm font-medium text-neutral-200">
            Email
          </label>
          <Input id="email" type="email" placeholder="you@example.com" {...register('email')} />
          {errors.email ? <p className="text-xs text-rose-400">{errors.email.message}</p> : null}
          {emailStatus.state === 'checking' ? (
            <p className="text-xs text-neutral-500">Checking availability…</p>
          ) : emailStatus.state === 'taken' ? (
            <p className="text-xs text-rose-400">{emailStatus.message}</p>
          ) : emailStatus.state === 'ok' ? (
            <p className="text-xs text-emerald-300">Email available</p>
          ) : null}
          {emailStatus.state === 'ok' ? (
            <div className="mt-3 overflow-hidden rounded-lg border border-emerald-500/25 bg-emerald-500/5 px-3 py-3 transition-opacity duration-300">
              <p className="text-xs font-medium text-emerald-200">Email verification</p>
              <p className="mt-1 text-xs leading-relaxed text-neutral-300">
                After you create your account, we will send a <strong className="text-neutral-100">6-digit code</strong>{' '}
                and a secure link to this address. The link stays valid for <strong className="text-neutral-100">24 hours</strong>.
                You will enter the code on the next screen to confirm it is really yours.
              </p>
            </div>
          ) : null}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="country" className="text-sm font-medium text-neutral-200">
              Country
            </label>
            <select
              id="country"
              className="w-full rounded-md border border-neutral-800 bg-neutral-950/40 px-3 py-2 text-sm text-neutral-50 shadow-sm outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/25"
              {...register('country')}
              defaultValue=""
            >
              <option value="" disabled>
                Select country
              </option>
              {countries.map((c) => (
                <option key={c.code} value={c.code}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.country ? <p className="text-xs text-rose-400">{errors.country.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="postalCode" className="text-sm font-medium text-neutral-200">
              Postal Code
            </label>
            <Input id="postalCode" type="text" placeholder="411001" {...register('postalCode')} />
            {errors.postalCode ? <p className="text-xs text-rose-400">{errors.postalCode.message}</p> : null}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1.5">
            <label htmlFor="city" className="text-sm font-medium text-neutral-200">
              City
            </label>
            <Input id="city" type="text" placeholder="Pune" {...register('city')} />
            {errors.city ? <p className="text-xs text-rose-400">{errors.city.message}</p> : null}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="state" className="text-sm font-medium text-neutral-200">
              State {autoStateBusy ? <span className="text-xs text-neutral-500">(auto)</span> : null}
            </label>
            <Input id="state" type="text" placeholder="Maharashtra" {...register('state')} />
            {errors.state ? <p className="text-xs text-rose-400">{errors.state.message}</p> : null}
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="text-sm font-medium text-neutral-200">
            Password
          </label>
          <Input id="password" type="password" placeholder="••••••••" {...register('password')} />
          {errors.password ? (
            <p className="text-xs text-rose-400">{errors.password.message}</p>
          ) : null}
          <div className="mt-2 rounded-md border border-neutral-800 bg-neutral-950/40 p-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium text-neutral-300">Password strength</p>
              <p className="text-xs text-neutral-500">{Math.round(pwScore)}%</p>
            </div>
            <div className="mt-2 h-2 w-full rounded-full bg-neutral-900">
              <div
                className="h-2 rounded-full bg-emerald-400 transition-[width]"
                style={{ width: `${Math.min(100, Math.max(0, pwScore))}%` }}
              />
            </div>
            <ul className="mt-2 grid gap-1 text-xs text-neutral-400 sm:grid-cols-2">
              <li className={pw.length ? 'text-emerald-300' : undefined}>12+ characters</li>
              <li className={pw.upper ? 'text-emerald-300' : undefined}>Uppercase</li>
              <li className={pw.lower ? 'text-emerald-300' : undefined}>Lowercase</li>
              <li className={pw.number ? 'text-emerald-300' : undefined}>Number</li>
              <li className={pw.special ? 'text-emerald-300' : undefined}>Special character</li>
              <li className={pw.noSpaces ? 'text-emerald-300' : undefined}>No spaces</li>
            </ul>
          </div>
        </div>

        <div className="space-y-1.5">
          <label htmlFor="confirmPassword" className="text-sm font-medium text-neutral-200">
            Confirm Password
          </label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            {...register('confirmPassword')}
          />
          {errors.confirmPassword ? (
            <p className="text-xs text-rose-400">{errors.confirmPassword.message}</p>
          ) : null}
        </div>

        <Button
          className="w-full"
          type="submit"
          disabled={isSubmitting || emailStatus.state === 'checking' || emailStatus.state === 'taken'}
        >
          {isSubmitting ? 'Creating account...' : 'Create account'}
        </Button>
      </form>

      <div className="mt-6">
        <OAuthButtons nextPath="/dashboard" />
      </div>

      {serverMessage ? <p className="mt-4 text-sm text-emerald-300">{serverMessage}</p> : null}
      {serverError ? <p className="mt-4 text-sm text-rose-400">{serverError}</p> : null}

      <p className="mt-4 text-sm text-neutral-300">
        Already have an account?{' '}
        <Link href="/auth/login" className="font-medium text-emerald-300 hover:text-emerald-200">
          Login
        </Link>
      </p>
    </Card>
  );
}
