import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { Worker } from '../types';

interface AuthContextType {
  token: string | null;
  worker: Worker | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<any>;
  verifyOtp: (phone: string, otp: string) => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadToken();
  }, []);

  async function loadToken() {
    try {
      const storedToken = await SecureStore.getItemAsync('worker_token');
      if (storedToken) {
        setToken(storedToken);
        await fetchProfile(storedToken);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchProfile(t: string) {
    try {
      const me = await api.getWorkerProfile();
      setWorker(me);
    } catch {
      await SecureStore.deleteItemAsync('worker_token');
      setToken(null);
    }
  }

  const login = useCallback(async (newToken: string) => {
    await SecureStore.setItemAsync('worker_token', newToken);
    setToken(newToken);
    await fetchProfile(newToken);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('worker_token');
    setToken(null);
    setWorker(null);
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    return api.sendOtp(phone);
  }, []);

  const verifyOtp = useCallback(async (phone: string, otp: string): Promise<boolean> => {
    const data = await api.verifyOtp(phone, otp);
    if (data.token) {
      await login(data.token);
      return true;
    }
    return false;
  }, [login]);

  return (
    <AuthContext.Provider value={{ token, worker, isLoading, login, logout, sendOtp, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
