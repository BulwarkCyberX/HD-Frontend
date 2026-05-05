import { AuthSignupForm } from '@/components/auth-signup-form';

export default function SignupPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <AuthSignupForm />
    </main>
  );
}
