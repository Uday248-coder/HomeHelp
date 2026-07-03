'use client';

import { useState, useEffect, useRef } from 'react';
import { auth, formatIndianPhone } from '@/lib/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

function ProgressIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Verify Phone' },
    { num: 3, label: 'Submit' },
  ];

  return (
    <div className="flex items-center justify-between max-w-sm mx-auto mb-10">
      {steps.map((s, i) => {
        const isActive = s.num === step;
        const isDone = s.num < step;
        return (
          <div key={s.num} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                  isDone || isActive ? 'bg-[#1A3C34] text-white' : 'bg-[#E4DFD6] text-[#8C847C]'
                }`}
              >
                {isDone ? (
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                ) : s.num}
              </div>
              <span className={`text-xs mt-1.5 font-medium ${isActive || isDone ? 'text-[#1A3C34]' : 'text-[#8C847C]'}`}>
                {s.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div className={`w-12 h-0.5 mx-2 mb-5 transition-colors ${s.num <= step ? 'bg-[#1A3C34]' : 'bg-[#E4DFD6]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    workerType: 'home_help' as 'home_help' | 'driver' | 'both',
    experience: '0-1',
    otp: '',
    termsAccepted: false,
    submitted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const recaptchaRef = useRef<HTMLDivElement>(null);
  const recaptchaVerifierRef = useRef<RecaptchaVerifier | null>(null);
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!recaptchaVerifierRef.current && recaptchaRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
    }
  }, []);

  const resetRecaptcha = () => {
    recaptchaVerifierRef.current?.clear();
    recaptchaVerifierRef.current = null;
    if (recaptchaRef.current) {
      recaptchaVerifierRef.current = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
    }
  };

  const updateField = (field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const isStep1Valid = form.name.trim().length > 0 && form.email.includes('@') && /^(\+91)?[6-9]\d{9}$/.test(form.phoneNumber.replace(/\s/g, ''));

  const handleSendOtp = async () => {
    if (!form.phoneNumber) { setError('Phone number is required'); return; }
    setError('');
    setLoading(true);
    try {
      const verifier = recaptchaVerifierRef.current;
      if (!verifier) throw new Error('Recaptcha not initialized. Please try again.');
      const confirmation = await signInWithPhoneNumber(auth, formatIndianPhone(form.phoneNumber), verifier);
      confirmationRef.current = confirmation;
      setStep(2);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP';
      console.error('[join] firebase error:', msg);
      const cleanMsg = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setError(cleanMsg || 'Failed to send OTP');
      resetRecaptcha();
    } finally { setLoading(false); }
  };

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    if (!form.email) { setError('Email is required'); return; }
    if (!form.otp) { setError('OTP is required'); return; }
    if (!form.termsAccepted) { setError('You must accept the terms and conditions'); return; }
    if (!confirmationRef.current) { setError('Verification session expired. Please resend OTP.'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await confirmationRef.current.confirm(form.otp);
      const idToken = await result.user.getIdToken();
      if (!idToken) throw new Error('Failed to get auth token');
      const authRes = await fetch(`${API_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.error || 'Authentication failed');
      const workerRes = await fetch(`${API_URL}/api/workers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
        body: JSON.stringify({ name: form.name, email: form.email, workerType: form.workerType, experience: form.experience }),
      });
      const workerData = await workerRes.json();
      if (!workerRes.ok) throw new Error(workerData.error || 'Failed to create worker');
      setForm(prev => ({ ...prev, submitted: true }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      console.error('[join] firebase error:', msg);
      const cleanMsg = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setError(cleanMsg || 'Something went wrong');
    } finally { setLoading(false); }
  };

  if (form.submitted) {
    return (
      <div className="min-h-screen bg-[#F6F4EF] flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl p-10 border border-[#E4DFD6] max-w-md text-center shadow-sm animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-[#1A3C34]/10 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-[#1A3C34]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-[#1C1C1C] mb-2">Application Submitted!</h1>
          <p className="text-[#8C847C] text-sm mb-6">We&apos;ll review your application and get back to you soon.</p>
          <a href="/" className="inline-flex items-center justify-center h-10 px-6 bg-[#C4774B] text-white rounded-full text-sm font-medium hover:bg-[#B06840] transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E4DFD6] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-display text-lg font-medium text-[#1A3C34]">HomeHelp</a>
          <a href="/" className="text-sm text-[#8C847C] hover:text-[#1A3C34] transition-colors">&larr; Back to home</a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <ProgressIndicator step={step} />

        <div className="bg-white rounded-2xl p-6 sm:p-8 border border-[#E4DFD6] shadow-sm animate-fade-in">
          <h2 className="font-display text-xl font-medium text-[#1C1C1C] mb-1">Join as a Worker</h2>
          <p className="text-[#8C847C] text-sm mb-6">Fill in your details to start the onboarding process.</p>

          {error && (
            <div className="bg-red-50/80 border border-red-200 text-red-700 px-4 py-2.5 rounded-xl mb-6 text-sm animate-slide-in">{error}</div>
          )}

          <div className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={form.phoneNumber}
                    onChange={e => updateField('phoneNumber', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                  <p className="text-[11px] text-amber-600 mt-1.5">
                    Testing? Use <code className="font-mono bg-amber-100 px-1 rounded">+91 9999988888</code> → OTP <code className="font-mono bg-amber-100 px-1 rounded">123456</code>
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">I want to work as</label>
                  <select
                    value={form.workerType}
                    onChange={e => updateField('workerType', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  >
                    <option value="home_help">Home Help (Cleaning, Cooking)</option>
                    <option value="driver">Driver</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Years of Experience</label>
                  <select
                    value={form.experience}
                    onChange={e => updateField('experience', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  >
                    <option value="0-1">0–1 years</option>
                    <option value="1-3">1–3 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading || !isStep1Valid}
                  className="w-full h-10 bg-[#C4774B] hover:bg-[#B06840] active:bg-[#9C5A36] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Sending...
                    </>
                  ) : (
                    'Verify Phone Number →'
                  )}
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div className="bg-[#F6F4EF] rounded-xl p-4 text-sm text-[#8C847C]">
                  <p className="font-medium text-[#1C1C1C] mb-0.5">{form.name}</p>
                  <p>{form.phoneNumber} &middot; {form.workerType.replace('_', ' ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">
                    Code sent to {form.phoneNumber}
                  </label>
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="000000"
                    value={form.otp}
                    onChange={e => updateField('otp', e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="w-full h-11 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/40 text-lg text-center font-mono tracking-[0.3em] focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => { setStep(1); confirmationRef.current = null; resetRecaptcha(); }}
                    className="flex-1 h-10 border border-[#E4DFD6] text-[#1C1C1C] rounded-xl font-medium text-sm hover:bg-[#F6F4EF] transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || form.otp.length < 4}
                    className="flex-[2] h-10 bg-[#C4774B] hover:bg-[#B06840] active:bg-[#9C5A36] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      'Submit Application'
                    )}
                  </button>
                </div>

                <label className="flex items-start gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={e => updateField('termsAccepted', e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#C4774B] rounded border-[#E4DFD6]"
                  />
                  <span className="text-sm text-[#8C847C]">
                    I confirm that the information provided is accurate and I agree to the{' '}
                    <a href="#" className="text-[#C4774B] underline">terms and conditions</a>.
                  </span>
                </label>
              </>
            )}
          </div>
        </div>

        <div ref={recaptchaRef} />
      </main>
    </div>
  );
}
