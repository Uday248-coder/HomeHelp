'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';

interface AuthContextType {
  token: string | null;
  isDark: boolean;
  login: (token: string) => void;
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
  const [isDark, setIsDark] = useState(getInitialDark);

  useEffect(() => {
    // Check for cookie-based auth on mount
    checkAuthCookie();
  }, []);

  async function checkAuthCookie() {
    try {
      const res = await fetch('/api/auth/verify', { credentials: 'include' });
      if (res.ok) {
        const data = await res.json();
        if (data.token) {
          setToken(data.token);
        }
      }
    } catch {
      // No valid session
    }
  }

  const login = useCallback(async (newToken: string) => {
    // Store token in httpOnly cookie via API
    try {
      await fetch('/api/auth/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ token: newToken }),
      });
      setToken(newToken);
    } catch (e) {
      console.error('Failed to create session cookie:', e);
    }
  }, []);

  const logout = useCallback(async () => {
    await fetch('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    });
    setToken(null);
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
    <AuthContext.Provider value={{ token, isDark, login, logout, toggleDark }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}