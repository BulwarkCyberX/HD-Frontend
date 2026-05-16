import { ApiError } from './auth';
import { apiJson } from './client';

export async function aiSuggestScope(token: string, description: string) {
  try {
    return await apiJson<unknown>('/ai/scope', {
      method: 'POST',
      token,
      body: JSON.stringify({ description }),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('AI scope suggestion failed');
  }
}

export async function aiImproveProposal(token: string, proposal: string) {
  try {
    return await apiJson<unknown>('/ai/proposal', {
      method: 'POST',
      token,
      body: JSON.stringify({ proposal }),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('AI proposal improvement failed');
  }
}

export async function aiReviewReport(
  token: string,
  payload: { title: string; description: string; severity: string },
) {
  try {
    return await apiJson<unknown>('/ai/report-review', {
      method: 'POST',
      token,
      body: JSON.stringify(payload),
    });
  } catch (error) {
    if (error instanceof ApiError) throw error;
    throw new Error('AI report review failed');
  }
}
