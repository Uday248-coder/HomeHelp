import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { User } from '../types';

interface AuthContextType {
  token: string | null;
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; name?: string; phoneNumber?: string }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      if (storedToken) {
        setToken(storedToken);
        const userData = await api.getMe();
        setUser(userData);
      }
    } catch (err: unknown) {
      // Only clear the token if the server explicitly told us the session is
      // dead (401) or the token has no associated user (404). Any other error
      // (offline, DNS blip, timeout) should leave the stored token alone so a
      // flaky network doesn't log the user out spuriously.
      const status =
        err && typeof err === 'object' && 'response' in err
          ? (err as { response?: { status?: number } }).response?.status
          : undefined;
      if (status === 401 || status === 404) {
        await SecureStore.deleteItemAsync('auth_token');
        setToken(null);
        setUser(null);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    await SecureStore.setItemAsync('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const register = useCallback(async (data: { email: string; password: string; name?: string; phoneNumber?: string }) => {
    const res = await api.register(data);
    await SecureStore.setItemAsync('auth_token', res.token);
    setToken(res.token);
    setUser(res.user);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('auth_token');
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ token, user, isLoading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
