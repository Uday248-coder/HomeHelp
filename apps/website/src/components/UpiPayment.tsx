'use client';

import { API_URL } from '@/lib/config';

import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { getToken } from '@/lib/auth';

type UpiInfo = {
  pa: string;
  pn: string;
  am: number;
  cu: string;
  tn: string;
  link: string;
  gpay?: string;
  phonepe?: string;
  paytm?: string;
  cred?: string;
} | null;

export function UpiPayment({ bookingId, compact = false }: { bookingId: string; compact?: boolean }) {
  const [upi, setUpi] = useState<UpiInfo>(null);
  const [status, setStatus] = useState<string>('');
  const [amount, setAmount] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [paymentId, setPaymentId] = useState<string | null>(null);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const [utrInput, setUtrInput] = useState<string>('');
  const [submittingUtr, setSubmittingUtr] = useState(false);
  const [utrMessage, setUtrMessage] = useState<string>('');

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
          setPaymentId(data.payment?.id || null);
          setCheckoutUrl(data.checkoutUrl || null);
          if (data.payment?.utr) {
            setUtrInput(data.payment.utr);
          }
        }
      } catch (e: unknown) {
        if (!cancelled) setError(e instanceof Error ? e.message : 'Failed to load payment');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [bookingId]);

  const handleOpenYoupiCheckout = () => {
    if (!checkoutUrl) return;
    window.open(checkoutUrl, '_blank', 'noopener,noreferrer');
  };

  const handleVerifyOrSubmitUtr = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const token = getToken();
    if (!token || !paymentId) return;
    try {
      setSubmittingUtr(true);
      setUtrMessage('');
      const res = await fetch(`${API_URL}/api/payments/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          paymentId,
          utr: utrInput.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok && data.payment) {
        setStatus(data.payment.status);
        if (data.payment.status === 'paid' || data.payment.status === 'captured') {
          setUtrMessage('Payment verified successfully!');
        } else {
          setUtrMessage(utrInput.trim() ? 'UTR recorded. Awaiting bank observer confirmation.' : 'Status refreshed.');
        }
      } else {
        setUtrMessage(data.error || 'Verification check in progress. Please check back shortly.');
      }
    } catch (e: any) {
      console.error('Failed to verify payment', e);
      setUtrMessage('Network error checking payment status');
    } finally {
      setSubmittingUtr(false);
    }
  };

  if (loading) {
    return <div className="h-24 bg-surface-secondary rounded-xl skeleton" />;
  }

  const isPaid = status === 'paid' || status === 'captured';

  if (isPaid) {
    return (
      <div className="mt-4 flex items-center gap-3 bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-3">
        <svg
          className="w-5 h-5 text-emerald-600 dark:text-emerald-400"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          strokeWidth="2.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Payment confirmed</p>
          <p className="text-xs text-emerald-700 dark:text-emerald-400">
            ₹{amount} direct settlement &bull; 0% transaction fees
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="mt-4 text-sm text-red-600 dark:text-red-400">{error}</p>;
  }

  return (
    <div className="mt-4 bg-surface-secondary rounded-2xl p-5 border border-border">
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-base font-semibold text-foreground">Pay ₹{amount} via YouPI Gateway</p>
          <p className="text-xs text-foreground-tertiary">Direct-to-bank settlement &bull; Zero mediator fees</p>
        </div>
        <span className="text-[10px] uppercase font-bold tracking-wider text-accent bg-accent/10 border border-accent/20 rounded-full px-2.5 py-1">
          0% Fee UPI
        </span>
      </div>

      {checkoutUrl && (
        <div className="mb-5 p-4 rounded-xl bg-accent/5 border border-accent/20">
          <p className="text-xs text-foreground-secondary mb-3">
            Open the sovereign YouPI hosted checkout portal for instant mobile app switcher &amp; real-time observation:
          </p>
          <button
            onClick={handleOpenYoupiCheckout}
            className="btn-base btn-primary w-full py-2.5 text-sm font-semibold rounded-xl flex items-center justify-center gap-2"
          >
            Launch YouPI Checkout Portal &rarr;
          </button>
        </div>
      )}

      {upi ? (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row items-center gap-5 bg-surface p-4 rounded-xl border border-border">
            <div className="bg-white p-2.5 rounded-xl border border-border shadow-sm">
              <QRCodeSVG value={upi.link} size={compact ? 130 : 150} level="M" />
            </div>
            <div className="flex-1 w-full space-y-2">
              <p className="text-xs text-foreground-tertiary leading-relaxed">
                Scan with any UPI app (GPay, PhonePe, Paytm, CRED). Amount <strong>₹{amount}</strong> and note are pre-filled.
              </p>
              
              <div className="grid grid-cols-2 gap-2 pt-1">
                {upi.gpay && (
                  <a
                    href={upi.gpay}
                    className="btn-base bg-surface-secondary hover:bg-surface-tertiary border border-border py-2 text-xs font-semibold rounded-lg text-center"
                  >
                    Google Pay
                  </a>
                )}
                {upi.phonepe && (
                  <a
                    href={upi.phonepe}
                    className="btn-base bg-surface-secondary hover:bg-surface-tertiary border border-border py-2 text-xs font-semibold rounded-lg text-center"
                  >
                    PhonePe
                  </a>
                )}
                {upi.paytm && (
                  <a
                    href={upi.paytm}
                    className="btn-base bg-surface-secondary hover:bg-surface-tertiary border border-border py-2 text-xs font-semibold rounded-lg text-center"
                  >
                    Paytm
                  </a>
                )}
                {upi.cred && (
                  <a
                    href={upi.cred}
                    className="btn-base bg-surface-secondary hover:bg-surface-tertiary border border-border py-2 text-xs font-semibold rounded-lg text-center"
                  >
                    CRED
                  </a>
                )}
              </div>

              <a
                href={upi.link}
                className="btn-base btn-primary w-full py-2.5 rounded-xl text-xs font-semibold text-center block mt-2"
              >
                Open Default UPI App
              </a>
            </div>
          </div>

          <form onSubmit={handleVerifyOrSubmitUtr} className="pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Enter 12-digit UPI UTR / Ref No. (Optional)"
                value={utrInput}
                onChange={(e) => setUtrInput(e.target.value)}
                maxLength={16}
                className="input-base text-xs flex-1 font-mono"
              />
              <button
                type="submit"
                disabled={submittingUtr}
                className="btn-base bg-surface hover:bg-surface-secondary border border-border px-4 py-2 text-xs font-medium rounded-xl whitespace-nowrap"
              >
                {submittingUtr ? 'Checking...' : 'Verify Status'}
              </button>
            </div>
            {utrMessage && (
              <p className="text-[11px] text-foreground-secondary mt-1.5 px-1">{utrMessage}</p>
            )}
          </form>
        </div>
      ) : (
        <div className="bg-surface p-4 rounded-xl border border-border text-center">
          <p className="text-sm font-medium text-foreground">Direct Bank UPI Setting Up</p>
          <p className="text-xs text-foreground-tertiary mt-1">
            Payment details are being synchronized with the gateway.
          </p>
          <button
            onClick={() => handleVerifyOrSubmitUtr()}
            disabled={submittingUtr}
            className="btn-base btn-primary mt-3 text-xs py-2 px-4 rounded-xl"
          >
            {submittingUtr ? 'Checking...' : 'Refresh Status'}
          </button>
        </div>
      )}
    </div>
  );
}
