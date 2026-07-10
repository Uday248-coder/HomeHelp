'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

const MODES = [
  {
    id: 'home_help' as const,
    title: 'Home Help',
    desc: 'Cleaning, cooking, laundry & more',
    icon: '🏠',
    price: 199,
    color: 'from-emerald-600/20 to-emerald-600/5',
    services: ['Full Home Cleaning', 'Kitchen Cleaning', 'Cooking & Meal Prep', 'Laundry & Ironing', 'Bathroom Cleaning', 'Deep Cleaning'],
  },
  {
    id: 'driver' as const,
    title: 'Driver Mode',
    desc: 'A verified driver for your car',
    icon: '🚗',
    price: 149,
    color: 'from-blue-600/20 to-blue-600/5',
    services: ['Daily Commute', 'Airport Transfer', 'Outstation Trip', 'Late Night Ride', 'Senior Errands', 'Shopping Trip'],
  },
];

function ProgressSteps({ current, total }: { current: number; total: number }) {
  const labels = ['Choose Service', 'Details', 'Account', 'Confirm'];
  return (
    <div className="flex justify-between mb-10 max-w-xl mx-auto">
      {labels.slice(0, total).map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
              state === 'done' || state === 'active'
                ? 'bg-[#1A3C34] text-white'
                : 'bg-[#E4DFD6] text-[#8C847C]'
            }`}>
              {state === 'done' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs font-medium ${
              state === 'active' || state === 'done' ? 'text-[#1A3C34]' : 'text-[#8C847C]'
            }`}>{label}</span>
          </div>
        );
      })}
    </div>
  );
}

export default function BookPage() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'home_help' | 'driver' | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const modeParam = params.get('mode');
    if (modeParam === 'home_help' || modeParam === 'driver') setMode(modeParam);
  }, []);

  const [serviceType, setServiceType] = useState('');
  const [address, setAddress] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [authError, setAuthError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const selectedMode = MODES.find(m => m.id === mode);

  const handleAuth = async () => {
    if (!email || !password) { setAuthError('Enter your email and password'); return; }
    setAuthError(''); setLoading(true);
    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Authentication failed');
      localStorage.setItem('booking_token', data.token);
      setStep(3);
    } catch (e: unknown) {
      setAuthError(e instanceof Error ? e.message : 'Authentication failed');
    } finally { setLoading(false); }
  };

  const handleCreateBooking = async () => {
    if (!mode || !serviceType || !address) { setError('Fill all required fields'); return; }
    setError(''); setLoading(true);
    try {
      const body: Record<string, unknown> = { mode, serviceType, customerAddress: address, durationHours: duration };
      if (scheduleType === 'later' && scheduledDate && scheduledTime) {
        body.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
      }
      const token = localStorage.getItem('booking_token');
      if (!token) throw new Error('Session expired. Please sign in again.');
      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      setBookingId(data.booking.id);
      localStorage.removeItem('booking_token');
      setStep(4);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create booking');
    } finally { setLoading(false); }
  };

  const fullPrice = selectedMode ? selectedMode.price * duration : 0;

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      <header className="bg-white/90 backdrop-blur-md border-b border-[#E4DFD6] sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 h-14 flex items-center justify-between">
          <a href="/" className="font-display text-lg font-medium text-[#1A3C34]">HomeHelp</a>
          <a href="/" className="text-sm text-[#8C847C] hover:text-[#1A3C34] transition-colors">&larr; Back to home</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl border border-[#E4DFD6] p-6 sm:p-8 shadow-sm">
          <ProgressSteps current={step} total={4} />

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slide-in" role="alert">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold shrink-0">!</span>
              {error}
            </div>
          )}

          {step === 0 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-medium text-[#1C1C1C] mb-1">What do you need?</h2>
              <p className="text-[#8C847C] text-sm mb-6">Choose the service you want to book.</p>
              <div className="grid gap-3">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setServiceType(''); }}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      mode === m.id
                        ? 'border-[#1A3C34] bg-[#F6F4EF]'
                        : 'border-[#E4DFD6] hover:border-[#C4774B]/50 hover:bg-[#F6F4EF]/50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-2xl">{m.icon}</span>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="font-display text-lg font-medium text-[#1C1C1C]">{m.title}</h3>
                          <span className="text-[#1A3C34] font-semibold tabular-nums shrink-0">₹{m.price}/hr</span>
                        </div>
                        <p className="text-[#8C847C] text-sm mt-0.5">{m.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 shrink-0 ${
                        mode === m.id ? 'border-[#1A3C34] bg-[#1A3C34]' : 'border-[#E4DFD6]'
                      }`}>
                        {mode === m.id && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <Button className="w-full" size="lg" disabled={!mode} onClick={() => setStep(1)}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {step === 1 && mode && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E4DFD6]">
                <span className="text-2xl">{selectedMode?.icon}</span>
                <div>
                  <h2 className="font-display text-xl font-medium text-[#1C1C1C]">{selectedMode?.title}</h2>
                  <p className="text-sm text-[#8C847C]">₹{selectedMode?.price}/hour</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Service Type *</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  >
                    <option value="">Select a service...</option>
                    {selectedMode?.services.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Your Address *</label>
                  <textarea
                    placeholder="Enter your full address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-3 py-2.5 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">When do you need it?</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setScheduleType('now')}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                        scheduleType === 'now'
                          ? 'border-[#1A3C34] bg-[#F6F4EF] text-[#1A3C34]'
                          : 'border-[#E4DFD6] text-[#8C847C] hover:border-[#C4774B]/50'
                      }`}
                    >
                      <span className="block text-lg mb-0.5">⚡</span>
                      Right Now
                    </button>
                    <button
                      onClick={() => setScheduleType('later')}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                        scheduleType === 'later'
                          ? 'border-[#1A3C34] bg-[#F6F4EF] text-[#1A3C34]'
                          : 'border-[#E4DFD6] text-[#8C847C] hover:border-[#C4774B]/50'
                      }`}
                    >
                      <span className="block text-lg mb-0.5">📅</span>
                      Schedule Later
                    </button>
                  </div>
                </div>

                {scheduleType === 'later' && (
                  <div className="grid grid-cols-2 gap-4 animate-fade-in">
                    <div>
                      <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Duration: {duration} hour{duration > 1 ? 's' : ''}</label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={duration}
                    onChange={e => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-[#E4DFD6] rounded-full appearance-none cursor-pointer accent-[#C4774B]"
                  />
                  <div className="flex justify-between text-xs text-[#8C847C] mt-1">
                    <span>1 hr</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                  </div>
                </div>

                <div className="bg-[#F6F4EF] rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-[#1C1C1C]">Estimated Total</span>
                  <span className="text-xl font-bold text-[#1A3C34]">₹{fullPrice}</span>
                </div>
              </div>

              <div className="flex gap-3 mt-8">
                <Button variant="outline" className="flex-1" onClick={() => setStep(0)}>Back</Button>
                <Button className="flex-[2]" size="lg" disabled={!serviceType || !address} onClick={() => setStep(2)}>
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="animate-fade-in">
              <h2 className="font-display text-2xl font-medium text-[#1C1C1C] mb-1">{isLogin ? 'Sign in' : 'Create account'}</h2>
              <p className="text-[#8C847C] text-sm mb-6">{isLogin ? 'Sign in to confirm your booking.' : 'Create an account to confirm your booking.'}</p>

              {authError && (
                <div className="mb-5 px-4 py-3 rounded-xl bg-red-50/80 border border-red-200 text-red-700 text-sm flex items-center gap-2 animate-slide-in" role="alert">
                  <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold shrink-0">!</span>
                  {authError}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Email</label>
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#1C1C1C] mb-1.5">Password</label>
                  <input
                    type="password"
                    placeholder={isLogin ? 'Your password' : 'At least 6 characters'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAuth()}
                    className="w-full h-10 px-3 rounded-xl border border-[#E4DFD6] bg-white text-[#1C1C1C] placeholder:text-[#8C847C]/50 text-sm focus:outline-none focus:ring-2 focus:ring-[#C4774B] focus:border-transparent hover:border-[#8C847C]/50 transition-colors"
                  />
                </div>
                <Button className="w-full" size="lg" onClick={handleAuth} loading={loading}>
                  {isLogin ? 'Sign In' : 'Create Account'}
                </Button>
                <button
                  onClick={() => { setIsLogin(!isLogin); setAuthError(''); }}
                  className="w-full text-sm text-[#8C847C] hover:text-[#1A3C34] transition-colors"
                >
                  {isLogin ? 'Need an account? Sign up' : 'Already have an account? Sign in'}
                </button>
              </div>
            </div>
          )}

          {step === 3 && mode && (
            <div className="animate-fade-in">
              <div className="flex items-center gap-3 mb-6 pb-5 border-b border-[#E4DFD6]">
                <div className="w-10 h-10 rounded-xl bg-[#F6F4EF] flex items-center justify-center text-xl">
                  {selectedMode?.icon}
                </div>
                <div>
                  <h2 className="font-display text-xl font-medium text-[#1C1C1C]">Confirm Your Booking</h2>
                  <p className="text-sm text-[#8C847C]">Please review before confirming</p>
                </div>
              </div>

              <div className="space-y-3 mb-8">
                {[
                  { label: 'Service', value: serviceType },
                  { label: 'Mode', value: selectedMode?.title },
                  { label: 'Address', value: address },
                  { label: 'Schedule', value: scheduleType === 'now' ? 'Right now' : `${scheduledDate} at ${scheduledTime}` },
                  { label: 'Duration', value: `${duration} hour${duration > 1 ? 's' : ''}` },
                  { label: 'Rate', value: `₹${selectedMode?.price}/hr` },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm">
                    <span className="text-[#8C847C]">{row.label}</span>
                    <span className="font-medium text-[#1C1C1C] text-right max-w-[60%]">{row.value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-3 border-t border-[#E4DFD6] mt-3 pt-4">
                  <span className="font-semibold text-[#1C1C1C]">Total</span>
                  <span className="font-bold text-lg text-[#1A3C34]">₹{fullPrice}</span>
                </div>
              </div>

              <div className="flex gap-3">
                <Button variant="outline" className="flex-1" onClick={() => setStep(2)}>Back</Button>
                <Button className="flex-[2]" size="lg" onClick={handleCreateBooking} loading={loading}>
                  Confirm Booking
                </Button>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="text-center py-6 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-[#1A3C34]/10 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#1A3C34]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="font-display text-2xl font-medium text-[#1C1C1C] mb-2">Booking Confirmed!</h2>
              <p className="text-[#8C847C] text-sm mb-2">Your booking has been created successfully.</p>
              {bookingId && (
                <div className="inline-block bg-[#F6F4EF] rounded-xl px-5 py-3 mt-4 mb-6">
                  <p className="text-[10px] text-[#8C847C] uppercase tracking-wider mb-0.5 font-medium">Booking ID</p>
                  <p className="text-sm font-mono font-medium text-[#1C1C1C]">{bookingId}</p>
                </div>
              )}
              <div className="bg-[#F6F4EF] rounded-xl p-5 mb-8 text-left">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-xl">{selectedMode?.icon}</span>
                  <div>
                    <p className="font-medium text-[#1C1C1C]">{serviceType}</p>
                    <p className="text-xs text-[#8C847C]">{selectedMode?.title} &middot; {duration} hr{duration > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-sm text-[#8C847C]">{address}</p>
                <p className="text-sm text-[#8C847C] mt-0.5">
                  {scheduleType === 'now' ? 'Starting now' : `${scheduledDate} at ${scheduledTime}`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/book"><Button size="lg">Book Another</Button></a>
                <a href="/"><Button variant="outline" size="lg">Back to Home</Button></a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
