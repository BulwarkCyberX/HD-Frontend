import { AuthResetPasswordForm } from '@/components/auth-reset-password-form';

export default function ResetPasswordPage() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <AuthResetPasswordForm />
    </main>
  );
}
