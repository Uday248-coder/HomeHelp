'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { auth } from '@/lib/firebase';
import { signInWithPhoneNumber, RecaptchaVerifier, type ConfirmationResult } from 'firebase/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function SuccessAnimation() {
  return (
    <div className="animate-fade-in-up">
      <div className="mx-auto mb-6 w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
        <svg className="w-8 h-8 text-emerald-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>
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
  const confirmationRef = useRef<ConfirmationResult | null>(null);

  useEffect(() => {
    if (!(window as unknown as Record<string, boolean>).recaptchaVerifier) {
      const verifier = new RecaptchaVerifier(auth, recaptchaRef.current!, {
        size: 'invisible',
      });
      (window as unknown as Record<string, RecaptchaVerifier>).recaptchaVerifier = verifier;
    }
  }, []);

  const updateField = useCallback((field: string, value: string | boolean) => {
    setForm(prev => ({ ...prev, [field]: value }));
  }, []);

  const isStep1Valid = form.name.trim().length > 0 && form.email.includes('@') && /^\+?[1-9]\d{9,14}$/.test(form.phoneNumber);
  const isStep2Valid = form.otp.trim().length >= 4;

  const handleSendOtp = async () => {
    if (!form.phoneNumber) { setError('Phone number is required'); return; }
    setError('');
    setLoading(true);
    try {
      const verifier = (window as unknown as Record<string, RecaptchaVerifier>).recaptchaVerifier;
      if (!verifier) {
        throw new Error('Recaptcha not initialized. Please try again.');
      }
      const formattedPhone = form.phoneNumber.startsWith('+') ? form.phoneNumber : `+${form.phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      confirmationRef.current = confirmation;
      setStep(2);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Failed to send OTP';
      const cleanMsg = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setError(cleanMsg || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    if (!form.email) { setError('Email is required'); return; }
    if (!form.otp) { setError('OTP is required'); return; }
    if (!form.termsAccepted) { setError('You must accept the terms and conditions'); return; }
    setError('');
    setLoading(true);
    try {
      const result = await confirmationRef.current!.confirm(form.otp);
      const idToken = await result.user.getIdToken();

      const authRes = await fetch(`${API_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken }),
      });
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.error || 'Authentication failed');

      const workerRes = await fetch(`${API_URL}/api/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          phoneNumber: form.phoneNumber,
          workerType: form.workerType,
          experience: form.experience,
        }),
      });
      const workerData = await workerRes.json();
      if (!workerRes.ok) throw new Error(workerData.error || 'Failed to create worker');

      setForm(prev => ({ ...prev, submitted: true }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      const cleanMsg = msg.replace('Firebase: ', '').replace(/\(.*\)\.?/, '').trim();
      setError(cleanMsg || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (form.submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-10 shadow-sm border max-w-md text-center animate-fade-in-up">
          <SuccessAnimation />
          <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">We&apos;ll review your application and get back to you soon.</p>
          <a href="/" className="inline-block bg-emerald-600 text-white px-8 py-3 rounded-full font-medium hover:bg-emerald-700 transition-colors">
            Back to Home
          </a>
        </div>
      </div>
    );
  }

  const progressSteps = [
    { num: 1, label: 'Personal Info' },
    { num: 2, label: 'Verify Phone' },
    { num: 3, label: 'Submit' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/"><h1 className="text-2xl font-bold text-emerald-600">HomeHelp</h1></a>
          <a href="/" className="text-sm text-gray-600 hover:text-emerald-600">Back to home</a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="mb-10">
          <div className="flex items-center justify-between max-w-sm mx-auto">
            {progressSteps.map((s, i) => {
              const isActive = s.num === step;
              const isDone = s.num < step;
              return (
                <div key={s.num} className="flex items-center">
                  <div className="flex flex-col items-center">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                        isDone ? 'bg-emerald-600 text-white' : isActive ? 'bg-emerald-600 text-white' : 'bg-gray-200 text-gray-500'
                      }`}
                    >
                      {isDone ? (
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      ) : (
                        s.num
                      )}
                    </div>
                    <span className={`text-xs mt-1.5 ${isActive || isDone ? 'text-emerald-600 font-medium' : 'text-gray-400'}`}>
                      {s.label}
                    </span>
                  </div>
                  {i < progressSteps.length - 1 && (
                    <div className={`w-12 h-0.5 mx-2 mb-5 ${s.num <= step ? 'bg-emerald-600' : 'bg-gray-200'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-bold mb-2">Join as a Worker</h2>
          <p className="text-gray-600 mb-8">Fill in your details to start the onboarding process.</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm animate-fade-in-up">{error}</div>
          )}

          <div className="space-y-5">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    placeholder="Your full name"
                    value={form.name}
                    onChange={e => updateField('name', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => updateField('email', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number *</label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={form.phoneNumber}
                    onChange={e => updateField('phoneNumber', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">I want to work as</label>
                  <select
                    value={form.workerType}
                    onChange={e => updateField('workerType', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="home_help">Home Help (Cleaning, Cooking)</option>
                    <option value="driver">Driver</option>
                    <option value="both">Both</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
                  <select
                    value={form.experience}
                    onChange={e => updateField('experience', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
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
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <Spinner />
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
                <div className="bg-gray-50 rounded-lg p-4 text-sm text-gray-600">
                  <p className="font-medium text-gray-900 mb-1">{form.name}</p>
                  <p>{form.phoneNumber} · {form.workerType.replace('_', ' ')}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    OTP sent to {form.phoneNumber}
                  </label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={form.otp}
                    onChange={e => updateField('otp', e.target.value)}
                    maxLength={6}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 text-center text-lg font-mono tracking-widest"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 border border-gray-300 text-gray-700 py-3 rounded-lg font-medium hover:bg-gray-50 transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading || !isStep2Valid}
                    className="flex-[2] bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Spinner />
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
                    className="mt-1 h-4 w-4 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                  />
                  <span className="text-sm text-gray-600">
                    I confirm that the information provided is accurate and I agree to the{' '}
                    <a href="#" className="text-emerald-600 underline">terms and conditions</a>
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
