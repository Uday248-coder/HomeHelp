'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export function WaitlistSection() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setError(data.error || 'Something went wrong');
        return;
      }
      setSubmitted(true);
      setEmail('');
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="waitlist" className="section-padding bg-surface-secondary" aria-labelledby="waitlist-title">
      <div className="container-page text-center max-w-2xl mx-auto">
        <p className="eyebrow">Coming Soon</p>
        <h2 id="waitlist-title" className="heading-lg text-foreground mt-2 mb-6">Be the first in your city</h2>
        <p className="text-base text-foreground-secondary mb-10 leading-relaxed">
          We&rsquo;re expanding rapidly. Join the waitlist to get early access and a special launch discount when we hit your area.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-warm-subtle border border-warm/20 text-sm text-warm" role="alert">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="glass-card p-12 rounded-3xl animate-scale-in">
            <h3 className="heading-md mb-3">You&rsquo;re on the list!</h3>
            <p className="text-sm text-foreground-secondary">We&rsquo;ll notify you as soon as we launch in your city.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for waitlist"
            />
            <Button type="submit" loading={loading} className="shrink-0 px-6">
              {loading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </form>
        )}
        <p className="mt-6 text-xs text-foreground-tertiary">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}
