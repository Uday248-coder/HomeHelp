'use client';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getToken } from '@/lib/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://homehelp-clbc.onrender.com';

type UpiInfo = { pa: string; pn: string; am: number; cu: string; tn: string; link: string } | null;

export function UpiPayment({ bookingId, compact = false }: { bookingId: string; compact?: boolean }) {
  const [upi, setUpi] = useState<UpiInfo>(null);
  const [status, setStatus] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = getToken();
    if (!token) {
      setError('Sign in to view payment');
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/payments/create-order`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ bookingId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to load payment');
        if (!cancelled) {
          setStatus(data.payment?.status || '');
          setAmount(Number(data.payment?.amount) || 0);
          setUpi(data.upi || null);
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [bookingId]);

  if (loading) {
    return <div className="h-24 bg-surface-secondary rounded-xl skeleton" />;
  }

  const isPaid = status === 'paid' || status === 'captured';

  if (isPaid) {
    return (
      <div className="mt-4 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
        <svg className="w-5 h-5 text-emerald-600 dark:text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <div>
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Payment received</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">₹{amount} &middot; confirmed by admin</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  if (!upi) {
    return (
      <div className="mt-4 bg-surface-secondary rounded-xl p-4">
        <p className="text-sm font-medium text-foreground">Amount due: ₹{amount}</p>
        <p className="text-xs text-foreground-tertiary mt-1">UPI payment is being set up. Our team will share payment details shortly.</p>
      </div>
    );
  }

  return (
    <div className="mt-4 bg-surface-secondary rounded-xl p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-sm font-medium text-foreground">Pay ₹{amount} via UPI</p>
        <span className="text-[10px] uppercase tracking-wider text-foreground-tertiary card-base rounded-full px-2 py-0.5">Scan &amp; pay</span>
      </div>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="bg-surface p-3 rounded-xl border border-border">
          <QRCodeSVG value={upi.link} size={compact ? 132 : 156} level="M" />
        </div>
        <div className="flex-1 w-full">
          <p className="text-xs text-foreground-tertiary mb-2">Scan with any UPI app (GPay, PhonePe, Paytm). The amount is pre-filled.</p>
          <a
            href={upi.link}
            className="btn-base btn-primary w-full rounded-xl text-sm font-semibold"
          >
            Pay ₹{amount} in UPI app
          </a>
          <p className="text-[11px] text-foreground-tertiary mt-2 leading-relaxed">
            After paying, an admin confirms the transfer and your booking is activated. No gateway fees — paid directly to HomeHelp.
          </p>
        </div>
      </div>
    </div>
  );
}