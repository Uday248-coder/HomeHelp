'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
    setEmail(params.get('email') || '');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) { setError('Missing or invalid reset link'); return; }
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    if (password !== confirm) { setError('Passwords do not match'); return; }
    setError(''); setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Reset failed');
      setDone(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Reset failed');
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
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-medium text-[#1C1C1C]">Set a new password</h1>
          <p className="text-[#8C847C] text-sm mt-1 mb-6">
            Choose a new password for {email ? <span className="font-medium text-[#1C1C1C]">{email}</span> : 'your account'}.
          </p>

          {done ? (
            <div className="space-y-4 animate-fade-in">
              <div className="px-4 py-3 rounded-xl bg-emerald-50/80 border border-emerald-200 text-emerald-700 text-sm">
                Your password has been reset. You can now sign in.
              </div>
              <Button className="w-full" size="lg" onClick={() => router.push('/book')}>
                Continue to sign in
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
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">New password</label>
                <input
                  type="password"
                  placeholder="At least 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Confirm password</label>
                <input
                  type="password"
                  placeholder="Re-enter password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                />
              </div>
              <Button type="submit" className="w-full" size="lg" loading={loading}>
                Reset password
              </Button>
            </form>
          )}
        </div>
        <p className="text-xs text-[#8C847C] text-center mt-6">
          Admins: after resetting, return to the admin panel to sign in.
        </p>
      </div>
    </div>
  );
}
