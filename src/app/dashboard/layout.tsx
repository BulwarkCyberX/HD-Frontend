import Link from 'next/link';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ProtectedRoute } from '@/components/protected-route';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-4rem)] bg-neutral-950">
        <DashboardSidebar />
        <div className="flex min-h-full flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-neutral-800 bg-neutral-950/80 px-4 backdrop-blur md:hidden">
            <p className="text-sm font-semibold text-neutral-50">Workspace</p>
            <Link href="/" className="text-xs font-medium text-emerald-400 hover:text-emerald-300">
              Exit
            </Link>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">{children}</main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
