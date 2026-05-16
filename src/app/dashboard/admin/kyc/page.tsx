'use client';

import { useEffect, useState } from 'react';
import { Button, Card } from '@hackersdeal/ui';
import { ProtectedRoute } from '@/components/protected-route';
import { useAuth } from '@/hooks/auth-context';
import { ApiError } from '@/lib/api/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type KycRow = {
  id: string;
  userId: string;
  status: string;
  panNumberMasked: string | null;
  panHolderName: string | null;
  bankAccountLast4: string | null;
  bankIfsc: string | null;
  createdAt: string;
  user: { id: string; email: string; firstName: string | null; lastName: string | null };
};

export default function AdminKycPage() {
  return (
    <ProtectedRoute>
      <AdminKycContent />
    </ProtectedRoute>
  );
}

function AdminKycContent() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<KycRow[]>([]);
  const [error, setError] = useState('');

  const load = async () => {
    if (!token) return;
    const res = await fetch(`${API_BASE_URL}/kyc/admin/pending`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new ApiError(res.status, String(json.message ?? 'Failed'));
    setRows(json as KycRow[]);
  };

  useEffect(() => {
    if (user?.role !== 'ADMIN') return;
    void load().catch((e) => setError(e instanceof Error ? e.message : 'Load failed'));
  }, [token, user?.role]);

  const review = async (id: string, approve: boolean) => {
    if (!token) return;
    await fetch(`${API_BASE_URL}/kyc/admin/${id}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ approve }),
    });
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
