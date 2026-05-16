import { apiJson } from './client';

export type AdminAnalyticsSummary = {
  users: number;
  projects: number;
  releasedPaymentsGross: number;
  activeDisputes: number;
  pendingKyc: number;
  pendingWithdrawals: number;
  projectsByStatus: { status: string; count: number }[];
  platformWallet: {
    availableBalance: string;
    lifetimeEarnings: string;
    currency: string;
  } | null;
};

export type ClientAnalytics = {
  projectsOwned: number;
  wallet: {
    availableBalance: string;
    escrowBalance: string;
    totalSpent: string;
    currency: string;
  } | null;
};

export type ProviderAnalytics = {
  profile: {
    rating: number;
    totalReviews: number;
    completedProjects: number;
    validReportCount: number;
    reputationScore: number;
  } | null;
  bidsSubmitted: number;
  wallet: {
    availableBalance: string;
    lifetimeEarnings: string;
    escrowBalance: string;
    totalSpent: string;
    currency: string;
  } | null;
};

export async function getAdminAnalytics(token: string) {
  return apiJson<AdminAnalyticsSummary>('/admin/analytics/summary', { token, cache: 'no-store' });
}

export async function getClientAnalytics(token: string) {
  return apiJson<ClientAnalytics>('/analytics/client/me', { token, cache: 'no-store' });
}

export async function getProviderAnalytics(token: string) {
  return apiJson<ProviderAnalytics>('/analytics/provider/me', { token, cache: 'no-store' });
}
