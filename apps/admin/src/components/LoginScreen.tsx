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
  const phoneInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!recaptchaVerifierRef.current && recaptchaRef.current) {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current, { size: 'invisible' });
      recaptchaVerifierRef.current = verifier;
    }
  }, []);

  useEffect(() => {
    if (!otpSent) phoneInputRef.current?.focus();
  }, [otpSent]);

  const handleSendOtp = async () => {
    setLoginError('');
    if (!phone || phone.length < 10) {
      setLoginError('Please enter a valid phone number');
      return;
    }
    setSendingOtp(true);
    try {
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) throw new Error('Recaptcha not initialized');
      const formattedPhone = phone.startsWith('+') ? phone : `+${phone}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      confirmationRef.current = confirmation;
      setOtpSent(true);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP';
      const clean = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setLoginError(clean || 'Failed to send OTP');
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
      const clean = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setLoginError(clean || 'Invalid OTP');
    } finally {
      setVerifyingOtp(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm animate-scale-in relative">
        <div className="card-dashboard p-8 shadow-lg">
          <header className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center mx-auto mb-4 shadow-sm">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6z" />
              </svg>
            </div>
            <h1 className="text-xl font-semibold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground mt-1">Sign in to manage operations</p>
          </header>

          {loginError && (
            <div className="bg-danger/10 border border-danger/20 text-danger px-4 py-2.5 rounded-lg mb-5 text-sm flex items-center gap-2 animate-slide-in" role="alert">
              <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {loginError}
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label htmlFor="phone" className="text-sm font-medium text-foreground mb-1.5 block">
                  Phone Number
                </label>
                <input
                  ref={phoneInputRef}
                  id="phone"
                  type="tel"
                  placeholder="+919876543210"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendOtp()}
                  className="w-full h-9 px-3 bg-background border border-border rounded-lg text-sm text-foreground placeholder:text-muted-foreground transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent hover:border-border-hover"
                  autoComplete="tel"
                  aria-label="Phone number"
                />
              </div>
              <button
                onClick={handleSendOtp}
                disabled={sendingOtp}
                className="w-full h-9 bg-accent hover:bg-accent/90 active:bg-accent/80 disabled:opacity-50 disabled:pointer-events-none text-white rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
              >
                {sendingOtp ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
                Code sent to{' '}
                <button
                  onClick={() => { setOtpSent(false); setOtp(''); setLoginError(''); }}
                  className="font-medium text-foreground hover:text-accent transition-colors"
                >
                  {phone}
                </button>
              </p>
              <div>
                <label htmlFor="otp" className="text-sm font-medium text-foreground mb-1.5 block">
                  Enter Code
                </label>
                <input
                  id="otp"
                  type="text"
                  inputMode="numeric"
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  onKeyDown={(e) => e.key === 'Enter' && otp.length >= 4 && handleVerifyOtp()}
                  maxLength={6}
                  className="w-full h-11 px-3 bg-background border border-border rounded-lg text-lg text-foreground placeholder:text-muted-foreground/40 transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent text-center font-mono tracking-[0.3em]"
                  autoComplete="one-time-code"
                  aria-label="OTP code"
                />
              </div>
              <button
                onClick={handleVerifyOtp}
                disabled={verifyingOtp || otp.length < 4}
                className="w-full h-9 bg-accent hover:bg-accent/90 active:bg-accent/80 disabled:opacity-50 disabled:pointer-events-none text-white rounded-lg text-sm font-medium transition-all duration-150 flex items-center justify-center gap-2"
              >
                {verifyingOtp ? (
                  <>
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Verifying...
                  </>
                ) : (
                  'Verify Code'
                )}
              </button>
              <button
                onClick={() => { setOtpSent(false); setOtp(''); setLoginError(''); }}
                className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Use a different number
              </button>
            </div>
          )}

          <div ref={recaptchaRef} />
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          Signed in as administrator
        </p>
      </div>
    </div>
  );
}
