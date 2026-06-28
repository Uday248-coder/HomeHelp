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
    const saved = localStorage.getItem('admin_token');
    if (saved) setToken(saved);
  }, []);

  const login = useCallback((newToken: string) => {
    // TODO(security): Token stored in plain localStorage — XSS-readable.
    // Migrate to httpOnly cookie session when possible after setting up a
    // session endpoint. localStorage was chosen for simplicity in MVP but
    // the admin dashboard holds the most sensitive data access.
    localStorage.setItem('admin_token', newToken);
    setToken(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('admin_token');
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
