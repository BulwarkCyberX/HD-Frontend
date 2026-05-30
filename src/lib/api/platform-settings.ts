import { apiJson } from './client';

export type MailProvider = 'AUTO' | 'SMTP' | 'SENDGRID' | 'NONE';
export type SessionPolicy = 'MULTI_DEVICE' | 'SINGLE_DEVICE';

export type PlatformSettings = {
  mailProvider: MailProvider;
  mailFromAddress: string;
  mailFromName: string;
  mailReplyTo: string;
  smtpHost: string;
  smtpPort: number;
  smtpUser: string;
  smtpPassword: string;
  sendgridApiKey: string;
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
