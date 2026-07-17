import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { Worker } from '../types';

interface AuthContextType {
  token: string | null;
  worker: Worker | null;
  isLoading: boolean;
  needsWorkerProfile: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    name: string;
    workerType: 'home_help' | 'driver' | 'both';
    phoneNumber?: string;
  }) => Promise<void>;
  completeProfile: (data: {
    name: string;
    workerType: 'home_help' | 'driver' | 'both';
    phoneNumber?: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [needsWorkerProfile, setNeedsWorkerProfile] = useState(false);

  useEffect(() => {
    loadStoredAuth();
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync('worker_token');
      if (storedToken) {
        setToken(storedToken);
        const workerData = await api.getWorkerProfile();
        setWorker(workerData);
      }
    } catch (err: any) {
      const status = err?.response?.status;
      if (status === 404) {
        // Server explicitly says "no worker profile for this user" — surface
        // the profile-creation UI instead of nuking the session.
        setNeedsWorkerProfile(true);
      } else if (status === 401 || status === 403) {
        // Token is invalid/expired — drop it so the next render prompts login.
        await SecureStore.deleteItemAsync('worker_token');
        setToken(null);
        setWorker(null);
      }
      // Any other error (offline / unknown) → keep the token, let the user retry.
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (email: string, password: string) => {
    const res = await api.login(email, password);
    await SecureStore.setItemAsync('worker_token', res.token);
    setToken(res.token);
    try {
      const workerData = await api.getWorkerProfile();
      setWorker(workerData);
      setNeedsWorkerProfile(false);
    } catch (err: any) {
      if (err?.response?.status === 404) {
        setNeedsWorkerProfile(true);
        setWorker(null);
      } else {
        throw err;
      }
    }
  }, []);

  const register = useCallback(async (data: {
    email: string;
    password: string;
    name: string;
    workerType: 'home_help' | 'driver' | 'both';
    phoneNumber?: string;
  }) => {
    const res = await api.register({
      email: data.email,
      password: data.password,
      name: data.name,
      phoneNumber: data.phoneNumber,
    });
    await SecureStore.setItemAsync('worker_token', res.token);
    setToken(res.token);
    const workerData = await api.registerWorkerProfile({
      name: data.name,
      workerType: data.workerType,
      phoneNumber: data.phoneNumber,
    });
    setWorker(workerData);
    setNeedsWorkerProfile(false);
  }, []);

  const completeProfile = useCallback(async (data: {
    name: string;
    workerType: 'home_help' | 'driver' | 'both';
    phoneNumber?: string;
  }) => {
    const workerData = await api.registerWorkerProfile(data);
    setWorker(workerData);
    setNeedsWorkerProfile(false);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('worker_token');
    setToken(null);
    setWorker(null);
    setNeedsWorkerProfile(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{ token, worker, isLoading, needsWorkerProfile, login, register, completeProfile, logout }}
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
