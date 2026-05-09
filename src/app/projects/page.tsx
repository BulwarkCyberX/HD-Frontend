'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ProjectCard } from '@/components/project-card';
import { Button } from '@hackersdeal/ui';
import { ApiError } from '@/lib/api/auth';
import { getPublicProjects, type ProjectItem } from '@/lib/api/projects';
import { useAuth } from '@/hooks/auth-context';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<ProjectItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const run = async () => {
      setErrorMessage('');
      try {
        const rows = await getPublicProjects();
        setProjects(rows);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load projects');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, []);

  return (
    <main className="mx-auto min-h-[calc(100vh-4rem)] w-full max-w-5xl px-4 py-10 sm:px-6">
      <div className="space-y-5">
        <div className="hd-fade-up">
          <h1 className="text-3xl font-semibold tracking-tight text-neutral-50">Open Projects</h1>
          <p className="mt-2 text-sm text-neutral-300">
            Browse public projects. You can view scope and pricing without logging in.
          </p>
          <div className="mt-4">
            {user?.role === 'CLIENT' ? (
              <Link href="/dashboard/projects/create">
                <Button>Create Project</Button>
              </Link>
            ) : null}
          </div>
        </div>

        {loading ? <p className="text-sm text-neutral-300">Loading projects...</p> : null}
        {errorMessage ? <p className="text-sm text-rose-400">{errorMessage}</p> : null}

        <div className="space-y-3 hd-fade-in">
          {projects.map((project) => {
            const next = encodeURIComponent(`/projects/${project.id}/bid`);
            return (
              <ProjectCard
                key={project.id}
                project={project}
                actionSlot={
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/projects/${project.id}`}
                      className="text-sm font-medium text-emerald-300 hover:text-emerald-200"
                    >
                      View details
                    </Link>
                    {user?.role === 'PROVIDER' ? (
                      <Link
                        href={`/projects/${project.id}/bid`}
                        className="text-sm font-medium text-neutral-200 hover:text-neutral-50"
                      >
                        Submit bid
                      </Link>
                    ) : (
                      <Link
                        href={`/auth/login?next=${next}`}
                        className="text-sm font-medium text-neutral-300 hover:text-neutral-50"
                      >
                        Login to bid
                      </Link>
                    )}
                  </div>
                }
              />
            );
          })}
        </div>
      </div>
    </main>
  );
}
