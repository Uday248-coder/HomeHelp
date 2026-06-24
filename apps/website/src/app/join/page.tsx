'use client';

import { useState } from 'react';
import type { SendOtpResponse, VerifyOtpResponse, WorkerResponse, ApiError } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export default function JoinPage() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    phoneNumber: '',
    workerType: 'home_help' as 'home_help' | 'driver' | 'both',
    otp: '',
    submitted: false,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSendOtp = async () => {
    if (!form.phoneNumber) { setError('Phone number is required'); return; }
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: form.phoneNumber }),
      });
      const data: SendOtpResponse = await res.json();
      if (!res.ok) throw new Error((data as unknown as ApiError).error);
      alert(`OTP sent: ${data.otp}`);
      setStep(2);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name) { setError('Name is required'); return; }
    if (!form.otp) { setError('OTP is required'); return; }
    setError('');
    setLoading(true);
    try {
      const verifyRes = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: form.phoneNumber, otp: form.otp }),
      });
      const verifyData: VerifyOtpResponse = await verifyRes.json();
      if (!verifyRes.ok) throw new Error((verifyData as unknown as ApiError).error);

      const workerRes = await fetch(`${API_URL}/api/workers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${verifyData.token}`,
        },
        body: JSON.stringify({
          name: form.name,
          phoneNumber: form.phoneNumber,
          workerType: form.workerType,
        }),
      });
      const workerData: WorkerResponse = await workerRes.json();
      if (!workerRes.ok) throw new Error((workerData as unknown as ApiError).error);

      setForm(prev => ({ ...prev, submitted: true }));
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  if (form.submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-sm border max-w-md text-center">
          <div className="text-4xl mb-4">🎉</div>
          <h1 className="text-2xl font-bold mb-2">Application Submitted!</h1>
          <p className="text-gray-600 mb-6">We&apos;ll review your application and get back to you soon.</p>
          <a href="/" className="text-emerald-600 hover:underline">Back to home</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/"><h1 className="text-2xl font-bold text-emerald-600">HomeHelp</h1></a>
          <a href="/" className="text-sm text-gray-600 hover:text-emerald-600">Back to home</a>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl p-8 shadow-sm border">
          <h2 className="text-2xl font-bold mb-2">Join as a Worker</h2>
          <p className="text-gray-600 mb-8">Fill in your details to start the onboarding process.</p>

          {error && (
            <div className="bg-red-50 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">{error}</div>
          )}

          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                placeholder="Your full name"
                value={form.name}
                onChange={e => updateField('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
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

            {step === 1 ? (
              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Verify Phone Number'}
              </button>
            ) : (
              <>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">OTP sent to {form.phoneNumber}</label>
                  <input
                    type="text"
                    placeholder="Enter OTP"
                    value={form.otp}
                    onChange={e => updateField('otp', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <button
                  onClick={handleSubmit}
                  disabled={loading}
                  className="w-full bg-emerald-600 text-white py-3 rounded-lg font-medium hover:bg-emerald-700 disabled:opacity-50"
                >
                  {loading ? 'Submitting...' : 'Submit Application'}
                </button>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
