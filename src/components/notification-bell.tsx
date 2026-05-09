'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/hooks/auth-context';
import { listNotifications, markNotificationRead, type NotificationItem } from '@/lib/api/notifications';

const POLL_MS = 15000;

export function NotificationBell() {
  const { token, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<NotificationItem[]>([]);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    if (!token) return;
    setError('');
    try {
      const list = await listNotifications(token);
      setItems(list);
    } catch {
      setError('Could not load notifications');
    }
  }, [token]);

  useEffect(() => {
    if (!isAuthenticated || !token) {
      setItems([]);
      return;
    }
    void load();
    const t = setInterval(() => void load(), POLL_MS);
    return () => clearInterval(t);
  }, [isAuthenticated, token, load]);

  const unread = items.filter((n) => !n.read).length;

  const onMarkRead = async (id: string) => {
    if (!token) return;
    try {
      await markNotificationRead(token, id);
      setItems((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    } catch {
      // ignore
    }
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          if (!open) void load();
        }}
        className="relative rounded-md p-2 text-neutral-300 transition hover:bg-neutral-900 hover:text-neutral-50"
        aria-label="Notifications"
      >
        <span className="text-lg" aria-hidden>
          🔔
        </span>
        {unread > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-rose-600 px-1 text-[10px] font-semibold text-white">
            {unread > 9 ? '9+' : unread}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-50 mt-2 w-80 max-w-[calc(100vw-2rem)] rounded-lg border border-neutral-800 bg-neutral-950 py-1 shadow-[0_20px_50px_rgba(0,0,0,0.6)]">
          <p className="border-b border-neutral-900 px-3 py-2 text-xs font-semibold text-neutral-400">
            Notifications
          </p>
          {error ? <p className="px-3 py-2 text-xs text-rose-600">{error}</p> : null}
          <ul className="max-h-80 overflow-y-auto">
            {items.length === 0 ? (
              <li className="px-3 py-4 text-sm text-neutral-400">No notifications yet.</li>
            ) : (
              items.map((n) => (
                <li key={n.id} className="border-b border-neutral-900 last:border-0">
                  <button
                    type="button"
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-sm transition hover:bg-neutral-900 ${
                      n.read ? 'text-neutral-300' : 'bg-emerald-500/10 font-medium text-neutral-50'
                    }`}
                    onClick={() => {
                      if (!n.read) void onMarkRead(n.id);
                    }}
                  >
                    <span>{n.message}</span>
                    <span className="text-[10px] text-neutral-500">
                      {new Date(n.createdAt).toLocaleString()}
                    </span>
                  </button>
                </li>
              ))
            )}
          </ul>
        </div>
      ) : null}

      {open ? (
        <button
          type="button"
          className="fixed inset-0 z-30 cursor-default bg-transparent"
          aria-label="Close notifications"
          onClick={() => setOpen(false)}
        />
      ) : null}
    </div>
  );
}
