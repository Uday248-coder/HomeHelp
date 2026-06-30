'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/lib/auth-context';
import { api } from '@/lib/api';
import { auth } from '@/lib/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';

export default function LoginScreen() {
  const { login } = useAuth();
  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loginError, setLoginError] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [verifyingOtp, setVerifyingOtp] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!recaptchaVerifierRef.current && recaptchaRef.current) {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
      recaptchaVerifierRef.current = verifier;
    }
  }, []);

  const handleSendOtp = async () => {
    setLoginError('');
    if (!phone || phone.length < 10) {
      setLoginError('Please enter a valid phone number');
      return;
    }
    setSendingOtp(true);
    try {
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) {
        throw new Error('Recaptcha not initialized. Please try again.');
      }
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      confirmationRef.current = confirmation;
      setOtpSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP';
      const cleanMsg = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setLoginError(cleanMsg || 'Failed to send OTP');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleVerifyOtp = async () => {
    setLoginError('');
    setVerifyingOtp(true);
    try {
      const result = await confirmationRef.current!.confirm(otp);
      const idToken = await result.user.getIdToken();
      const data = await api.firebaseAuth(idToken);
      login(data.token);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to verify OTP';
      const cleanMsg = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setLoginError(cleanMsg || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl p-8 w-full max-w-sm shadow-lg">
        <div className="text-center mb-8">
          <div className="w-14 h-14 rounded-xl bg-emerald-600 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-foreground">HomeHelp Admin</h1>
          <p className="text-sm text-muted-foreground mt-1">Sign in to manage operations</p>
        </div>

        {loginError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 px-4 py-2.5 rounded-lg mb-4 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {loginError}
          </div>
        )}

        {!otpSent ? (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Phone Number</label>
              <input
                type="tel"
                placeholder="+919876543210"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>
            <button
              onClick={handleSendOtp}
              disabled={sendingOtp}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {sendingOtp ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Sending...
                </>
              ) : (
                'Send OTP'
              )}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground text-center">
              OTP sent to <span className="font-medium text-foreground">{phone}</span>
            </p>
            <div>
              <label className="text-sm font-medium text-foreground mb-1.5 block">Enter OTP</label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyDown={(e) => e.key === 'Enter' && otp.length === 6 && handleVerifyOtp()}
                maxLength={6}
                className="w-full px-4 py-2.5 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all text-center font-mono text-lg tracking-widest"
              />
            </div>
            <button
              onClick={handleVerifyOtp}
              disabled={verifyingOtp || otp.length < 4}
              className="w-full bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white py-2.5 rounded-lg font-medium transition-colors text-sm flex items-center justify-center gap-2"
            >
              {verifyingOtp ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Verifying...
                </>
              ) : (
                'Verify OTP'
              )}
            </button>
            <button
              onClick={() => { setOtpSent(false); setOtp(''); setLoginError(''); }}
              className="w-full text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Change phone number
            </button>
          </div>
        )}

        <div ref={recaptchaRef} />
      </div>
    </div>
  );
}
