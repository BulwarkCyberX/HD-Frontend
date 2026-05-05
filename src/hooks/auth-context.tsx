'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, type AuthResponse, type AuthUser, getCurrentUser } from '@/lib/api/auth';
import { AUTH_STORAGE_KEY } from '@/store/auth/storage';

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  authError: string | null;
  setSession: (session: AuthResponse) => void;
  refreshUser: () => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const currentUser = await getCurrentUser(token);
      setUser(currentUser);
      setAuthError(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        logout();
        return;
      }
      setAuthError(error instanceof Error ? error.message : 'Unable to load user profile');
    }
  }, [logout, token]);

  const setSession = useCallback((session: AuthResponse) => {
    setToken(session.accessToken);
    setUser(session.user);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, session.accessToken);
    }
  }, []);

  useEffect(() => {
    // Restore session once on client boot; token persistence is temporary MVP strategy.
    if (typeof window === 'undefined') return;
    const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY);
    if (!storedToken) {
      setIsLoading(false);
      return;
    }

    setToken(storedToken);
    getCurrentUser(storedToken)
      .then((currentUser) => {
        setUser(currentUser);
        setAuthError(null);
      })
      .catch((error) => {
        if (error instanceof ApiError && error.status === 401) {
          window.localStorage.removeItem(AUTH_STORAGE_KEY);
        }
        setAuthError(error instanceof Error ? error.message : 'Unable to restore session');
        setToken(null);
        setUser(null);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token,
      user,
      isLoading,
      isAuthenticated: Boolean(user),
      authError,
      setSession,
      refreshUser,
      logout,
    }),
    [token, user, isLoading, authError, setSession, refreshUser, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }
  return ctx;
}
