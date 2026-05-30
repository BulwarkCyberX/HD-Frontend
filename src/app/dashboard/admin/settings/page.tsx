'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { Button, Card, Input } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { Spinner } from '@/components/spinner';
import { useAuth } from '@/hooks/auth-context';
import { sendWeeklyDigestsAdmin } from '@/lib/api/notifications-admin';
import {
  getPlatformSettings,
  updatePlatformSettings,
  type MailProvider,
  type PlatformSettings,
  type SessionPolicy,
} from '@/lib/api/platform-settings';

export default function AdminSettingsPage() {
  return (
    <ProtectedRoute>
      <AdminSettingsContent />
    </ProtectedRoute>
  );
}

function AdminSettingsContent() {
  const { token, user } = useAuth();
  const [settings, setSettings] = useState<PlatformSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [digestMessage, setDigestMessage] = useState('');
  const [digestBusy, setDigestBusy] = useState(false);

  const load = useCallback(async () => {
    if (!token) return;
    try {
      const data = await getPlatformSettings(token);
      setSettings(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load settings');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    void load();
  }, [load]);

  const save = async (patch: Partial<PlatformSettings>) => {
    if (!token) return;
    setSaving(true);
    setMessage('');
    setError('');
    try {
      const updated = await updatePlatformSettings(token, patch);
      setSettings(updated);
      setMessage('Settings saved.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setSaving(false);
    }
  };

  const runDigest = async () => {
    if (!token) return;
    setDigestBusy(true);
    setDigestMessage('');
    try {
      const res = await sendWeeklyDigestsAdmin(token);
      setDigestMessage(`Weekly digest sent to ${res.sent} users.`);
    } catch (e) {
      setDigestMessage(e instanceof Error ? e.message : 'Digest send failed');
    } finally {
      setDigestBusy(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  if (loading) return <Spinner size="md" label="Loading settings…" />;

  return (
    <section className="space-y-6">
      <header>
        <h2 className="text-lg font-semibold text-slate-900">Platform settings</h2>
        <p className="mt-1 text-sm text-slate-600">Configure email delivery, token expiry, and session policies.</p>
      </header>

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}

      {/* 1) Email Configuration */}
      {settings ? <EmailConfigCard settings={settings} onSave={save} saving={saving} /> : null}

      {/* 2) Token Expiry */}
      {settings ? <TokenExpiryCard settings={settings} onSave={save} saving={saving} /> : null}

      {/* 3) Email Code Validity */}
      {settings ? <CodeValidityCard settings={settings} onSave={save} saving={saving} /> : null}

      {/* 4) Multi-device / Session Policy */}
      {settings ? <SessionPolicyCard settings={settings} onSave={save} saving={saving} /> : null}

      {/* Weekly digest */}
      <Card>
        <h3 className="font-semibold text-slate-900">Weekly email digest</h3>
        <p className="mt-2 text-sm text-slate-600">
          Manually trigger the weekly digest email to opted-in users.
        </p>
        <Button type="button" className="mt-3" disabled={digestBusy} onClick={() => void runDigest()}>
          {digestBusy ? 'Sending…' : 'Send weekly digest now'}
        </Button>
        {digestMessage ? <p className="mt-2 text-sm text-slate-700">{digestMessage}</p> : null}
      </Card>

      {/* Email templates link */}
      <Card>
        <h3 className="font-semibold text-slate-900">Email templates</h3>
        <p className="mt-2 text-sm text-slate-600">
          Edit transactional email content (signup, OTP, password reset, notifications).
        </p>
        <Link
          href="/dashboard/admin/emails"
          className="mt-3 inline-block text-sm font-medium text-tropical-jade-700 underline"
        >
          Open email template editor →
        </Link>
      </Card>
    </section>
  );
}

/* ─── Email Configuration Card ─── */

function EmailConfigCard({
  settings,
  onSave,
  saving,
}: {
  settings: PlatformSettings;
  onSave: (patch: Partial<PlatformSettings>) => Promise<void>;
  saving: boolean;
}) {
  const [provider, setProvider] = useState<MailProvider>(settings.mailProvider);
  const [primaryProvider, setPrimaryProvider] = useState<MailProvider>(settings.primaryMailProvider || 'SMTP');
  const [fromAddress, setFromAddress] = useState(settings.mailFromAddress);
  const [fromName, setFromName] = useState(settings.mailFromName);
  const [replyTo, setReplyTo] = useState(settings.mailReplyTo);
  const [smtpHost, setSmtpHost] = useState(settings.smtpHost);
  const [smtpPort, setSmtpPort] = useState(settings.smtpPort);
  const [smtpUser, setSmtpUser] = useState(settings.smtpUser);
  const [smtpPassword, setSmtpPassword] = useState(settings.smtpPassword);
  const [sendgridApiKey, setSendgridApiKey] = useState(settings.sendgridApiKey);
  const [awsSesAccessKeyId, setAwsSesAccessKeyId] = useState(settings.awsSesAccessKeyId);
  const [awsSesSecretKey, setAwsSesSecretKey] = useState(settings.awsSesSecretKey);
  const [awsSesRegion, setAwsSesRegion] = useState(settings.awsSesRegion || 'us-east-1');
  const [postmarkServerToken, setPostmarkServerToken] = useState(settings.postmarkServerToken);
  const [alreadyAddedLabel, setAlreadyAddedLabel] = useState('');

  // When provider changes, check if creds are already set and reset them
  const handleProviderChange = (newProvider: MailProvider) => {
    const prev = provider;
    setProvider(newProvider);

    // If switching away from a provider that had creds, reset those creds
    if (prev !== newProvider) {
      if (prev === 'SMTP' && settings.smtpPassword) {
        setSmtpHost(''); setSmtpPort(587); setSmtpUser(''); setSmtpPassword('');
      }
      if (prev === 'SENDGRID' && settings.sendgridApiKey) {
        setSendgridApiKey('');
      }
      if (prev === 'AWS_SES' && settings.awsSesSecretKey) {
        setAwsSesAccessKeyId(''); setAwsSesSecretKey(''); setAwsSesRegion('us-east-1');
      }
      if (prev === 'POSTMARK' && settings.postmarkServerToken) {
        setPostmarkServerToken('');
      }
    }

    // Show "already added" label if the new provider already has creds configured
    if (newProvider === 'SMTP' && settings.smtpPassword) {
      showAlreadyAdded('SMTP credentials already configured');
    } else if (newProvider === 'SENDGRID' && settings.sendgridApiKey) {
      showAlreadyAdded('SendGrid API key already configured');
    } else if (newProvider === 'AWS_SES' && settings.awsSesSecretKey) {
      showAlreadyAdded('AWS SES credentials already configured');
    } else if (newProvider === 'POSTMARK' && settings.postmarkServerToken) {
      showAlreadyAdded('Postmark token already configured');
    }
  };

  const showAlreadyAdded = (msg: string) => {
    setAlreadyAddedLabel(msg);
    setTimeout(() => setAlreadyAddedLabel(''), 3000);
  };

  const handleSave = () => {
    void onSave({
      mailProvider: provider,
      primaryMailProvider: primaryProvider,
      mailFromAddress: fromAddress,
      mailFromName: fromName,
      mailReplyTo: replyTo,
      smtpHost,
      smtpPort,
      smtpUser,
      smtpPassword,
      sendgridApiKey,
      awsSesAccessKeyId,
      awsSesSecretKey,
      awsSesRegion,
      postmarkServerToken,
    });
  };

  // Providers available for "Primary default" in Auto mode (exclude AUTO and NONE)
  const activeProviders: { value: MailProvider; label: string }[] = [
    { value: 'SMTP', label: 'SMTP (Gmail / custom)' },
    { value: 'SENDGRID', label: 'SendGrid' },
    { value: 'AWS_SES', label: 'AWS SES' },
    { value: 'POSTMARK', label: 'Postmark' },
  ];

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-slate-900">📧 Email service configuration</h3>
      <p className="text-sm text-slate-600">
        Select which mail provider to use and enter credentials. Changes take effect on next email send.
        Only one provider can be active at a time.
      </p>

      {alreadyAddedLabel ? (
        <p className="text-sm font-medium text-amber-700 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
          ⚠️ {alreadyAddedLabel}
        </p>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Mail provider</label>
          <select
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
            value={provider}
            onChange={(e) => handleProviderChange(e.target.value as MailProvider)}
          >
            <option value="AUTO">Auto (uses Primary default fallback)</option>
            <option value="SMTP">SMTP (Gmail / custom)</option>
            <option value="SENDGRID">SendGrid</option>
            <option value="AWS_SES">AWS SES</option>
            <option value="POSTMARK">Postmark</option>
            <option value="NONE">Disabled</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">From address</label>
          <Input className="mt-1" value={fromAddress} onChange={(e) => setFromAddress(e.target.value)} placeholder="noreply@hackersdeal.com" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">From name</label>
          <Input className="mt-1" value={fromName} onChange={(e) => setFromName(e.target.value)} placeholder="HD Team" />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Reply-to</label>
          <Input className="mt-1" value={replyTo} onChange={(e) => setReplyTo(e.target.value)} placeholder="support@hackersdeal.com" />
        </div>
      </div>

      {/* Primary default provider selector (only shown in AUTO mode) */}
      {provider === 'AUTO' ? (
        <div className="rounded-md border border-blue-100 bg-blue-50 p-4">
          <label className="block text-sm font-medium text-blue-800">Primary default provider (for Auto fallback)</label>
          <p className="text-xs text-blue-600 mb-2">
            Auto mode tries this provider first, then falls back to others with configured credentials.
          </p>
          <select
            className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm text-slate-900"
            value={primaryProvider}
            onChange={(e) => setPrimaryProvider(e.target.value as MailProvider)}
          >
            {activeProviders.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
      ) : null}

      {/* SMTP credentials */}
      {(provider === 'AUTO' || provider === 'SMTP') ? (
        <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
          <legend className="px-2 text-sm font-medium text-slate-700">SMTP credentials</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-600">Host</label>
              <Input value={smtpHost} onChange={(e) => setSmtpHost(e.target.value)} placeholder="smtp.gmail.com" />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Port</label>
              <Input type="number" value={smtpPort} onChange={(e) => setSmtpPort(Number(e.target.value))} />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Username / Email</label>
              <Input value={smtpUser} onChange={(e) => setSmtpUser(e.target.value)} placeholder="you@gmail.com" />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Password / App password</label>
              <Input type="password" value={smtpPassword} onChange={(e) => setSmtpPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* SendGrid credentials */}
      {(provider === 'AUTO' || provider === 'SENDGRID') ? (
        <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
          <legend className="px-2 text-sm font-medium text-slate-700">SendGrid credentials</legend>
          <div>
            <label className="block text-xs text-slate-600">API Key</label>
            <Input type="password" value={sendgridApiKey} onChange={(e) => setSendgridApiKey(e.target.value)} placeholder="SG.xxxxx" />
          </div>
        </fieldset>
      ) : null}

      {/* AWS SES credentials */}
      {(provider === 'AUTO' || provider === 'AWS_SES') ? (
        <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
          <legend className="px-2 text-sm font-medium text-slate-700">AWS SES credentials</legend>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-xs text-slate-600">Access Key ID</label>
              <Input value={awsSesAccessKeyId} onChange={(e) => setAwsSesAccessKeyId(e.target.value)} placeholder="AKIA..." />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Secret Access Key</label>
              <Input type="password" value={awsSesSecretKey} onChange={(e) => setAwsSesSecretKey(e.target.value)} placeholder="••••••••" />
            </div>
            <div>
              <label className="block text-xs text-slate-600">Region</label>
              <Input value={awsSesRegion} onChange={(e) => setAwsSesRegion(e.target.value)} placeholder="us-east-1" />
            </div>
          </div>
        </fieldset>
      ) : null}

      {/* Postmark credentials */}
      {(provider === 'AUTO' || provider === 'POSTMARK') ? (
        <fieldset className="space-y-3 rounded-md border border-slate-200 p-4">
          <legend className="px-2 text-sm font-medium text-slate-700">Postmark credentials</legend>
          <div>
            <label className="block text-xs text-slate-600">Server Token</label>
            <Input type="password" value={postmarkServerToken} onChange={(e) => setPostmarkServerToken(e.target.value)} placeholder="xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" />
          </div>
        </fieldset>
      ) : null}

      <Button type="button" disabled={saving} onClick={handleSave}>
        {saving ? 'Saving…' : 'Save email settings'}
      </Button>
    </Card>
  );
}

/* ─── Token Expiry Card ─── */

function TokenExpiryCard({
  settings,
  onSave,
  saving,
}: {
  settings: PlatformSettings;
  onSave: (patch: Partial<PlatformSettings>) => Promise<void>;
  saving: boolean;
}) {
  const [accessMinutes, setAccessMinutes] = useState(settings.accessTokenExpiryMinutes);
  const [refreshDays, setRefreshDays] = useState(settings.refreshTokenExpiryDays);

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-slate-900">🔑 Token expiry</h3>
      <p className="text-sm text-slate-600">
        Control how long access and refresh tokens remain valid. Shorter = more secure, longer = less re-login friction.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="block text-sm font-medium text-slate-700">Access token expiry (minutes)</label>
          <Input
            type="number"
            min={1}
            max={1440}
            className="mt-1"
            value={accessMinutes}
            onChange={(e) => setAccessMinutes(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">Range: 1–1440 min (1 day max)</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700">Refresh token expiry (days)</label>
          <Input
            type="number"
            min={1}
            max={90}
            className="mt-1"
            value={refreshDays}
            onChange={(e) => setRefreshDays(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">Range: 1–90 days</p>
        </div>
      </div>
      <Button
        type="button"
        disabled={saving}
        onClick={() => void onSave({ accessTokenExpiryMinutes: accessMinutes, refreshTokenExpiryDays: refreshDays })}
      >
        {saving ? 'Saving…' : 'Save token settings'}
      </Button>
    </Card>
  );
}

/* ─── Email Code Validity Card ─── */

function CodeValidityCard({
  settings,
  onSave,
  saving,
}: {
  settings: PlatformSettings;
  onSave: (patch: Partial<PlatformSettings>) => Promise<void>;
  saving: boolean;
}) {
  const [verifyValue, setVerifyValue] = useState(settings.emailVerificationCodeValue);
  const [verifyUnit, setVerifyUnit] = useState(settings.emailVerificationCodeUnit);
  const [otpValue, setOtpValue] = useState(settings.loginOtpCodeValue);
  const [otpUnit, setOtpUnit] = useState(settings.loginOtpCodeUnit);

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-slate-900">⏱️ Email code validity</h3>
      <p className="text-sm text-slate-600">
        Set how long verification codes and login OTPs remain valid before they expire.
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* Email verification code */}
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-800">Signup verification code</p>
          <p className="text-xs text-slate-500">Code sent during account creation</p>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={999}
              className="w-24"
              value={verifyValue}
              onChange={(e) => setVerifyValue(Number(e.target.value))}
            />
            <select
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={verifyUnit}
              onChange={(e) => setVerifyUnit(e.target.value)}
            >
              <option value="MINUTES">Minutes</option>
              <option value="HOURS">Hours</option>
              <option value="DAYS">Days</option>
            </select>
          </div>
        </div>

        {/* Login OTP code */}
        <div className="space-y-2 rounded-md border border-slate-200 p-3">
          <p className="text-sm font-medium text-slate-800">Login OTP code</p>
          <p className="text-xs text-slate-500">One-time code for passwordless login</p>
          <div className="flex gap-2">
            <Input
              type="number"
              min={1}
              max={999}
              className="w-24"
              value={otpValue}
              onChange={(e) => setOtpValue(Number(e.target.value))}
            />
            <select
              className="flex-1 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900"
              value={otpUnit}
              onChange={(e) => setOtpUnit(e.target.value)}
            >
              <option value="MINUTES">Minutes</option>
              <option value="HOURS">Hours</option>
              <option value="DAYS">Days</option>
            </select>
          </div>
        </div>
      </div>

      <Button
        type="button"
        disabled={saving}
        onClick={() =>
          void onSave({
            emailVerificationCodeValue: verifyValue,
            emailVerificationCodeUnit: verifyUnit,
            loginOtpCodeValue: otpValue,
            loginOtpCodeUnit: otpUnit,
          })
        }
      >
        {saving ? 'Saving…' : 'Save code validity'}
      </Button>
    </Card>
  );
}

/* ─── Session Policy Card ─── */

function SessionPolicyCard({
  settings,
  onSave,
  saving,
}: {
  settings: PlatformSettings;
  onSave: (patch: Partial<PlatformSettings>) => Promise<void>;
  saving: boolean;
}) {
  const [policy, setPolicy] = useState<SessionPolicy>(settings.sessionPolicy);
  const [maxSessions, setMaxSessions] = useState(settings.maxConcurrentSessions);

  return (
    <Card className="space-y-4">
      <h3 className="font-semibold text-slate-900">📱 Multi-device login policy</h3>
      <p className="text-sm text-slate-600">
        Control whether users can stay logged in on multiple devices simultaneously.
      </p>

      <div className="space-y-3">
        <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
          <input
            type="radio"
            name="sessionPolicy"
            className="mt-0.5"
            checked={policy === 'MULTI_DEVICE'}
            onChange={() => setPolicy('MULTI_DEVICE')}
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Multi-device (allow concurrent sessions)</p>
            <p className="text-xs text-slate-600">
              Users can login from laptop, mobile, and other devices at the same time.
            </p>
          </div>
        </label>

        <label className="flex items-start gap-3 rounded-md border border-slate-200 p-3 cursor-pointer hover:bg-slate-50">
          <input
            type="radio"
            name="sessionPolicy"
            className="mt-0.5"
            checked={policy === 'SINGLE_DEVICE'}
            onChange={() => setPolicy('SINGLE_DEVICE')}
          />
          <div>
            <p className="text-sm font-medium text-slate-900">Single device only (auto-logout others)</p>
            <p className="text-xs text-slate-600">
              Each new login automatically logs out all other devices. Only one active session at a time.
            </p>
          </div>
        </label>
      </div>

      {policy === 'MULTI_DEVICE' ? (
        <div>
          <label className="block text-sm font-medium text-slate-700">
            Max concurrent sessions (0 = unlimited)
          </label>
          <Input
            type="number"
            min={0}
            max={50}
            className="mt-1 max-w-[200px]"
            value={maxSessions}
            onChange={(e) => setMaxSessions(Number(e.target.value))}
          />
          <p className="mt-1 text-xs text-slate-500">
            When limit is reached, the oldest session is automatically logged out. Set 0 for no limit.
          </p>
        </div>
      ) : null}

      <Button
        type="button"
        disabled={saving}
        onClick={() => void onSave({ sessionPolicy: policy, maxConcurrentSessions: policy === 'SINGLE_DEVICE' ? 1 : maxSessions })}
      >
        {saving ? 'Saving…' : 'Save session policy'}
      </Button>
    </Card>
  );
}
