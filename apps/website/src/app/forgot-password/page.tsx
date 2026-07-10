'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);
  const [devLink, setDevLink] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) { setError('Enter your account email'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      setSent(true);
      if (data.devResetUrl) setDevLink(data.devResetUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl border border-[#E4DFD6] shadow-sm p-8">
          <div className="w-12 h-12 rounded-xl bg-[#1A3C34] flex items-center justify-center mb-5">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-[#1C1C1C]">Reset your password</h1>
          <p className="text-[#8C847C] text-sm mt-1 mb-6">
            Enter the email on your account and we&apos;ll send a reset link.
          </p>

          {sent ? (
            <div className="space-y-4 animate-fade-in">
              <div className="px-4 py-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-700 text-sm">
                If an account exists for that email, a reset link is on its way.
              </div>
              {devLink && (
                <div className="px-4 py-3 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-700 text-sm break-all">
                  <strong>Dev mode:</strong> no email configured, so use this link:
                  <br />
                  <a href={devLink} className="underline font-medium">{devLink}</a>
                </div>
              )}
              <Button variant="outline" className="w-full" onClick={() => router.push('/book')}>
                Back to sign in
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="px-4 py-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-sm">
                  {error}
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Email</label>
                <input
                  type="email"
                  required
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Send reset link
              </Button>
              <button
                type="button"
                onClick={() => router.push('/book')}
                className="w-full text-sm text-[#8C847C] hover:text-[#1A3C34] transition-colors"
              >
                Back to sign in
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
