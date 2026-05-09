'use client';

import { Card } from '@hackersdeal/ui';

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">Settings</h1>
        <p className="mt-2 text-sm text-slate-600">Account preferences will appear here.</p>
      </div>
      <Card className="border-dashed text-sm text-slate-600">
        This page is a placeholder. Use Profile for reputation and account details for now.
      </Card>
    </div>
  );
}
