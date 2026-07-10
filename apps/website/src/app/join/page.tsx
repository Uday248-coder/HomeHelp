'use client';

import { useState, useEffect } from 'react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

function ProgressIndicator({ step }: { step: number }) {
  const steps = [
    { num: 1, label: 'Account' },
    { num: 2, label: 'Details' },
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
    password: '',
    phoneNumber: '',
    workerType: 'home_help' as 'home_help' | 'driver' | 'both',
    experience: '0-1',
    termsAccepted: false,
    submitted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('homehelp_join');
      if (saved) setForm((prev) => ({ ...prev, ...JSON.parse(saved) }));
    }
  }, []);

  const updateField = (field: string, value: string | boolean) => {
    setForm((prev) => {
      const next = { ...prev, [field]: value };
      sessionStorage.setItem('homehelp_join', JSON.stringify(next));
      return next;
    });
  };

  const isStep1Valid =
    form.name.trim().length > 0 &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email) &&
    form.password.length >= 6;

  const handleNext = () => {
    if (!isStep1Valid) {
      setError('Please enter your name, a valid email, and a password (min 6 characters)');
      return;
    }
    setError('');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!form.termsAccepted) { setError('You must accept the terms and conditions'); return; }
    setError('');
    setLoading(true);
    try {
      const authRes = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phoneNumber: form.phoneNumber || undefined,
        }),
      });
      const authData = await authRes.json();
      if (!authRes.ok) throw new Error(authData.error || 'Failed to create account');
      if (!authData.token) throw new Error('Authentication failed');

      const workerRes = await fetch(`${API_URL}/api/workers/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authData.token}`,
        },
        body: JSON.stringify({
          name: form.name,
          workerType: form.workerType,
          phoneNumber: form.phoneNumber || undefined,
          experience: form.experience,
        }),
      });
      const workerData = await workerRes.json();
      if (!workerRes.ok) throw new Error(workerData.error || 'Failed to submit application');

      sessionStorage.removeItem('homehelp_join');
      setForm((prev) => ({ ...prev, submitted: true }));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Something went wrong';
      setError(msg);
    } finally {
      setLoading(false);
    }
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
          <p className="text-[#8C847C] text-sm mb-6">We&apos;ll review your application and get back to you soon. Once approved, you can sign in to the Worker Portal to accept jobs.</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="/worker" className="inline-flex items-center justify-center h-10 px-6 bg-[#C4774B] text-white rounded-full text-sm font-medium hover:bg-[#B06840] transition-colors">
              Go to Worker Portal
            </a>
            <a href="/" className="inline-flex items-center justify-center h-10 px-6 border border-[#E4DFD6] text-[#1C1C1C] rounded-full text-sm font-medium hover:bg-[#F6F4EF] transition-colors">
              Back to Home
            </a>
          </div>
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
                    onChange={(e) => updateField('name', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Email Address *</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Password *</label>
                  <input
                    type="password"
                    placeholder="Minimum 6 characters"
                    value={form.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Phone Number (optional)</label>
                  <input
                    type="tel"
                    placeholder="+919876543210"
                    value={form.phoneNumber}
                    onChange={(e) => updateField('phoneNumber', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>

                <button
                  onClick={handleNext}
                  disabled={loading}
                  className="w-full h-10 bg-[#C4774B] hover:bg-[#B06840] active:bg-[#9C5A36] disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-medium transition-colors flex items-center justify-center gap-2"
                >
                  Continue →
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">I want to work as</label>
                  <select
                    value={form.workerType}
                    onChange={(e) => updateField('workerType', e.target.value)}
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
                    onChange={(e) => updateField('experience', e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  >
                    <option value="0-1">0–1 years</option>
                    <option value="1-3">1–3 years</option>
                    <option value="3-5">3–5 years</option>
                    <option value="5+">5+ years</option>
                  </select>
                </div>

                <label className="flex items-start gap-3 pt-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.termsAccepted}
                    onChange={(e) => updateField('termsAccepted', e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-[#C4774B] rounded border-[#E4DFD6]"
                  />
                  <span className="text-sm text-[#8C847C]">
                    I confirm that the information provided is accurate and I agree to the{' '}
                    <a href="#" className="text-[#C4774B] underline">terms and conditions</a>.
                  </span>
                </label>

                <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => setStep(1)}
                    className="flex-1 h-10 border border-[#E4DFD6] text-[#1C1C1C] rounded-xl font-medium text-sm hover:bg-[#F6F4EF] transition-colors"
                  >
                    ← Back
                  </button>
                  <button
                    onClick={handleSubmit}
                    disabled={loading}
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
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
