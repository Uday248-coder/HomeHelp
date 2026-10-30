'use client';

import { API_URL } from '@/lib/config';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { getToken, clearToken, login } from '@/lib/auth';
import type { Booking, BookingStatus } from '@/lib/types';
import dynamic from 'next/dynamic';
import { useGeolocation } from '@/hooks/useGeolocation';
import { useRoute } from '@/hooks/useRoute';
import type { LatLng } from '@/lib/types';
import { io, Socket } from 'socket.io-client';
import { KycDashboard } from './KycDashboard';

const LiveMap = dynamic(() => import('@/components/map/LiveMap'), {
  ssr: false,
  loading: () => <div className="h-[250px] w-full rounded-2xl skeleton" />,
});



const STATUS_LABEL: Record<BookingStatus, string> = {
  pending: 'Pending', assigned: 'Assigned', in_progress: 'In Progress',
  completed: 'Completed', cancelled: 'Cancelled',
};

function LoginView({ onOk }: { onOk: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setErr(''); setLoading(true);
    try { await login(email, password); onOk(); }
    catch (e: unknown) { setErr(e instanceof Error ? e.message : 'Login failed'); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-surface-secondary flex items-center justify-center px-4 py-12">
      <form onSubmit={submit} className="w-full max-w-sm card-base p-8 animate-fade-in">
        <h1 className="font-display text-2xl font-medium text-foreground mb-1">Worker Portal</h1>
        <p className="text-foreground-tertiary text-sm mb-6">Sign in to accept and manage jobs.</p>
        {err && <div className="px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">{err}</div>}
        <div className="space-y-4">
          <input type="email" required placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)}
            className="input-base" />
          <input type="password" required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="input-base" />
          <Button type="submit" className="w-full" size="lg" loading={loading}>Sign In</Button>
          <a href="/join" className="block text-center text-sm text-warm hover:text-warm/80">Become a worker</a>
        </div>
      </form>
    </div>
  );
}

function JobCard({ b, mode, onAccept, onStart, onComplete, busy }: {
  b: Booking; mode: 'available' | 'mine';
  onAccept: (id: string) => void; onStart: (id: string, otp: string) => void;
  onComplete: (id: string, otp: string, rating: number, review: string) => void; busy: boolean;
}) {
  const [otp, setOtp] = useState('');
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');

  return (
    <div className="card-base p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="font-display text-md font-medium text-foreground">{b.serviceType}</h3>
          <p className="text-xs text-foreground-tertiary capitalize">{b.mode.replace('_', ' ')} &middot; {b.durationHours ? `${b.durationHours} hr` : ''}</p>
        </div>
        <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full bg-surface-secondary text-foreground-tertiary font-medium">
          {STATUS_LABEL[b.status]}
        </span>
      </div>

      <p className="text-sm text-foreground mt-3">{b.customerAddress || '—'}</p>

      {mode === 'available' && (
        <div className="mt-4 flex justify-end">
          <Button size="sm" onClick={() => onAccept(b.id)} loading={busy}>Accept Job</Button>
        </div>
      )}

      {mode === 'mine' && b.status === 'assigned' && (
        <div className="mt-4 flex flex-col gap-2">
          <input type="text" inputMode="numeric" placeholder="Start OTP from customer" value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input-base text-sm" />
          <Button size="sm" onClick={() => onStart(b.id, otp)} loading={busy} disabled={!otp}>Start Job</Button>
        </div>
      )}

      {mode === 'mine' && b.status === 'in_progress' && (
        <div className="mt-4 flex flex-col gap-2">
          <input type="text" inputMode="numeric" placeholder="End OTP from customer" value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="input-base text-sm" />
          <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((n) => (
              <button key={n} type="button" onClick={() => setRating(n)}
                className={`text-xl transition-colors ${n <= rating ? 'text-amber-500 dark:text-amber-400' : 'text-border'}`}>★</button>
            ))}
          </div>
          <input type="text" placeholder="Optional review" value={review}
            onChange={(e) => setReview(e.target.value)}
            className="input-base text-sm" />
          <Button size="sm" onClick={() => onComplete(b.id, otp, rating, review)} loading={busy} disabled={!otp}>Complete Job</Button>
        </div>
      )}

      {mode === 'mine' && b.status === 'completed' && (
        <p className="mt-3 text-sm text-accent font-medium">✓ Completed {b.ratingByUser ? `· ★ ${b.ratingByUser}/5` : ''}</p>
      )}
    </div>
  );
}

interface WorkerProfile {
  workerType: 'home_help' | 'driver' | 'both';
  isActive: boolean;
  aadhaarVerified: boolean;
  licenseVerified: boolean;
  deactivationReason?: string | null;
  totalJobs?: number;
  averageRating?: number | string | null;
  payouts?: Payout[];
}

interface Payout {
  id: string;
  amount: number | string;
  status: 'pending' | 'processed' | 'failed' | string;
  weekStartDate: string;
  weekEndDate: string;
  processedAt: string | null;
}

function fmtCurrency(n: number | string): string {
  const v = typeof n === 'string' ? parseFloat(n) : n;
  return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(isFinite(v) ? v : 0);
}

function formatWeekLabel(start: string, end: string): string {
  const fmt = (d: string) => new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  return `${fmt(start)} — ${fmt(end)}`;
}

function EarningsSection({ profile, onRefresh }: { profile: WorkerProfile; onRefresh: () => void }) {
  const payouts = profile.payouts || [];
  const totalEarned = payouts.reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0);
  const pending = payouts.filter((p) => p.status === 'pending');
  const processed = payouts.filter((p) => p.status === 'processed');
  const pendingTotal = pending.reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0);
  const processedTotal = processed.reduce((s, p) => s + (parseFloat(String(p.amount)) || 0), 0);

  return (
    <section className="mb-8">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-display text-lg font-medium text-foreground">Earnings</h2>
        <button onClick={onRefresh} className="text-sm text-foreground-tertiary hover:text-foreground">Refresh</button>
      </div>

      <div className="grid grid-cols-3 gap-3 mb-4">
        <div className="card-base p-4">
          <p className="text-[10px] uppercase tracking-wider text-foreground-tertiary">Lifetime</p>
          <p className="font-display text-xl font-semibold text-foreground mt-1">{fmtCurrency(totalEarned)}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-[10px] uppercase tracking-wider text-foreground-tertiary">Processed</p>
          <p className="font-display text-xl font-semibold text-accent mt-1">{fmtCurrency(processedTotal)}</p>
        </div>
        <div className="card-base p-4">
          <p className="text-[10px] uppercase tracking-wider text-foreground-tertiary">Pending</p>
          <p className="font-display text-xl font-semibold text-warm mt-1">{fmtCurrency(pendingTotal)}</p>
        </div>
      </div>

      {profile.totalJobs !== undefined && (
        <p className="text-xs text-foreground-tertiary mb-4">
          {profile.totalJobs} completed job{profile.totalJobs === 1 ? '' : 's'}
          {profile.averageRating !== undefined && profile.averageRating !== null
            ? ` · ★ ${Number(profile.averageRating).toFixed(1)} avg rating`
            : ''}
        </p>
      )}

      {payouts.length === 0 ? (
        <p className="text-sm text-foreground-tertiary">No payouts yet — your weekly earnings will appear here after the admin processes them.</p>
      ) : (
        <div className="space-y-2">
          {payouts.map((p) => (
            <div key={p.id} className="card-base p-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-foreground">{formatWeekLabel(p.weekStartDate, p.weekEndDate)}</p>
                <p className="text-xs text-foreground-tertiary capitalize">{p.status}{p.processedAt ? ` · ${new Date(p.processedAt).toLocaleDateString('en-IN')}` : ''}</p>
              </div>
              <p className="font-display text-md font-semibold text-foreground tabular-nums">{fmtCurrency(p.amount)}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}

function WorkerMapPanel({ activeJob, token }: { activeJob: Booking | null; token: string }) {
  const geo = useGeolocation();
  const socketRef = useRef<Socket | null>(null);

  // The destination is the customer's booking address coordinates
  const destLoc: LatLng | null = activeJob?.customerLat != null && activeJob?.customerLng != null
    ? { lat: Number(activeJob.customerLat), lng: Number(activeJob.customerLng) }
    : null;

  const { route, distance, duration } = useRoute(geo.position, destLoc);

  // Emit worker location to backend via Socket.io when we have an active job
  useEffect(() => {
    if (!activeJob || !token || !geo.position) return;
    if (activeJob.status !== 'assigned' && activeJob.status !== 'in_progress') return;

    
    if (!socketRef.current) {
      socketRef.current = io(API_URL, {
        auth: { token },
        transports: ['websocket', 'polling'],
      });
      socketRef.current.on('connect', () => {
        socketRef.current?.emit('join_booking', activeJob.id);
      });
    }

    // Emit current position
    socketRef.current.emit('update_booking_location', {
      bookingId: activeJob.id,
      location: { lat: geo.position.lat, lng: geo.position.lng },
      ts: Date.now(),
    });

    return () => {
      // Don't disconnect on every position change, only on unmount/job change
    };
  }, [activeJob, token, geo.position]);

  // Cleanup socket on unmount or job change
  useEffect(() => {
    return () => {
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [activeJob?.id]);

  if (!activeJob || (activeJob.status !== 'assigned' && activeJob.status !== 'in_progress')) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <svg className="w-4 h-4 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        <h3 className="font-display text-md font-medium text-foreground">Navigation</h3>
        {geo.position && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
            Live
          </span>
        )}
      </div>
      <LiveMap
        userLocation={geo.position}
        otherLocation={destLoc}
        route={route}
        routeDistance={distance}
        routeDuration={duration}
        showRecenterButton
        userLabel="You"
        otherLabel="Customer"
        className="h-[250px]"
      />
      {geo.error && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
          Location: {geo.error.message}. Enable GPS to share your location with the customer.
        </p>
      )}
      {!geo.position && !geo.error && geo.loading && (
        <p className="text-xs text-foreground-tertiary mt-2">Getting your location…</p>
      )}
    </div>
  );
}

export default function WorkerPortalPage() {
  const [token, setTokenState] = useState<string | null>(null);
  const [mode, setMode] = useState<'home_help' | 'driver'>('home_help');
  const [available, setAvailable] = useState<Booking[]>([]);
  const [mine, setMine] = useState<Booking[]>([]);
  const [profile, setProfile] = useState<WorkerProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    const t = getToken();
    if (!t) { setTokenState(null); setLoading(false); return; }
    setTokenState(t); setLoading(true); setError('');
    const safeJson = async (path: string, init?: RequestInit) => {
      const res = await fetch(`${API_URL}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${t}`, ...(init?.headers || {}) },
      });
      if (!res.ok) throw new Error(`${path} -> ${res.status}`);
      return res.json();
    };
    try {
      const [av, my, me] = await Promise.all([
        safeJson(`/api/bookings/available?mode=${mode}`),
        safeJson(`/api/bookings/worker`),
        safeJson(`/api/workers/me`).catch((e) => {
          if (e instanceof Error && e.message.includes('-> 401')) {
            clearToken();
            setTokenState(null);
          }
          return { worker: null };
        }),
      ]);
      setAvailable(av.bookings || []);
      setMine(my.bookings || []);
      setProfile(me?.worker ?? null);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load');
    } finally { setLoading(false); }
  }, [mode]);

  useEffect(() => { load(); }, [load]);

  const act = async (id: string, path: string, body?: unknown) => {
    setBusy(true); setError('');
    try {
      const res = await fetch(`${API_URL}/api/bookings/${id}${path}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${getToken()}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Action failed');
      load();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Action failed');
    } finally { setBusy(false); }
  };

  const logout = () => { clearToken(); setTokenState(null); };

  if (!token) return <LoginView onOk={load} />;

  return (
    <div className="min-h-screen bg-surface-secondary">
      <header className="glass-strong sticky top-0 z-50 border-b border-border">
        <div className="container-page max-w-3xl mx-auto flex items-center justify-between h-16 px-4">
          <a href="/" className="font-display text-xl font-medium text-foreground">HomeHelp · Worker</a>
          <button onClick={logout} className="text-sm text-warm hover:text-warm/80 transition-colors">Sign out</button>
        </div>
      </header>

      <main className="container-page max-w-3xl mx-auto px-4 py-8">
        {error && <div className="px-4 py-3 rounded-xl bg-red-50/80 dark:bg-red-950/30 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm mb-4">{error}</div>}
        {profile && (() => {
          const notActive = !profile.isActive;
          const needsAadhaar = !profile.aadhaarVerified;
          const needsLicense = (profile.workerType === 'driver' || profile.workerType === 'both') && !profile.licenseVerified;
          const needsVerification = needsAadhaar || needsLicense;

          return (
            <>
              {notActive && (
                <div className="px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800 text-amber-800 dark:text-amber-400 text-sm mb-4">
                  <p className="font-medium">Your worker account is pending approval.</p>
                  {profile.deactivationReason && <p className="mt-1">Note: {profile.deactivationReason}</p>}
                </div>
              )}
              {needsVerification && token && (
                <KycDashboard workerType={profile.workerType} token={token} onVerified={load} />
              )}
            </>
          );
        })()}

        {token && (
          <WorkerMapPanel
            activeJob={mine.find(b => b.status === 'assigned' || b.status === 'in_progress') || null}
            token={token}
          />
        )}

        <section className="mb-8">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-medium text-foreground">My Jobs</h2>
            <button onClick={load} className="text-sm text-foreground-tertiary hover:text-foreground">{loading ? 'Refreshing…' : 'Refresh'}</button>
          </div>
          {loading ? (
            <div className="h-32 card-base skeleton" />
          ) : mine.length === 0 ? (
            <p className="text-sm text-foreground-tertiary">No jobs assigned to you yet.</p>
          ) : (
            <div className="space-y-3">
              {mine.map((b) => <JobCard key={b.id} b={b} mode="mine" onAccept={() => {}} onStart={(id, o) => act(id, '/start', { otp: o })} onComplete={(id, o, r, rev) => act(id, '/complete', { otp: o, rating: r, reviewText: rev })} busy={busy} />)}
            </div>
          )}
        </section>

        {profile && <EarningsSection profile={profile} onRefresh={load} />}

        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display text-lg font-medium text-foreground">Available Jobs</h2>
            <div className="flex gap-2">
              {(['home_help', 'driver'] as const).map((m) => (
                <button key={m} onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                    mode === m ? 'bg-accent text-foreground-on-accent' : 'card-base text-foreground-tertiary'
                  }`}>
                  {m === 'home_help' ? 'Home Help' : 'Driver'}
                </button>
              ))}
            </div>
          </div>
          {available.length === 0 ? (
            <p className="text-sm text-foreground-tertiary">No open {mode.replace('_', ' ')} jobs right now.</p>
          ) : (
            <div className="space-y-3">
              {available.map((b) => <JobCard key={b.id} b={b} mode="available" onAccept={(id) => act(id, '/assign')} onStart={() => {}} onComplete={() => {}} busy={busy} />)}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}