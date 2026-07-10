'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AdminUser {
  id: string;
  email: string;
  name?: string;
  isAdmin: boolean;
}

interface AuthContextType {
  token: string | null;
  user: AdminUser | null;
  isDark: boolean;
  login: (token: string) => Promise<void>;
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

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<AdminUser | null>(null);
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    checkAuthCookie();
  }, []);

  async function loadUser(tokenValue: string) {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/me`, {
        headers: { Authorization: `Bearer ${tokenValue}` },
      });
      if (res.ok) {
        const data = await res.json();
        if (data.user) setUser(data.user);
      }
    } catch {
      // No valid session
    }
  }

  async function checkAuthCookie() {
    const stored = localStorage.getItem('admin_token');
    if (!stored) return;
    setToken(stored);
    await loadUser(stored);
  }

  const login = useCallback(async (newToken: string) => {
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
    await loadUser(newToken);
  }, []);

  const logout = useCallback(async () => {
    await fetch(`${process.env.NEXT_PUBLIC_API_URL || ''}/api/auth/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${localStorage.getItem('admin_token') || ''}` },
    });
    localStorage.removeItem('admin_token');
    setToken(null);
    setUser(null);
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
    <AuthContext.Provider value={{ token, user, isDark, login, logout, toggleDark }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
