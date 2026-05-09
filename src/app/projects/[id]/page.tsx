'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge, Button, Card } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { ApiError, getProviderProfile, type AuthUser } from '@/lib/api/auth';
import { getBidsForProject, type BidItem, updateBidStatus } from '@/lib/api/bids';
import { getProjectById, getPublicProjectById, type ProjectItem } from '@/lib/api/projects';

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const { token, user, logout } = useAuth();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [selectedProviderProfile, setSelectedProviderProfile] = useState<AuthUser | null>(null);
  const [bids, setBids] = useState<BidItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const canAccessWorkspace = Boolean(
    project &&
      user &&
      (project.clientId === user.id || project.selectedProviderId === user.id),
  );

  useEffect(() => {
    const run = async () => {
      setErrorMessage('');
      try {
        const projectRow = token ? await getProjectById(token, params.id) : await getPublicProjectById(params.id);
        setProject(projectRow);
        if (token && projectRow.selectedProviderId) {
          const providerRow = await getProviderProfile(token, projectRow.selectedProviderId);
          setSelectedProviderProfile(providerRow);
        } else {
          setSelectedProviderProfile(null);
        }

        if (token && user?.role === 'CLIENT') {
          const bidRows = await getBidsForProject(token, params.id);
          setBids(bidRows);
        }
      } catch (error) {
        if (token && error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load project');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [logout, params.id, token, user?.role]);

  const handleStatusUpdate = async (bidId: string, status: 'ACCEPTED' | 'REJECTED') => {
    if (!token) return;
    try {
      const updated = await updateBidStatus(token, bidId, status);
      setBids((prev) => prev.map((bid) => (bid.id === updated.id ? { ...bid, status: updated.status } : bid)));
      const refreshedProject = await getProjectById(token, params.id);
      setProject(refreshedProject);
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to update bid');
    }
  };

  return (
    <div className="mx-auto w-full max-w-5xl px-1 py-2 sm:px-2 sm:py-4">
      {loading ? <p className="text-sm text-slate-600">Loading project...</p> : null}
      {errorMessage ? <p className="mb-4 text-sm text-rose-400">{errorMessage}</p> : null}

      {project ? (
        <div className="space-y-6">
          <Card className="hd-fade-up">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h1 className="text-2xl font-semibold text-slate-900">{project.title}</h1>
                <p className="mt-2 text-sm text-slate-600">{project.description}</p>
              </div>
              <Badge tone={project.status === 'COMPLETED' || project.status === 'ACTIVE' ? 'success' : 'warning'}>
                {project.status}
              </Badge>
            </div>
            <div className="mt-4 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
              <p>
                <span className="font-medium text-slate-900">Cost:</span>{' '}
                {project.budgetType === 'HOURLY' ? `₹${project.budgetAmount}/hr` : `₹${project.budgetAmount}`}{' '}
                <span className="text-slate-500">({project.budgetType})</span>
              </p>
              <p>
                <span className="font-medium text-slate-900">Timeline:</span> {project.timeline}
              </p>
              <p>
                <span className="font-medium text-slate-900">Testing Window:</span> {project.testingWindow}
              </p>
              <p>
                <span className="font-medium text-slate-900">Visibility:</span> {project.visibility}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Link href="/projects" className="text-sm font-medium text-tropical-jade-700 hover:text-tropical-jade-600">
                Back to projects
              </Link>
              {canAccessWorkspace ? (
                <Link
                  href={`/dashboard/projects/${project.id}`}
                  className="text-sm font-medium text-slate-800 hover:text-slate-950"
                >
                  Open workspace
                </Link>
              ) : null}
              {user?.role === 'PROVIDER' ? (
                <Link
                  href={token ? `/projects/${project.id}/bid` : `/auth/login?next=${encodeURIComponent(`/projects/${project.id}/bid`)}`}
                >
                  <Button variant="secondary">Bid on this project</Button>
                </Link>
              ) : (
                <Link href={`/auth/login?next=${encodeURIComponent(`/projects/${project.id}`)}`}>
                  <Button variant="secondary">Login to bid / chat</Button>
                </Link>
              )}
            </div>
            {selectedProviderProfile?.providerProfile ? (
              <div className="mt-4 rounded-md border border-tropical-jade-200 bg-tropical-sage-100/80 p-3 text-xs text-slate-700">
                <p className="mb-1 font-medium text-slate-900">Selected Provider Reputation</p>
                <p>
                  Rating: {selectedProviderProfile.providerProfile.rating.toFixed(1)} | Reviews:{' '}
                  {selectedProviderProfile.providerProfile.totalReviews} | Completed:{' '}
                  {selectedProviderProfile.providerProfile.completedProjects}
                </p>
                <p>
                  Valid reports: {selectedProviderProfile.providerProfile.validReportCount} | Reputation score:{' '}
                  {selectedProviderProfile.providerProfile.reputationScore.toFixed(2)}
                </p>
              </div>
            ) : null}
          </Card>

          {token && user?.role === 'CLIENT' ? (
            <section className="space-y-4 hd-fade-in">
              <h2 className="text-xl font-semibold text-slate-900">Bids</h2>
              {bids.length === 0 ? (
                <p className="text-sm text-slate-600">No bids submitted yet.</p>
              ) : (
                bids.map((bid) => (
                  <Card key={bid.id}>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm font-medium text-slate-900">
                          Provider: {bid.provider?.email ?? bid.providerId}
                        </p>
                        <p className="mt-2 text-sm text-slate-600">{bid.proposal}</p>
                        <p className="mt-2 text-xs text-slate-500">
                          Price: {bid.price} | Timeline: {bid.timeline}
                        </p>
                        {bid.provider?.providerProfile ? (
                          <p className="mt-1 text-xs text-slate-500">
                            Rating: {bid.provider.providerProfile.rating.toFixed(1)} | Reviews:{' '}
                            {bid.provider.providerProfile.totalReviews} | Completed:{' '}
                            {bid.provider.providerProfile.completedProjects} | Valid reports:{' '}
                            {bid.provider.providerProfile.validReportCount} | Reputation:{' '}
                            {bid.provider.providerProfile.reputationScore.toFixed(2)}
                          </p>
                        ) : null}
                      </div>
                      <Badge
                        tone={bid.status === 'ACCEPTED' ? 'success' : bid.status === 'REJECTED' ? 'warning' : 'default'}
                      >
                        {bid.status}
                      </Badge>
                    </div>

                    {bid.status === 'PENDING' ? (
                      <div className="mt-4 flex gap-2">
                        <Button type="button" onClick={() => handleStatusUpdate(bid.id, 'ACCEPTED')}>
                          Accept
                        </Button>
                        <Button type="button" variant="secondary" onClick={() => handleStatusUpdate(bid.id, 'REJECTED')}>
                          Reject
                        </Button>
                      </div>
                    ) : null}
                  </Card>
                ))
              )}
            </section>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
