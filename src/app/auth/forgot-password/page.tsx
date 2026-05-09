import { AuthForgotPasswordForm } from '@/components/auth-forgot-password-form';

export default function ForgotPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <AuthForgotPasswordForm />
    </main>
  );
}
