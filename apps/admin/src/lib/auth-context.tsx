'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AdminUser | null | undefined;
  isAdmin: boolean;
  isDark: boolean;
  logout: () => void;
  toggleDark: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

function getInitialDark(): boolean {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('admin_dark_mode');
    if (stored === 'true') {
      document.documentElement.classList.add('dark');
      return true;
    }
  }
  return false;
}

async function fetchMe(): Promise<AdminUser | null> {
  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`,
      { credentials: 'include' },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.user ?? null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null | undefined>(undefined);
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    // One-time cleanup of the legacy localStorage Bearer token from the
    // pre-cookie auth era. Safe to remove after the next deploy settles.
    try {
      localStorage.removeItem('admin_token');
    } catch {
      // ignore quota / privacy-mode errors
    }
    let cancelled = false;
    (async () => {
      const me = await fetchMe();
      if (!cancelled) setUser(me);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch {
      // best-effort — local state clear is what matters
    } finally {
      setUser(null);
    }
  }, []);

  const toggleDark = useCallback(() => {
    setIsDark((prev) => {
      const next = !prev;
      localStorage.setItem('admin_dark_mode', String(next));
      document.documentElement.classList.toggle('dark', next);
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin: user?.isAdmin ?? false,
        isDark,
        logout,
        toggleDark,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
