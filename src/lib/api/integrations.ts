import { apiJson } from './client';

export type ApiKeyRow = {
  id: string;
  label: string;
  keyPrefix: string;
  scopes: string[];
  lastUsedAt: string | null;
  createdAt: string;
};

export type WebhookRow = {
  id: string;
  label: string;
  url: string;
  events: string[];
  enabled: boolean;
  createdAt: string;
  updatedAt: string;
  _count: { deliveries: number };
};

export type WebhookDeliveryRow = {
  id: string;
  event: string;
  success: boolean;
  statusCode: number | null;
  errorMessage: string | null;
  createdAt: string;
};

const WEBHOOK_EVENTS = [
  'REPORT_VALIDATED',
  'MILESTONE_RELEASED',
  'PAYMENT_RELEASED',
  'BID_ACCEPTED',
  'PROJECT_COMPLETED',
] as const;

export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

export { WEBHOOK_EVENTS };

export async function listApiKeys(token: string) {
  return apiJson<ApiKeyRow[]>('/integrations/api-keys', { token });
}

export async function createApiKey(token: string, label: string) {
  return apiJson<{ apiKey: string; keyPrefix: string; label: string }>('/integrations/api-keys', {
    method: 'POST',
    token,
    body: JSON.stringify({ label }),
  });
}

export async function revokeApiKey(token: string, id: string) {
  return apiJson<{ ok: boolean }>(`/integrations/api-keys/${id}`, { method: 'DELETE', token });
}

export async function listWebhooks(token: string) {
  return apiJson<WebhookRow[]>('/integrations/webhooks', { token });
}

export async function createWebhook(
  token: string,
  payload: { label: string; url: string; events: WebhookEvent[] },
) {
  return apiJson<WebhookRow & { signingSecret: string }>('/integrations/webhooks', {
    method: 'POST',
    token,
    body: JSON.stringify(payload),
  });
}

export async function patchWebhook(token: string, id: string, enabled: boolean) {
  return apiJson<{ id: string; label: string; enabled: boolean }>(`/integrations/webhooks/${id}`, {
    method: 'PATCH',
    token,
    body: JSON.stringify({ enabled }),
  });
}

export async function deleteWebhook(token: string, id: string) {
  return apiJson<{ ok: boolean }>(`/integrations/webhooks/${id}`, { method: 'DELETE', token });
}

export async function listWebhookDeliveries(token: string, webhookId: string) {
  return apiJson<WebhookDeliveryRow[]>(`/integrations/webhooks/${webhookId}/deliveries`, { token });
}
