'use client';

import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type { SendOtpResponse, VerifyOtpResponse, BookingResponse, ApiError } from '@/lib/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

const MODES = [
  {
    id: 'home_help' as const,
    title: 'Home Help',
    desc: 'Cleaning, cooking, laundry & more',
    icon: '🏠',
    price: 199,
    services: ['Full Home Cleaning', 'Kitchen Cleaning', 'Cooking & Meal Prep', 'Laundry & Ironing', 'Bathroom Cleaning', 'Deep Cleaning'],
  },
  {
    id: 'driver' as const,
    title: 'Driver Mode',
    desc: 'A verified driver for your car',
    icon: '🚗',
    price: 149,
    services: ['Daily Commute', 'Airport Transfer', 'Outstation Trip', 'Late Night Ride', 'Senior Errands', 'Shopping Trip'],
  },
];

function Spinner() {
  return (
    <svg className="animate-spin h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
    </svg>
  );
}

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-8">
      {Array.from({ length: total }, (_, i) => (
        <div key={i} className="flex-1 h-2 rounded-full transition-colors duration-300"
          style={{ backgroundColor: i < step ? '#059669' : i === step ? '#10b981' : '#e5e7eb' }}
        />
      ))}
      <span className="text-sm text-gray-500 ml-2 font-medium">{step + 1}/{total}</span>
    </div>
  );
}

function Steps({ current, total }: { current: number; total: number }) {
  const labels = ['Choose Service', 'Details', 'Verify', 'Confirm'];
  return (
    <div className="flex justify-between mb-10 max-w-2xl mx-auto">
      {labels.slice(0, total).map((label, i) => {
        const state = i < current ? 'done' : i === current ? 'active' : 'pending';
        return (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
              state === 'done' ? 'bg-emerald-600 text-white' :
              state === 'active' ? 'bg-emerald-600 text-white ring-4 ring-emerald-100' :
              'bg-gray-200 text-gray-500'
            }`}>
              {state === 'done' ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : i + 1}
            </div>
            <span className={`text-xs font-medium ${
              state === 'active' ? 'text-emerald-700' : state === 'done' ? 'text-emerald-600' : 'text-gray-400'
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
    if (modeParam === 'home_help' || modeParam === 'driver') {
      setMode(modeParam);
    }
  }, []);
  const [serviceType, setServiceType] = useState('');
  const [address, setAddress] = useState('');
  const [scheduleType, setScheduleType] = useState<'now' | 'later'>('now');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [duration, setDuration] = useState(2);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [token, setToken] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpHint, setOtpHint] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const selectedMode = MODES.find(m => m.id === mode);

  const handleSendOtp = async () => {
    if (!phoneNumber || phoneNumber.length < 10) { setError('Enter a valid phone number'); return; }
    setError(''); setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const res = await fetch(`${API_URL}/api/auth/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone }),
      });
      const data: SendOtpResponse & ApiError = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send OTP');
      setOtpSent(true);
      if (data.otp) setOtpHint(`Dev OTP: ${data.otp}`);
      else setOtpHint('Check server console for OTP (dev mode)');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to send OTP');
    } finally { setLoading(false); }
  };

  const handleVerifyOtp = async () => {
    if (!otp || otp.length < 4) { setError('Enter the OTP'); return; }
    setError(''); setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const res = await fetch(`${API_URL}/api/auth/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber: fullPhone, otp }),
      });
      const data: VerifyOtpResponse & ApiError = await res.json();
      if (!res.ok) throw new Error(data.error || 'Verification failed');
      setToken(data.token);
      setStep(3);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Verification failed');
    } finally { setLoading(false); }
  };

  const handleCreateBooking = async () => {
    if (!mode || !serviceType || !address) { setError('Fill all required fields'); return; }
    setError(''); setLoading(true);
    try {
      const fullPhone = phoneNumber.startsWith('+') ? phoneNumber : `+91${phoneNumber}`;
      const body: Record<string, unknown> = {
        mode,
        serviceType,
        customerAddress: address,
        durationHours: duration,
        hourlyRate: selectedMode?.price,
      };
      if (scheduleType === 'later' && scheduledDate && scheduledTime) {
        body.scheduledAt = `${scheduledDate}T${scheduledTime}:00.000Z`;
      }

      const res = await fetch(`${API_URL}/api/bookings`, {
        method: 'POST', headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data: BookingResponse & ApiError = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create booking');
      setBookingId(data.booking.id);
      setStep(4);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create booking');
    } finally { setLoading(false); }
  };

  const fullPrice = selectedMode ? selectedMode.price * duration : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <a href="/" className="text-xl font-bold text-emerald-600">HomeHelp</a>
          <a href="/" className="text-sm text-gray-500 hover:text-emerald-600 transition-colors">&larr; Back to home</a>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
          <Steps current={step} total={4} />

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center gap-2" role="alert">
              <span className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center text-xs font-bold shrink-0">!</span>
              {error}
            </div>
          )}

          {/* Step 0: Mode Selection */}
          {step === 0 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">What do you need?</h2>
              <p className="text-gray-600 mb-6">Choose the service you want to book.</p>
              <div className="grid gap-4">
                {MODES.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => { setMode(m.id); setServiceType(''); }}
                    className={`text-left p-5 rounded-xl border-2 transition-all ${
                      mode === m.id
                        ? 'border-emerald-600 bg-emerald-50 shadow-sm'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span className="text-3xl">{m.icon}</span>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-semibold text-gray-900">{m.title}</h3>
                          <span className="text-emerald-700 font-bold">₹{m.price}/hr</span>
                        </div>
                        <p className="text-gray-600 text-sm mt-0.5">{m.desc}</p>
                      </div>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                        mode === m.id ? 'border-emerald-600 bg-emerald-600' : 'border-gray-300'
                      }`}>
                        {mode === m.id && <div className="w-2 h-2 rounded-full bg-white" />}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
              <div className="mt-8">
                <Button
                  className="w-full"
                  size="lg"
                  disabled={!mode}
                  onClick={() => setStep(1)}
                >
                  Continue →
                </Button>
              </div>
            </div>
          )}

          {/* Step 1: Service Details */}
          {step === 1 && mode && (
            <div>
              <div className="flex items-center gap-3 mb-6">
                <span className="text-2xl">{selectedMode?.icon}</span>
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedMode?.title}</h2>
                  <p className="text-sm text-gray-500">₹{selectedMode?.price}/hour</p>
                </div>
              </div>

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Service Type *</label>
                  <select
                    value={serviceType}
                    onChange={e => setServiceType(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                  >
                    <option value="">Select a service...</option>
                    {selectedMode?.services.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Your Address *</label>
                  <textarea
                    placeholder="Enter your full address"
                    value={address}
                    onChange={e => setAddress(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm resize-none"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">When do you need it?</label>
                  <div className="flex gap-3">
                    <button
                      onClick={() => setScheduleType('now')}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                        scheduleType === 'now'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-lg mb-0.5">⚡</span>
                      Right Now
                    </button>
                    <button
                      onClick={() => setScheduleType('later')}
                      className={`flex-1 py-3 rounded-xl font-medium text-sm border-2 transition-all ${
                        scheduleType === 'later'
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-700'
                          : 'border-gray-200 text-gray-600 hover:border-gray-300'
                      }`}
                    >
                      <span className="block text-lg mb-0.5">📅</span>
                      Schedule Later
                    </button>
                  </div>
                </div>

                {scheduleType === 'later' && (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Date</label>
                      <input
                        type="date"
                        value={scheduledDate}
                        onChange={e => setScheduledDate(e.target.value)}
                        min={new Date().toISOString().split('T')[0]}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">Time</label>
                      <input
                        type="time"
                        value={scheduledTime}
                        onChange={e => setScheduledTime(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Duration: {duration} hour{duration > 1 ? 's' : ''}</label>
                  <input
                    type="range"
                    min={1}
                    max={8}
                    step={1}
                    value={duration}
                    onChange={e => setDuration(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-full appearance-none cursor-pointer accent-emerald-600"
                  />
                  <div className="flex justify-between text-xs text-gray-400 mt-1">
                    <span>1 hr</span>
                    <span>4 hrs</span>
                    <span>8 hrs</span>
                  </div>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-700">Estimated Total</span>
                  <span className="text-xl font-bold text-emerald-700">₹{fullPrice}</span>
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

          {/* Step 2: Phone + OTP */}
          {step === 2 && (
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify your number</h2>
              <p className="text-gray-600 mb-6">You need to verify your phone to confirm the booking.</p>

              {!otpSent ? (
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                    <div className="flex">
                      <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-gray-300 bg-gray-50 text-gray-600 text-sm font-medium">
                        +91
                      </span>
                      <input
                        type="tel"
                        placeholder="9876543210"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        className="flex-1 px-4 py-3 rounded-r-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                      />
                    </div>
                  </div>
                  <Button className="w-full" size="lg" onClick={handleSendOtp} loading={loading}>
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600">
                    <p className="font-medium text-gray-900 mb-1">OTP sent to +91 {phoneNumber}</p>
                    {otpHint && (
                      <p className="text-emerald-600 text-xs mt-1 font-mono">{otpHint}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Enter OTP</label>
                    <input
                      type="text"
                      placeholder="Enter 4-digit OTP"
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm text-center text-lg font-mono tracking-widest"
                      maxLength={6}
                    />
                  </div>
                  <div className="flex gap-3">
                    <Button variant="outline" className="flex-1" onClick={() => { setOtpSent(false); setOtp(''); }}>
                      Change Number
                    </Button>
                    <Button className="flex-[2]" size="lg" onClick={handleVerifyOtp} loading={loading} disabled={otp.length < 4}>
                      Verify & Continue
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 3: Confirmation */}
          {step === 3 && mode && (
            <div>
              <div className="flex items-center gap-3 mb-6 pb-6 border-b border-gray-100">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 flex items-center justify-center text-2xl">
                  {selectedMode?.icon}
                </div>
                <div>
                  <h2 className="text-lg font-bold text-gray-900">Confirm Your Booking</h2>
                  <p className="text-sm text-gray-500">Please review before confirming</p>
                </div>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Service</span>
                  <span className="font-medium text-gray-900">{serviceType}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Mode</span>
                  <span className="font-medium text-gray-900">{selectedMode?.title}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Address</span>
                  <span className="font-medium text-gray-900 text-right max-w-[60%]">{address}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Schedule</span>
                  <span className="font-medium text-gray-900">
                    {scheduleType === 'now' ? 'Right now' : `${scheduledDate} at ${scheduledTime}`}
                  </span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Duration</span>
                  <span className="font-medium text-gray-900">{duration} hour{duration > 1 ? 's' : ''}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-gray-600">Rate</span>
                  <span className="font-medium text-gray-900">₹{selectedMode?.price}/hr</span>
                </div>
                <div className="flex justify-between py-3 border-t border-gray-200 mt-2">
                  <span className="text-lg font-bold text-gray-900">Total</span>
                  <span className="text-lg font-bold text-emerald-700">₹{fullPrice}</span>
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

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6 animate-scale-in">
                <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
              <p className="text-gray-600 mb-2">Your booking has been created successfully.</p>
              {bookingId && (
                <div className="inline-block bg-gray-50 rounded-xl px-5 py-3 mt-4 mb-8">
                  <p className="text-xs text-gray-500 uppercase tracking-wide mb-0.5">Booking ID</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{bookingId}</p>
                </div>
              )}
              <div className="bg-emerald-50 rounded-xl p-5 mb-8 text-left">
                <div className="flex items-center gap-3 mb-3">
                  <span className="text-xl">{selectedMode?.icon}</span>
                  <div>
                    <p className="font-semibold text-gray-900">{serviceType}</p>
                    <p className="text-sm text-gray-600">{selectedMode?.title} · {duration} hr{duration > 1 ? 's' : ''}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-600">{address}</p>
                <p className="text-sm text-gray-600 mt-1">
                  {scheduleType === 'now' ? 'Starting now' : `${scheduledDate} at ${scheduledTime}`}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <a href="/book">
                  <Button size="lg" className="w-full sm:w-auto">Book Another</Button>
                </a>
                <a href="/">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">Back to Home</Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
