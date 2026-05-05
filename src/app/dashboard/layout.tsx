import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100">
        <DashboardSidebar />
        <div className="flex min-h-full flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
            <p className="text-sm font-semibold text-slate-900">Workspace</p>
            <Link href="/" className="text-xs font-medium text-emerald-700">
              Exit
            </Link>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
