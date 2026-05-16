'use client';

import { ProtectedRoute } from '@/components/protected-route';
import { AdminNav } from '@/components/admin-nav';
import { useAuth } from '@/hooks/auth-context';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <AdminShell>{children}</AdminShell>
    </ProtectedRoute>
  );
}

function AdminShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  if (user?.role !== 'ADMIN') {
    return (
      <div className="mx-auto max-w-lg py-12 text-center">
        <p className="text-sm text-slate-600">Admin access required.</p>
      </div>
    );
  }
  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-1 py-2 sm:px-2">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Admin panel</h1>
        <p className="mt-1 text-sm text-slate-600">Manage projects, triage, templates, and platform settings.</p>
      </div>
      <AdminNav />
      {children}
    </div>
  );
}
