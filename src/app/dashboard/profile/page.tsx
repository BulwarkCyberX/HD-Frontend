'use client';

import { useEffect, useState } from 'react';
import { Button, Card, Input, Textarea } from '@hackersdeal/ui';
import { useAuth } from '@/hooks/auth-context';
import { updateProviderProfile } from '@/lib/api/users';

export default function ProfilePage() {
  const { user, token, refreshUser } = useAuth();
  const [bio, setBio] = useState('');
  const [availability, setAvailability] = useState<'AVAILABLE' | 'BUSY' | 'UNAVAILABLE'>('AVAILABLE');
  const [skillsRaw, setSkillsRaw] = useState('');
  const [portfolioJson, setPortfolioJson] = useState('[]');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshUser();
  }, [refreshUser]);

  useEffect(() => {
    if (!user?.providerProfile) return;
    setBio(user.providerProfile.bio ?? '');
    setAvailability((user.providerProfile.availabilityStatus as typeof availability) ?? 'AVAILABLE');
    setSkillsRaw((user.providerProfile.skills ?? []).join(', '));
    setPortfolioJson(JSON.stringify(user.providerProfile.portfolio ?? [], null, 2));
  }, [user]);

  const save = async () => {
    if (!token || user?.role !== 'PROVIDER') return;
    setBusy(true);
    setError('');
    setMessage('');
    try {
      let portfolio: unknown = [];
      try {
        portfolio = JSON.parse(portfolioJson) as unknown;
      } catch {
        throw new Error('Portfolio must be valid JSON (array of items).');
      }
      const skills = skillsRaw
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
      await updateProviderProfile(token, {
        bio: bio.trim(),
        availabilityStatus: availability,
        skills,
        portfolio,
      });
      await refreshUser();
      setMessage('Profile updated. Public marketplace page will reflect changes.');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Save failed');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Profile</h1>
        <p className="mt-2 text-sm text-slate-600">Account details and public provider presence.</p>
      </div>

      <Card className="text-sm text-slate-600">
        <p>
          <span className="font-medium text-slate-900">Email:</span> {user?.email ?? '—'}
        </p>
        <p className="mt-2">
          <span className="font-medium text-slate-900">Role:</span> {user?.role ?? '—'}
        </p>
      </Card>

      {user?.role === 'PROVIDER' && user.providerProfile ? (
        <Card className="space-y-4">
          <h2 className="font-semibold text-slate-900">Public provider profile</h2>
          <div>
            <label className="text-sm font-medium text-slate-700">Bio</label>
            <Textarea className="mt-1 min-h-[100px]" value={bio} onChange={(e) => setBio(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Availability</label>
            <select
              className="mt-1 w-full rounded-md border border-slate-300 px-2 py-2 text-sm"
              value={availability}
              onChange={(e) => setAvailability(e.target.value as typeof availability)}
            >
              <option value="AVAILABLE">Available</option>
              <option value="BUSY">Busy</option>
              <option value="UNAVAILABLE">Unavailable</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Skills (comma-separated)</label>
            <Input className="mt-1" value={skillsRaw} onChange={(e) => setSkillsRaw(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium text-slate-700">Portfolio (JSON array)</label>
            <Textarea
              className="mt-1 min-h-[120px] font-mono text-xs"
              value={portfolioJson}
              onChange={(e) => setPortfolioJson(e.target.value)}
            />
            <p className="mt-1 text-xs text-slate-500">
              Example: [{`{"title":"Web app pentest","summary":"FinTech, 2024"}`}]
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2 text-sm text-slate-600">
            <p>Rating: {user.providerProfile.rating.toFixed(1)}</p>
            <p>Reviews: {user.providerProfile.totalReviews}</p>
            <p>Completed: {user.providerProfile.completedProjects}</p>
            <p>Valid reports: {user.providerProfile.validReportCount}</p>
            <p>Reputation: {user.providerProfile.reputationScore.toFixed(2)}</p>
            <p>Bid credits: {user.providerProfile.bidCredits}</p>
          </div>
          <Button type="button" disabled={busy} onClick={() => void save()}>
            {busy ? 'Saving…' : 'Save profile'}
          </Button>
        </Card>
      ) : null}

      {message ? <p className="text-sm text-emerald-700">{message}</p> : null}
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
