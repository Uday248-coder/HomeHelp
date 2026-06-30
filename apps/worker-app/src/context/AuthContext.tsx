import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import { api } from '../api/client';
import { sendPhoneOTP, verifyPhoneOTP, getIdToken, onAuthStateChanged, signOut } from '../lib/firebase-auth';
import { Worker } from '../types';

interface AuthContextType {
  token: string | null;
  worker: Worker | null;
  isLoading: boolean;
  login: (token: string) => Promise<void>;
  logout: () => Promise<void>;
  sendOtp: (phone: string) => Promise<{ success: boolean; verificationId?: string; error?: string }>;
  verifyOtp: (verificationId: string, otp: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [worker, setWorker] = useState<Worker | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(async (firebaseUser) => {
      if (firebaseUser) {
        const idToken = await getIdToken();
        if (idToken) {
          await login(idToken);
        }
      } else {
        setToken(null);
        setWorker(null);
      }
      setIsLoading(false);
    });

    // Also try to load stored token as fallback
    loadStoredAuth();

    return unsubscribe;
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync('worker_token');
      if (storedToken) {
        setToken(storedToken);
        const workerData = await api.getWorkerProfile();
        setWorker(workerData);
      }
    } catch {
      await SecureStore.deleteItemAsync('worker_token');
    } finally {
      setIsLoading(false);
    }
  }

  const login = useCallback(async (newToken: string) => {
    await SecureStore.setItemAsync('worker_token', newToken);
    setToken(newToken);
    const workerData = await api.getWorkerProfile();
    setWorker(workerData);
  }, []);

  const logout = useCallback(async () => {
    await SecureStore.deleteItemAsync('worker_token');
    setToken(null);
    setWorker(null);
    await signOut();
  }, []);

  const sendOtp = useCallback(async (phone: string) => {
    return sendPhoneOTP(phone);
  }, []);

  const verifyOtp = useCallback(async (verificationId: string, otp: string) => {
    const result = await verifyPhoneOTP(verificationId, otp);
    if (!result.success) {
      throw new Error(result.error || 'Invalid OTP');
    }
    const idToken = await getIdToken();
    if (idToken) {
      await login(idToken);
    }
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