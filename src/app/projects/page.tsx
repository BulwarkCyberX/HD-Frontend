'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { DashboardSidebar } from '@/components/dashboard-sidebar';
import { ProtectedRoute } from '@/components/protected-route';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@hackersdeal/ui';
import { ApiError } from '@/lib/api/auth';
import { getProjects, type ProjectItem } from '@/lib/api/projects';
import { useAuth } from '@/hooks/auth-context';

export default function ProjectsPage() {
  const searchParams = useSearchParams();
  const { token, logout, user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (!token) {
      setProjects([]);
      setLoading(false);
      return;
    }

    const run = async () => {
      setErrorMessage('');
      try {
        const rows = await getProjects(token);
        setProjects(rows);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [logout, token]);

  return (
    <ProtectedRoute>
      <div className="flex min-h-[calc(100vh-4rem)] bg-slate-100">
        <DashboardSidebar />
        <div className="flex min-h-full flex-1 flex-col">
          <header className="flex h-14 items-center justify-between border-b border-slate-200 bg-white px-4 md:hidden">
            <p className="text-sm font-semibold text-slate-900">Projects</p>
            <Link href="/" className="text-xs font-medium text-emerald-700">
              Exit
            </Link>
          </header>
          <main className="flex-1 p-4 sm:p-6 lg:p-8">
            <div className="mx-auto max-w-4xl space-y-5">
              <div>
                <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Projects</h1>
                <p className="mt-2 text-sm text-slate-600">
                  Real project list from backend `/projects`.
                </p>
                <div className="mt-4">
                  {user?.role === 'CLIENT' ? (
                    <Link href="/dashboard/projects/create">
                      <Button>Create Project</Button>
                    </Link>
                  ) : null}
                </div>
              </div>
              {searchParams.get('created') === '1' ? (
                <p className="text-sm text-emerald-700">Project created successfully.</p>
              ) : null}
              {loading ? <p className="text-sm text-slate-600">Loading projects...</p> : null}
              {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
              <div className="space-y-3">
                {projects.map((project) => (
                  <ProjectCard
                    key={project.id}
                    project={project}
                    actionSlot={
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/projects/${project.id}`} className="text-sm text-emerald-700 hover:text-emerald-800">
                          View details
                        </Link>
                        {user?.role === 'PROVIDER' ? (
                          <Link
                            href={`/projects/${project.id}/bid`}
                            className="text-sm text-indigo-700 hover:text-indigo-800"
                          >
                            Submit bid
                          </Link>
                        ) : null}
                      </div>
                    }
                  />
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
}
