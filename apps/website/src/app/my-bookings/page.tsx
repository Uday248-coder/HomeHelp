'use client';

import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import { UpiPayment } from '@/components/UpiPayment';
import { getToken, clearToken, login } from '@/lib/auth';
import type { Booking, BookingStatus } from '@/lib/types';

const STEPS: { key: BookingStatus; label: string }[] = [
  { key: 'pending', label: 'Pending' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'in_progress', label: 'In Progress' },
  { key: 'completed', label: 'Completed' },
];

const STATUS_RANK: Record<BookingStatus, number> = {
  pending: 0, assigned: 1, in_progress: 2, completed: 3, cancelled: -1,
};

function statusIndex(status: BookingStatus): number {
  return STEPS.findIndex((s) => s.key === status);
}

function price(b: Booking): string {
  const rate = Number(b.hourlyRate) || 0;
  const hrs = Number(b.durationHours) || 0;
  return `₹${rate * hrs}`;
}

function formatDate(d?: string | null): string {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-IN', {
    dateStyle: 'medium', timeStyle: 'short',
  });
}

function StatusTimeline({ status }: { status: BookingStatus }) {
  if (status === 'cancelled') {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
        Cancelled
      </div>
    );
  }
  const active = statusIndex(status);
  return (
    <div className="flex items-center gap-1">
      {STEPS.map((s, i) => {
        const done = i < active;
        const current = i === active;
        return (
          <div key={s.key} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                  done
                    ? 'bg-[#1A3C34] text-white'
                    : current
                    ? 'bg-[#C4774B] text-white'
                    : 'bg-[#E4DFD6] text-[#8C847C]'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] ${current ? 'text-[#C4774B] font-semibold' : 'text-[#8C847C]'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${i < active ? 'bg-[#1A3C34]' : 'bg-[#E4DFD6]'}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

function LoginView({ onOk }: { onOk: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErr(''); setLoading(true);
    try {
      await login(email, password);
      onOk();
    } catch (e: unknown) {
      setErr(e instanceof Error ? e.message : 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-[#F6F4EF] flex items-center justify-center px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-sm bg-white rounded-2xl border border-[#E4DFD6] shadow-sm p-8">
        <h1 className="font-display text-2xl font-medium text-[#1C1C1C] mb-1">Track your bookings</h1>
        <p className="text-[#8C847C] text-sm mb-6">Sign in to see your HomeHelp services.</p>
        {err && <div className="px-4 py-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-sm mb-4">{err}</div>}
        <div className="space-y-4">
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
          <a href="/book" className="block text-center text-sm text-[#C4774B] hover:text-[#A85F38]">Need to book a service?</a>
        </div>
      </form>
    </div>
  );
}

function BookingCard({ b, onCancel }: { b: Booking; onCancel: (id: string) => void }) {
  const canCancel = b.status === 'pending' || b.status === 'assigned';
  const showPayment = b.status !== 'completed' && b.status !== 'cancelled';
  return (
    <div className="bg-white rounded-2xl border border-[#E4DFD6] shadow-sm p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-medium text-[#1C1C1C]">{b.serviceType}</h3>
          <p className="text-xs text-[#8C847C] mt-0.5 capitalize">{b.mode.replace('_', ' ')} &middot; {formatDate(b.scheduledAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-[#1A3C34]">{price(b)}</p>
          <p className="text-[10px] text-[#8C847C] uppercase tracking-wider">Total</p>
        </div>
      </div>

      <StatusTimeline status={b.status} />

      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <div>
          <p className="text-[10px] text-[#8C847C] uppercase tracking-wider mb-0.5">Address</p>
          <p className="text-[#1C1C1C]">{b.customerAddress || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] text-[#8C847C] uppercase tracking-wider mb-0.5">Duration</p>
          <p className="text-[#1C1C1C]">{b.durationHours ? `${b.durationHours} hr` : '—'}</p>
        </div>
      </div>

      {b.worker && (
        <div className="mt-4 flex items-center gap-3 bg-[#F6F4EF] rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-[#1A3C34] text-white flex items-center justify-center text-sm font-semibold">
            {b.worker.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-[#1C1C1C]">{b.worker.name}</p>
            <p className="text-xs text-[#8C847C] capitalize">{b.worker.workerType.replace('_', ' ')} &middot; ★ {Number(b.worker.averageRating).toFixed(1)}</p>
          </div>
        </div>
      )}

      {(b.startOtp || b.endOtp) && b.status !== 'completed' && b.status !== 'cancelled' && (
        <div className="mt-4 space-y-2">
          {b.startOtp && b.status !== 'in_progress' && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <span className="text-sm text-amber-800">Start OTP — share with your worker</span>
              <span className="font-mono font-bold text-amber-900">{b.startOtp}</span>
            </div>
          )}
          {b.endOtp && (
            <div className="flex items-center justify-between bg-amber-50 border border-amber-200 rounded-xl px-4 py-2">
              <span className="text-sm text-amber-800">End OTP — share with your worker</span>
              <span className="font-mono font-bold text-amber-900">{b.endOtp}</span>
            </div>
          )}
        </div>
      )}

      {b.status === 'completed' && (
        <div className="mt-4 bg-[#F6F4EF] rounded-xl p-4">
          <p className="text-sm font-medium text-[#1C1C1C]">Your rating: {'★'.repeat(b.ratingByUser || 0)}{'☆'.repeat(5 - (b.ratingByUser || 0))}</p>
          {b.reviewText && <p className="text-sm text-[#8C847C] mt-1">{b.reviewText}</p>}
        </div>
      )}

      {canCancel && (
        <div className="mt-5 flex justify-end">
          <Button variant="destructive" size="sm" onClick={() => onCancel(b.id)}>Cancel Booking</Button>
        </div>
      )}

      {showPayment && <UpiPayment bookingId={b.id} />}
    </div>
  );
}

export default function MyBookingsPage() {
  const [token, setTokenState] = useState<string | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const t = getToken();
      if (!t) { setTokenState(null); setLoading(false); return; }
      setTokenState(t);
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com'}/api/bookings`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load bookings');
      setBookings(data.bookings || []);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load bookings');
    } finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const handleCancel = async (id: string) => {
    if (!confirm('Cancel this booking?')) return;
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com'}/api/bookings/${id}/cancel`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error('Cancel failed');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Cancel failed');
    }
  };

  const logout = () => { clearToken(); setTokenState(null); setBookings([]); };

  if (!token) return <LoginView onOk={load} />;

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E4DFD6] sticky top-0 z-50">
        <div className="container-page max-w-2xl mx-auto flex items-center justify-between h-16 px-4">
          <a href="/" className="font-display text-xl font-medium text-[#1C1C1C]">HomeHelp</a>
          <div className="flex items-center gap-2">
            <button onClick={load} className="text-sm text-[#8C847C] hover:text-[#1A3C34] transition-colors" disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button onClick={logout} className="text-sm text-[#C4774B] hover:text-[#A85F38] transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-page max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-medium text-[#1C1C1C] mb-1">My Bookings</h1>
        <p className="text-[#8C847C] text-sm mb-6">Track the status of your HomeHelp services in real time.</p>

        {error && <div className="px-4 py-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-sm mb-4">{error}</div>}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-40 bg-white rounded-2xl border border-[#E4DFD6] animate-pulse" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#E4DFD6] p-10 text-center">
            <p className="text-[#8C847C] text-sm">You have no bookings yet.</p>
            <a href="/book" className="inline-block mt-4"><Button size="lg">Book a Service</Button></a>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((b) => <BookingCard key={b.id} b={b} onCancel={handleCancel} />)}
          </div>
        )}
      </main>
    </div>
  );
}
