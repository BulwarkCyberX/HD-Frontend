'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { ApiError, type AuthResponse, type AuthUser, getCurrentUser } from '@/lib/api/auth';
import { logoutSession, refreshAccessToken } from '@/lib/api/client';
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

  const clearLocalSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setAuthError(null);
    if (typeof window !== 'undefined') {
      window.localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const logout = useCallback(() => {
    void logoutSession();
    clearLocalSession();
  }, [clearLocalSession]);

  const applyAccessToken = useCallback((accessToken: string) => {
    setToken(accessToken);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(AUTH_STORAGE_KEY, accessToken);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    let activeToken = token;
    if (!activeToken) {
      const refreshed = await refreshAccessToken();
      if (refreshed) {
        applyAccessToken(refreshed);
        activeToken = refreshed;
      }
    }
    if (!activeToken) {
      setUser(null);
      return;
    }
    try {
      const currentUser = await getCurrentUser(activeToken);
      setUser(currentUser);
      setAuthError(null);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        const refreshed = await refreshAccessToken();
        if (refreshed) {
          applyAccessToken(refreshed);
          try {
            const currentUser = await getCurrentUser(refreshed);
            setUser(currentUser);
            setAuthError(null);
            return;
          } catch {
            // fall through
          }
        }
        clearLocalSession();
        return;
      }
      setAuthError(error instanceof Error ? error.message : 'Unable to load user profile');
    }
  }, [applyAccessToken, clearLocalSession, token]);

  const setSession = useCallback(
    (session: AuthResponse) => {
      applyAccessToken(session.accessToken);
      setUser(session.user);
      setAuthError(null);
    },
    [applyAccessToken],
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const restore = async () => {
      const storedToken = window.localStorage.getItem(AUTH_STORAGE_KEY);
      let accessToken = storedToken;

      if (!accessToken) {
        accessToken = await refreshAccessToken();
      }

      if (!accessToken) {
        setIsLoading(false);
        return;
      }

      applyAccessToken(accessToken);
      try {
        const currentUser = await getCurrentUser(accessToken);
        setUser(currentUser);
        setAuthError(null);
      } catch (error) {
        if (error instanceof ApiError && error.status === 401) {
          const refreshed = await refreshAccessToken();
          if (refreshed) {
            applyAccessToken(refreshed);
            try {
              const currentUser = await getCurrentUser(refreshed);
              setUser(currentUser);
              setAuthError(null);
              setIsLoading(false);
              return;
            } catch {
              // fall through
            }
          }
        }
        clearLocalSession();
        if (!(error instanceof ApiError && error.status === 401)) {
          setAuthError(error instanceof Error ? error.message : 'Unable to restore session');
        }
      } finally {
        setIsLoading(false);
      }
    };

    void restore();
  }, [applyAccessToken, clearLocalSession]);

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
