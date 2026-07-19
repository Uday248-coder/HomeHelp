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
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-xs font-medium">
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
                    ? 'bg-accent text-foreground-on-accent'
                    : current
                    ? 'bg-warm text-white'
                    : 'bg-border text-foreground-tertiary'
                }`}
              >
                {done ? '✓' : i + 1}
              </div>
              <span className={`text-[10px] ${current ? 'text-warm font-semibold' : 'text-foreground-tertiary'}`}>{s.label}</span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-6 h-0.5 ${i < active ? 'bg-accent' : 'bg-border'}`} />
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
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-sm card-base p-8 animate-fade-in">
        <h1 className="font-display text-2xl font-medium text-foreground mb-1">Track your bookings</h1>
        <p className="text-foreground-tertiary text-sm mb-6">Sign in to see your HomeHelp services.</p>
        {err && <div className="px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">{err}</div>}
        <div className="space-y-4">
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-base" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input-base" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
          <a href="/book" className="block text-center text-sm text-warm hover:text-warm/80">Need to book a service?</a>
        </div>
      </form>
    </div>
  );
}

function BookingCard({ b, onCancel }: { b: Booking; onCancel: (id: string) => void }) {
  const canCancel = b.status === 'pending' || b.status === 'assigned';
  const showPayment = b.status !== 'completed' && b.status !== 'cancelled';
  return (
    <div className="card-base p-6">
      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
        <div>
          <h3 className="font-display text-lg font-medium text-foreground">{b.serviceType}</h3>
          <p className="text-xs text-foreground-tertiary mt-0.5 capitalize">{b.mode.replace('_', ' ')} &middot; {formatDate(b.scheduledAt)}</p>
        </div>
        <div className="text-right">
          <p className="font-bold text-lg text-accent">{price(b)}</p>
          <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider">Total</p>
        </div>
      </div>

      <StatusTimeline status={b.status} />

      <div className="grid grid-cols-2 gap-4 mt-5 text-sm">
        <div>
          <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider mb-0.5">Address</p>
          <p className="text-foreground">{b.customerAddress || '—'}</p>
        </div>
        <div>
          <p className="text-[10px] text-foreground-tertiary uppercase tracking-wider mb-0.5">Duration</p>
          <p className="text-foreground">{b.durationHours ? `${b.durationHours} hr` : '—'}</p>
        </div>
      </div>

      {b.worker && (
        <div className="mt-4 flex items-center gap-3 bg-surface-secondary rounded-xl p-3">
          <div className="w-9 h-9 rounded-full bg-accent text-foreground-on-accent flex items-center justify-center text-sm font-semibold">
            {b.worker.name.charAt(0)}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">{b.worker.name}</p>
            <p className="text-xs text-foreground-tertiary capitalize">{b.worker.workerType.replace('_', ' ')} &middot; ★ {Number(b.worker.averageRating).toFixed(1)}</p>
          </div>
        </div>
      )}

      {(b.startOtp || b.endOtp) && b.status !== 'completed' && b.status !== 'cancelled' && (
        <div className="mt-4 space-y-2">
          {b.startOtp && b.status !== 'in_progress' && (
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
              <span className="text-sm text-amber-800 dark:text-amber-400">Start OTP — share with your worker</span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-300">{b.startOtp}</span>
            </div>
          )}
          {b.endOtp && (
            <div className="flex items-center justify-between bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-2">
              <span className="text-sm text-amber-800 dark:text-amber-400">End OTP — share with your worker</span>
              <span className="font-mono font-bold text-amber-900 dark:text-amber-300">{b.endOtp}</span>
            </div>
          )}
        </div>
      )}

      {b.status === 'completed' && (
        <div className="mt-4 bg-surface-secondary rounded-xl p-4">
          <p className="text-sm font-medium text-foreground">Your rating: {'★'.repeat(b.ratingByUser || 0)}{'☆'.repeat(5 - (b.ratingByUser || 0))}</p>
          {b.reviewText && <p className="text-sm text-foreground-tertiary mt-1">{b.reviewText}</p>}
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
    <div className="min-h-screen bg-surface-secondary">
      <header className="glass-strong sticky top-0 z-50 border-b border-border">
        <div className="container-page max-w-2xl mx-auto flex items-center justify-between h-16 px-4">
          <a href="/" className="font-display text-xl font-medium text-foreground">HomeHelp</a>
          <div className="flex items-center gap-2">
            <button onClick={load} className="text-sm text-foreground-tertiary hover:text-foreground transition-colors" disabled={loading}>
              {loading ? 'Refreshing…' : 'Refresh'}
            </button>
            <button onClick={logout} className="text-sm text-warm hover:text-warm/80 transition-colors">Sign out</button>
          </div>
        </div>
      </header>

      <main className="container-page max-w-2xl mx-auto px-4 py-8">
        <h1 className="font-display text-2xl font-medium text-foreground mb-1">My Bookings</h1>
        <p className="text-foreground-tertiary text-sm mb-6">Track the status of your HomeHelp services in real time.</p>

        {error && <div className="px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">{error}</div>}

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="h-40 card-base skeleton" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="card-base p-10 text-center">
            <p className="text-foreground-tertiary text-sm">You have no bookings yet.</p>
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