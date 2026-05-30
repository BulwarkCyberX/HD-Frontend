import { apiJson } from './client';

export type MailProvider = 'AUTO' | 'SMTP' | 'SENDGRID' | 'AWS_SES' | 'POSTMARK' | 'NONE';
export type SessionPolicy = 'MULTI_DEVICE' | 'SINGLE_DEVICE';

export type PlatformSettings = {
  mailProvider: MailProvider;
  primaryMailProvider: MailProvider;
  mailFromAddress: string;
  mailFromName: string;
  mailReplyTo: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  sendgridApiKey: string;
  awsSesAccessKeyId: string;
  awsSesSecretKey: string;
  awsSesRegion: string;
  postmarkServerToken: string;
  accessTokenExpiryMinutes: number;
  refreshTokenExpiryDays: number;
  emailVerificationCodeValue: number;
  emailVerificationCodeUnit: string;
  loginOtpCodeValue: number;
  loginOtpCodeUnit: string;
  sessionPolicy: SessionPolicy;
  maxConcurrentSessions: number;
};

export async function getPlatformSettings(token: string) {
  return apiJson<PlatformSettings>('/admin/settings', { token, cache: 'no-store' });
}

export async function updatePlatformSettings(token: string, payload: Partial<PlatformSettings>) {
  return apiJson<PlatformSettings>('/admin/settings', {
    method: 'PATCH',
    token,
    body: JSON.stringify(payload),
  });
}

export async function sendTestEmail(token: string, to: string) {
  return apiJson<{ success: boolean; error?: string }>('/admin/settings/test-email', {
    method: 'POST',
    token,
    body: JSON.stringify({ to }),
  });
}
