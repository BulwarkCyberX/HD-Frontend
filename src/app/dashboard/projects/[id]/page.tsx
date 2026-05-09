'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams } from 'next/navigation';
import { Badge, Button, Card } from '@hackersdeal/ui';
import { FileAttachmentControl } from '@/components/file-attachment-control';
import { StarRating } from '@/components/star-rating';
import { useAuth } from '@/hooks/auth-context';
import { aiReviewReport } from '@/lib/api/ai';
import { ApiError } from '@/lib/api/auth';
import { fetchAuthenticatedFile } from '@/lib/api/files';
import { getMessages, sendMessage, type WorkspaceMessage } from '@/lib/api/messages';
import { completeProject, depositPayment, releasePayment } from '@/lib/api/payments';
import { getProjectById, type ProjectItem } from '@/lib/api/projects';
import { createReport, getReports, type WorkspaceReport } from '@/lib/api/reports';
import { createReview } from '@/lib/api/reviews';
import { getReportStatusTone } from '@/lib/reports/status';

type WorkspaceTab = 'chat' | 'reports';

export default function ProjectWorkspacePage() {
  const params = useParams<{ id: string }>();
  const { token, user, logout } = useAuth();
  const [project, setProject] = useState<ProjectItem | null>(null);
  const [messages, setMessages] = useState<WorkspaceMessage[]>([]);
  const [reports, setReports] = useState<WorkspaceReport[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [activeTab, setActiveTab] = useState<WorkspaceTab>('chat');
  const [reportForm, setReportForm] = useState({
    title: '',
    description: '',
    severity: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  });
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [actionMessage, setActionMessage] = useState('');
  const [isSendingMessage, setIsSendingMessage] = useState(false);
  const [isSubmittingReport, setIsSubmittingReport] = useState(false);
  const [isDepositing, setIsDepositing] = useState(false);
  const [isCompleting, setIsCompleting] = useState(false);
  const [isReleasing, setIsReleasing] = useState(false);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [depositAmount, setDepositAmount] = useState(1000);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [attachMessageId, setAttachMessageId] = useState<string | null>(null);
  const [attachWorkspaceReportId, setAttachWorkspaceReportId] = useState<string | null>(null);
  const [aiReportHint, setAiReportHint] = useState<string | null>(null);
  const [aiReviewBusy, setAiReviewBusy] = useState(false);

  const isParticipant = useMemo(() => {
    if (!project || !user) return false;
    return project.clientId === user.id || project.selectedProviderId === user.id;
  }, [project, user]);

  const isSelectedProvider = useMemo(() => {
    if (!project || !user) return false;
    return project.selectedProviderId === user.id;
  }, [project, user]);

  const isProjectOwner = useMemo(() => {
    if (!project || !user) return false;
    return project.clientId === user.id;
  }, [project, user]);
  const canSubmitReview = Boolean(isProjectOwner && project?.status === 'COMPLETED' && !project.review);

  const loadWorkspaceData = useCallback(async (authToken: string, projectId: string) => {
    const projectRow = await getProjectById(authToken, projectId);
    setProject(projectRow);

    if (!(user && (projectRow.clientId === user.id || projectRow.selectedProviderId === user.id))) {
      setMessages([]);
      setReports([]);
      return;
    }

    const [messageRows, reportRows] = await Promise.all([
      getMessages(authToken, projectId),
      getReports(authToken, projectId),
    ]);
    setMessages(messageRows);
    setReports(reportRows);
  }, [user]);

  useEffect(() => {
    if (!token) return;
    const run = async () => {
      setErrorMessage('');
      try {
        await loadWorkspaceData(token, params.id);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          logout();
          return;
        }
        setErrorMessage(error instanceof Error ? error.message : 'Unable to load workspace');
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [loadWorkspaceData, logout, params.id, token]);

  useEffect(() => {
    if (!token || !isParticipant) return;
    const interval = setInterval(() => {
      Promise.all([getProjectById(token, params.id), getMessages(token, params.id), getReports(token, params.id)])
        .then(([projectRow, messageRows, reportRows]) => {
          setProject(projectRow);
          setMessages(messageRows);
          setReports(reportRows);
        })
        .catch(() => {
          // Polling errors are intentionally ignored to avoid noisy UX.
        });
    }, 8000);

    return () => clearInterval(interval);
  }, [isParticipant, params.id, token]);

  const handleSendMessage = async () => {
    if (!token || !messageInput.trim()) return;
    setIsSendingMessage(true);
    setActionMessage('');
    try {
      const created = await sendMessage(token, {
        projectId: params.id,
        message: messageInput.trim(),
      });
      setMessages((prev) => [...prev, created]);
      setAttachMessageId(created.id);
      setMessageInput('');
      setActionMessage('Message sent.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to send message');
    } finally {
      setIsSendingMessage(false);
    }
  };

  const handleSubmitReport = async () => {
    if (!token) return;
    setIsSubmittingReport(true);
    setActionMessage('');
    try {
      const created = await createReport(token, {
        projectId: params.id,
        title: reportForm.title,
        description: reportForm.description,
        severity: reportForm.severity,
      });
      setReports((prev) => [created, ...prev]);
      setAttachWorkspaceReportId(created.id);
      setReportForm({ title: '', description: '', severity: 'MEDIUM' });
      setActionMessage('Report submitted.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit report');
    } finally {
      setIsSubmittingReport(false);
    }
  };

  const handleDeposit = async () => {
    if (!token || !project) return;
    if (!Number.isFinite(depositAmount) || depositAmount <= 0) {
      setErrorMessage('Deposit amount must be greater than 0');
      return;
    }
    setIsDepositing(true);
    setActionMessage('');
    try {
      await depositPayment(token, {
        projectId: project.id,
        amount: depositAmount,
        currency: 'INR',
      });
      await loadWorkspaceData(token, project.id);
      setActionMessage('Payment deposited to escrow.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to deposit payment');
    } finally {
      setIsDepositing(false);
    }
  };

  const handleCompleteProject = async () => {
    if (!token || !project) return;
    setIsCompleting(true);
    setActionMessage('');
    try {
      await completeProject(token, project.id);
      await loadWorkspaceData(token, project.id);
      setActionMessage('Project marked as completed.');
    } catch (error) {
      if (
        error instanceof ApiError &&
        error.message.includes('explicitClientConfirmation') &&
        window.confirm('No validated report found yet. Do you still want to mark this project as completed?')
      ) {
        try {
          await completeProject(token, project.id, { explicitClientConfirmation: true });
          await loadWorkspaceData(token, project.id);
          setActionMessage('Project marked as completed with explicit client confirmation.');
          return;
        } catch (innerError) {
          setErrorMessage(innerError instanceof Error ? innerError.message : 'Unable to complete project');
          return;
        }
      }
      setErrorMessage(error instanceof Error ? error.message : 'Unable to complete project');
    } finally {
      setIsCompleting(false);
    }
  };

  const handleReleasePayment = async () => {
    if (!token || !project) return;
    if (!window.confirm('Release escrow payment to provider? This action should happen only after delivery review.')) {
      return;
    }
    setIsReleasing(true);
    setActionMessage('');
    try {
      await releasePayment(token, { projectId: project.id });
      await loadWorkspaceData(token, project.id);
      setActionMessage('Payment released to provider.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to release payment');
    } finally {
      setIsReleasing(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!token || !project || !canSubmitReview) return;
    setIsSubmittingReview(true);
    setActionMessage('');
    try {
      await createReview(token, {
        projectId: project.id,
        rating: reviewRating,
        comment: reviewComment.trim() || undefined,
      });
      await loadWorkspaceData(token, project.id);
      setReviewComment('');
      setActionMessage('Review submitted and provider reputation updated.');
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : 'Unable to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <div className="space-y-4">
      {loading ? <p className="text-sm text-slate-600">Loading workspace...</p> : null}
      {errorMessage ? <p className="text-sm text-rose-600">{errorMessage}</p> : null}
      {actionMessage ? <p className="text-sm text-emerald-700">{actionMessage}</p> : null}

      {project ? (
        <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)]">
          <Card className="space-y-3">
            <h1 className="text-xl font-semibold text-slate-900">{project.title}</h1>
            <p className="text-sm text-slate-600">{project.description}</p>
            <div className="space-y-1 text-sm text-slate-600">
              <p>
                <span className="font-medium text-slate-900">Status:</span> {project.status}
              </p>
              <p>
                <span className="font-medium text-slate-900">Testing Window:</span> {project.testingWindow}
              </p>
              <p>
                <span className="font-medium text-slate-900">Timeline:</span> {project.timeline}
              </p>
              <p>
                <span className="font-medium text-slate-900">Budget:</span> {project.budgetType} ({project.budgetAmount})
              </p>
              <p>
                <span className="font-medium text-slate-900">Payment:</span>{' '}
                {project.payment ? `${project.payment.status} (${project.payment.amount} ${project.payment.currency})` : 'Not deposited'}
              </p>
            </div>
            <div>
              <p className="mb-1 text-sm font-medium text-slate-900">In Scope</p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
                {project.inScope.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>

            {isProjectOwner ? (
              <div className="space-y-2 rounded-md border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-900">Escrow Flow</p>
                {!project.payment ? (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">Step 1: Deposit payment to escrow</p>
                    <input
                      type="number"
                      min={1}
                      className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                      value={depositAmount}
                      onChange={(e) => setDepositAmount(Number(e.target.value))}
                    />
                    <Button type="button" disabled={isDepositing} onClick={handleDeposit}>
                      {isDepositing ? 'Depositing...' : 'Deposit Payment'}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-slate-600">
                      Step 2: Work in progress (status: {project.status})
                    </p>
                    {project.status !== 'COMPLETED' ? (
                      <Button type="button" variant="secondary" disabled={isCompleting} onClick={handleCompleteProject}>
                        {isCompleting ? 'Updating...' : 'Mark as Completed'}
                      </Button>
                    ) : null}
                    {project.status === 'COMPLETED' && project.payment.status === 'IN_ESCROW' ? (
                      <Button type="button" disabled={isReleasing} onClick={handleReleasePayment}>
                        {isReleasing ? 'Releasing...' : 'Release Payment'}
                      </Button>
                    ) : null}
                  </div>
                )}
              </div>
            ) : null}
            {isSelectedProvider ? (
              <div className="rounded-md border border-slate-200 p-3 text-sm text-slate-600">
                {project.payment?.status === 'RELEASED'
                  ? 'Payment released. Escrow transfer marked complete.'
                  : `Payment status: ${project.payment?.status ?? 'NOT_DEPOSITED'}`}
              </div>
            ) : null}
            {project.selectedProvider?.providerProfile ? (
              <div className="rounded-md border border-slate-200 p-3 text-xs text-slate-600">
                <p className="mb-1 font-semibold text-slate-900">Provider Reputation</p>
                <p>
                  Rating: {project.selectedProvider.providerProfile.rating.toFixed(1)} | Reviews:{' '}
                  {project.selectedProvider.providerProfile.totalReviews}
                </p>
                <p>
                  Completed: {project.selectedProvider.providerProfile.completedProjects} | Valid reports:{' '}
                  {project.selectedProvider.providerProfile.validReportCount}
                </p>
                <p>Reputation score: {project.selectedProvider.providerProfile.reputationScore.toFixed(2)}</p>
              </div>
            ) : null}
          </Card>

          <Card>
            {!isParticipant ? (
              <p className="text-sm text-rose-600">
                You are not part of this workspace. Only project owner and selected provider can access.
              </p>
            ) : (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      activeTab === 'chat' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                    onClick={() => setActiveTab('chat')}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    className={`rounded-md px-3 py-1.5 text-sm ${
                      activeTab === 'reports' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700'
                    }`}
                    onClick={() => setActiveTab('reports')}
                  >
                    Reports
                  </button>
                </div>

                {activeTab === 'chat' ? (
                  <div className="space-y-3">
                    <div className="max-h-[340px] space-y-2 overflow-y-auto rounded-md border border-slate-200 p-3">
                      {messages.length === 0 ? (
                        <p className="text-sm text-slate-500">No messages yet.</p>
                      ) : (
                        messages.map((msg) => (
                          <div key={msg.id} className="rounded-md bg-slate-50 p-2">
                            <p className="text-xs text-slate-500">
                              {msg.sender.email} ({msg.sender.role})
                            </p>
                            <p className="text-sm text-slate-700">{msg.message}</p>
                            {msg.files?.length && token ? (
                              <ul className="mt-1 space-y-0.5 border-t border-slate-200 pt-1">
                                {msg.files.map((f) => (
                                  <li key={f.id}>
                                    <AuthFileLink token={token} fileId={f.id} name={f.originalName} />
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="flex gap-2">
                      <input
                        className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                        placeholder="Type your message..."
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                      />
                      <Button type="button" disabled={isSendingMessage} onClick={handleSendMessage}>
                        {isSendingMessage ? 'Sending...' : 'Send'}
                      </Button>
                    </div>
                    {token && attachMessageId ? (
                      <div className="rounded-md border border-dashed border-slate-300 p-2">
                        <p className="mb-2 text-xs text-slate-600">
                          Attach evidence to your last message (optional):
                        </p>
                        <FileAttachmentControl
                          token={token}
                          target={{ messageId: attachMessageId }}
                          label="Upload attachment"
                          onUploaded={() => setActionMessage('File attached to message.')}
                        />
                      </div>
                    ) : null}
                  </div>
                ) : (
                  <div className="space-y-4">
                    {isSelectedProvider ? (
                      <div className="space-y-2 rounded-md border border-slate-200 p-3">
                        <p className="text-sm font-medium text-slate-900">Submit Report</p>
                        <input
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          placeholder="Title"
                          value={reportForm.title}
                          onChange={(e) => setReportForm((prev) => ({ ...prev, title: e.target.value }))}
                        />
                        <textarea
                          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                          rows={4}
                          placeholder="Description"
                          value={reportForm.description}
                          onChange={(e) =>
                            setReportForm((prev) => ({ ...prev, description: e.target.value }))
                          }
                        />
                        <div className="flex flex-wrap items-center gap-2">
                          <select
                            className="rounded-md border border-slate-300 px-3 py-2 text-sm"
                            value={reportForm.severity}
                            onChange={(e) =>
                              setReportForm((prev) => ({
                                ...prev,
                                severity: e.target.value as 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
                              }))
                            }
                          >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                            <option value="CRITICAL">CRITICAL</option>
                          </select>
                          <Button
                            type="button"
                            variant="secondary"
                            disabled={aiReviewBusy || !token}
                            onClick={async () => {
                              if (!token) return;
                              setAiReviewBusy(true);
                              setAiReportHint(null);
                              try {
                                const res = (await aiReviewReport(token, {
                                  title: reportForm.title,
                                  description: reportForm.description,
                                  severity: reportForm.severity,
                                })) as { completeness?: string; missingFields?: string[] };
                                setAiReportHint(
                                  `${res.completeness ?? ''}${res.missingFields?.length ? ` — Missing: ${res.missingFields.join(', ')}` : ''}`,
                                );
                              } catch {
                                setAiReportHint('AI review unavailable.');
                              } finally {
                                setAiReviewBusy(false);
                              }
                            }}
                          >
                            {aiReviewBusy ? 'Reviewing…' : 'Review report (AI)'}
                          </Button>
                          <Button type="button" disabled={isSubmittingReport} onClick={handleSubmitReport}>
                            {isSubmittingReport ? 'Submitting...' : 'Submit'}
                          </Button>
                        </div>
                        {aiReportHint ? (
                          <p className="text-xs text-slate-600">{aiReportHint}</p>
                        ) : null}
                      </div>
                    ) : null}

                    {isSelectedProvider && token && attachWorkspaceReportId ? (
                      <div className="rounded-md border border-dashed border-slate-300 p-3">
                        <p className="mb-2 text-xs text-slate-600">Attach evidence to your latest report (optional):</p>
                        <FileAttachmentControl
                          token={token}
                          target={{ workspaceReportId: attachWorkspaceReportId }}
                          onUploaded={() => setActionMessage('Evidence attached to report.')}
                        />
                      </div>
                    ) : null}

                    <div className="space-y-2">
                      {reports.length === 0 ? (
                        <p className="text-sm text-slate-500">No reports submitted yet.</p>
                      ) : (
                        reports.map((report) => (
                          <div key={report.id} className="rounded-md border border-slate-200 p-3">
                            <div className="flex items-center justify-between gap-2">
                              <p className="text-sm font-semibold text-slate-900">{report.title}</p>
                              <Badge tone={getReportStatusTone(report.status)}>{report.status}</Badge>
                            </div>
                            <p className="mt-1 text-sm text-slate-600">{report.description}</p>
                            <p className="mt-2 text-xs text-slate-500">
                              Severity: {report.severity} | By: {report.submitter.email}
                            </p>
                            {report.files?.length && token ? (
                              <ul className="mt-2 space-y-0.5 text-xs">
                                {report.files.map((f) => (
                                  <li key={f.id}>
                                    <AuthFileLink token={token} fileId={f.id} name={f.originalName} />
                                  </li>
                                ))}
                              </ul>
                            ) : null}
                            {report.triageNotes ? (
                              <p className="mt-2 rounded-md bg-slate-50 p-2 text-xs text-slate-700">
                                Triage notes: {report.triageNotes}
                              </p>
                            ) : null}
                          </div>
                        ))
                      )}
                    </div>
                    {isProjectOwner && project.status === 'COMPLETED' ? (
                      <div className="space-y-3 rounded-md border border-slate-200 p-3">
                        <p className="text-sm font-medium text-slate-900">Rate Provider</p>
                        {project.review ? (
                          <p className="text-sm text-slate-600">
                            Review submitted: {project.review.rating}/5
                            {project.review.comment ? ` - ${project.review.comment}` : ''}
                          </p>
                        ) : (
                          <>
                            <StarRating value={reviewRating} onChange={setReviewRating} />
                            <textarea
                              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                              rows={3}
                              placeholder="Share provider feedback (optional)"
                              value={reviewComment}
                              onChange={(e) => setReviewComment(e.target.value)}
                            />
                            <Button type="button" disabled={isSubmittingReview} onClick={handleSubmitReview}>
                              {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                            </Button>
                          </>
                        )}
                      </div>
                    ) : null}
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      ) : null}
    </div>
  );
}

function AuthFileLink({ token, fileId, name }: { token: string; fileId: string; name: string }) {
  const [err, setErr] = useState('');
  return (
    <span className="inline-flex flex-col gap-0.5">
      <button
        type="button"
        className="text-left text-emerald-700 underline"
        onClick={async () => {
          setErr('');
          try {
            const blob = await fetchAuthenticatedFile(token, fileId);
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank', 'noopener,noreferrer');
          } catch {
            setErr('Could not open file');
          }
        }}
      >
        {name}
      </button>
      {err ? <span className="text-rose-600">{err}</span> : null}
    </span>
  );
}
