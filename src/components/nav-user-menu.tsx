'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAuth } from '@/hooks/auth-context';

export function NavUserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('click', onDoc);
    return () => document.removeEventListener('click', onDoc);
  }, [open]);

  const email = user?.email ?? 'Account';

  return (
    <div className="relative ml-1" ref={rootRef}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex max-w-[12rem] items-center gap-1.5 rounded-md border border-neutral-700 bg-neutral-900/80 px-2.5 py-1.5 text-left text-sm font-medium text-neutral-100 transition hover:border-neutral-600 hover:bg-neutral-900 sm:max-w-[16rem]"
        aria-expanded={open}
        aria-haspopup="menu"
      >
        <span className="truncate">{email}</span>
        <span className="shrink-0 text-neutral-500" aria-hidden>
          ▾
        </span>
      </button>
      {open ? (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1 min-w-[14rem] max-w-[min(18rem,calc(100vw-2rem))] rounded-lg border border-neutral-700 bg-neutral-900 py-1 shadow-xl"
        >
          <p className="border-b border-neutral-800 px-3 py-2 text-xs text-neutral-500">Signed in as</p>
          <p className="truncate px-3 pb-2 text-sm font-medium text-neutral-100">{email}</p>
          <Link
            role="menuitem"
            href="/dashboard/profile"
            className="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            Profile
          </Link>
          <Link
            role="menuitem"
            href="/dashboard/settings"
            className="block px-3 py-2 text-sm text-neutral-200 hover:bg-neutral-800"
            onClick={() => setOpen(false)}
          >
            Settings
          </Link>
          <button
            role="menuitem"
            type="button"
            className="w-full px-3 py-2 text-left text-sm text-rose-300 hover:bg-neutral-800"
            onClick={() => {
              setOpen(false);
              logout();
            }}
          >
            Log out
          </button>
        </div>
      ) : null}
    </div>
  );
}
