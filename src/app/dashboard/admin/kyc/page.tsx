'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Card } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { listPendingKyc, reviewKyc, type AdminKycRow } from '@/lib/api/kyc';

export default function AdminKycPage() {
  return (
    <ProtectedRoute>
      <AdminKycContent />
    </ProtectedRoute>
  );
}

function AdminKycContent() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<AdminKycRow[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setRows(await listPendingKyc(token));
  }, [token]);

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [load, user?.role]);

  const review = async (id: string, approve: boolean) => {
    if (!token) return;
    await reviewKyc(token, id, { approve });
    await load();
  };

  if (user?.role !== 'ADMIN') {
    return <p className="text-sm text-slate-600">Admin access required.</p>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-semibold text-slate-900">KYC verification queue</h1>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      {rows.length === 0 ? (
        <Card className="text-sm text-slate-600">No pending KYC submissions.</Card>
      ) : (
        rows.map((r) => (
          <Card key={r.id} className="space-y-2 text-sm">
            <p className="font-medium text-slate-900">
              {r.user.firstName} {r.user.lastName} · {r.user.email}
            </p>
            <p>
              PAN {r.panNumberMasked} · {r.panHolderName} · Bank ****{r.bankAccountLast4} · {r.bankIfsc}
            </p>
            <div className="flex gap-2">
              <Button type="button" onClick={() => void review(r.id, true)}>
                Approve
              </Button>
              <Button type="button" variant="secondary" onClick={() => void review(r.id, false)}>
                Reject
              </Button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
