'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

/* ─── Navigation ─── */

function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('homehelp_theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? 'bg-surface/75 nav-blur border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-16" aria-label="Main">
        <a href="/" className="font-display text-lg font-medium text-foreground tracking-tight" aria-label="HomeHelp Home">
          HomeHelp
        </a>

        <ul className="hidden md:flex items-center gap-8">
          <li><a href="#services" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors duration-150">Services</a></li>
          <li><a href="#pricing" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors duration-150">Pricing</a></li>
          <li><a href="#faq" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors duration-150">FAQ</a></li>
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="btn-base btn-ghost p-2 rounded-lg"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <a href="/book" className="btn-base btn-primary text-sm px-4 py-2">Book Now</a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn-base btn-ghost p-2 rounded-lg"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 nav-blur">
          <ul className="container-page py-4 space-y-3">
            <li><a href="#services" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Services</a></li>
            <li><a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Pricing</a></li>
            <li><a href="#faq" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">FAQ</a></li>
            <li><a href="/join" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Work with Us</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}

/* ─── Hero ─── */

function LiveStat({ value, label }: { value: string; label: string }) {
  const [display, setDisplay] = useState('0');
  useEffect(() => {
    const target = parseInt(value);
    if (isNaN(target)) { setDisplay(value); return; }
    let current = 0;
    const step = Math.max(1, Math.floor(target / 20));
    const interval = setInterval(() => {
      current = Math.min(current + step, target);
      setDisplay(String(current));
      if (current >= target) clearInterval(interval);
    }, 30);
    return () => clearInterval(interval);
  }, [value]);

  return (
    <div className="text-center">
      <div className="font-display text-3xl text-foreground font-medium leading-none mb-1 tabular-nums">{display}</div>
      <div className="text-sm text-foreground-tertiary">{label}</div>
    </div>
  );
}

function HeroSection() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-accent/5 via-transparent to-transparent pointer-events-none" aria-hidden="true" />
      <div className="pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container-page">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">
            <div className="md:col-span-3 fade-in-up">
              <p className="eyebrow mb-3">
                <span className="inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" aria-hidden="true" />
                  Kolkata — Live Now
                </span>
              </p>
              <h1 className="heading-xl text-balance mb-5">
                The hours you spend cleaning and driving?<br />
                <span className="text-gradient">Take them back.</span>
              </h1>
              <p className="text-lg text-foreground-secondary leading-relaxed max-w-lg mb-8 text-pretty">
                Verified home help and on-demand drivers in Kolkata. Book by the hour, pay only for what you use.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/book?mode=home_help" className="btn-base btn-primary text-sm px-5 py-2.5">
                  Book Home Help
                </a>
                <a href="/book?mode=driver" className="btn-base btn-secondary text-sm px-5 py-2.5">
                  Book a Driver
                </a>
              </div>
              <ul className="flex flex-wrap gap-x-5 gap-y-1.5 mt-6 text-sm text-foreground-tertiary">
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent" aria-hidden="true" />
                  500+ verified workers
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent" aria-hidden="true" />
                  4.9 avg rating
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="w-1 h-1 rounded-full bg-accent" aria-hidden="true" />
                  10-min avg arrival
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 fade-in-up delay-2">
              <aside className="card-base p-6 md:p-8 card-lift" aria-label="Live status">
                <div className="flex items-center gap-2 mb-5">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                  </span>
                  <span className="eyebrow">Live Status</span>
                </div>
                <div className="space-y-4">
                  <LiveStat value="12" label="home helpers available now" />
                  <hr className="border-border" />
                  <LiveStat value="3" label="drivers available now" />
                  <hr className="border-border" />
                  <LiveStat value="4.9" label="average rating" />
                </div>
              </aside>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Services ─── */

const services = [
  {
    mode: 'home' as const,
    title: 'Home Help',
    description: 'Background-verified workers for cleaning, kitchen work, laundry, and more. Available in ~10 minutes or schedule ahead.',
    features: [
      '1–4 hour sessions with 15-min billing slots',
      'Verified & trained workers',
      'Free cancellation up to 2 hours before',
      'Real-time tracking',
    ],
  },
  {
    mode: 'driver' as const,
    title: 'Driver Mode',
    description: 'A verified driver for your own car. Daily commute, airport runs, late nights — your car, your rules.',
    features: [
      'Aadhaar + license verified drivers',
      'Your car only — safe & insured',
      'Late night & senior-friendly service',
      '4-hour minimum for outstation trips',
    ],
  },
];

function ServiceCard({ service, index }: { service: typeof services[number]; index: number }) {
  return (
    <article className={`card-base p-6 md:p-8 card-lift fade-in-up delay-${index + 1}`}>
      <div className="flex items-center gap-3 mb-4">
        <span className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center text-accent font-semibold text-sm shrink-0">
          {service.mode === 'home' ? 'H' : 'D'}
        </span>
        <h3 className="heading-md">{service.title}</h3>
      </div>
      <p className="text-sm text-foreground-secondary leading-relaxed mb-5">{service.description}</p>
      <ul className="space-y-2.5">
        {service.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
            <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{feat}</span>
          </li>
        ))}
      </ul>
      <a
        href={service.mode === 'home' ? '/book?mode=home_help' : '/book?mode=driver'}
        className="btn-base btn-primary mt-6 w-full text-center"
      >
        {service.mode === 'home' ? 'Book Home Help' : 'Book a Driver'}
      </a>
    </article>
  );
}

function ServicesSection() {
  return (
    <section id="services" className="section-padding" aria-labelledby="services-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">Two modes</p>
          <h2 id="services-title" className="heading-lg text-foreground mt-2">Choose how we help</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">
            Whether you need help at home or a driver for your car, we&rsquo;ve got you covered with verified professionals.
          </p>
        </header>
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
          {services.map((s, i) => (
            <ServiceCard key={s.mode} service={s} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Pricing ─── */

const plans = [
  {
    title: 'Home Help',
    price: '₹199',
    period: '/hour',
    popular: true,
    href: '/book?mode=home_help',
    features: [
      '1–4 hour sessions',
      '15-min billing increments',
      'Verified & trained workers',
      'Free cancellation (2hr notice)',
      'Real-time tracking',
    ],
    cta: 'Book Home Help',
  },
  {
    title: 'Driver Mode',
    price: '₹149',
    period: '/hour',
    popular: false,
    href: '/book?mode=driver',
    features: [
      'Aadhaar & license verified',
      'Your car — safe & insured',
      'Late night friendly',
      'Airport & outstation trips',
    ],
    cta: 'Book a Driver',
  },
  {
    title: 'Subscription',
    price: '₹499',
    period: '/month',
    popular: false,
    href: '#waitlist',
    features: [
      'Priority booking & dispatch',
      '15% discounted hourly rates',
      'Dedicated support line',
      'Coming soon — join waitlist',
    ],
    cta: 'Join Waitlist',
  },
];

function PricingCard({ plan, index }: { plan: typeof plans[number]; index: number }) {
  return (
    <article
      className={`relative card-base p-6 md:p-8 card-lift fade-in-up delay-${index + 1} ${
        plan.popular ? 'ring-2 ring-accent shadow-md' : ''
      }`}
    >
      {plan.popular && (
        <p className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" size="sm">Most Popular</Badge>
        </p>
      )}

      <header className="text-center mb-6">
        <h3 className="heading-md">{plan.title}</h3>
      </header>

      <div className="text-center mb-6">
        <span className="font-display text-4xl md:text-5xl font-medium text-foreground">{plan.price}</span>
        <span className="text-sm text-foreground-tertiary ml-1">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-foreground">
            <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <a href={plan.href} className="btn-base btn-primary w-full text-center">
        {plan.cta}
      </a>
    </article>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-surface-secondary" aria-labelledby="pricing-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">Pricing</p>
          <h2 id="pricing-title" className="heading-lg text-foreground mt-2">Simple, transparent</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">
            Pay only for what you use. No hidden fees, no subscription required.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={plan.title} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */

const steps = [
  { n: '01', title: 'Choose', desc: 'Select Home Help or Driver mode, pick your time slot, and confirm your booking.' },
  { n: '02', title: 'Get matched', desc: 'We instantly match you with a verified worker nearby. Track their arrival live.' },
  { n: '03', title: 'Done & rated', desc: 'Service complete. Pay securely via UPI or card. Rate your experience to help others.' },
];

function HowItWorksSection() {
  return (
    <section className="section-padding" aria-labelledby="how-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">Three steps</p>
          <h2 id="how-title" className="heading-lg text-foreground mt-2">How it works</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">
            No apps to download. Just pick a service, confirm, and relax.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-4xl">
          {steps.map((step, i) => (
            <article key={step.n} className={`fade-in-up delay-${i + 1}`}>
              <p className="font-display text-4xl md:text-5xl font-medium text-accent mb-3">{step.n}</p>
              <h3 className="heading-md mb-2">{step.title}</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed">{step.desc}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */

const testimonials = [
  { name: 'Priya Sharma', role: 'Working Professional', rating: 5, text: 'This is exactly what our city needs. I can finally get reliable help at home without going through an agency. The workers are professional and punctual.', initial: 'PS' },
  { name: 'Rahul Mehta', role: 'Tech Lead', rating: 5, text: 'Driver mode is genius. I have a car but driving in Kolkata traffic exhausts me. Having a verified driver is the perfect solution for my daily commute.', initial: 'RM' },
  { name: 'Ananya Krishnan', role: 'Working Parent', rating: 5, text: 'As a working parent, I need someone I can trust at home. The verification process here gives me real peace of mind. Highly recommended!', initial: 'AK' },
];

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" aria-label={`${rating} out of 5 stars`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} className={`w-4 h-4 ${i < rating ? 'text-amber-500' : 'text-border'}`} fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-padding bg-surface-secondary" aria-labelledby="testimonials-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">Testimonials</p>
          <h2 id="testimonials-title" className="heading-lg text-foreground mt-2">Trusted by Kolkata</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">See what our customers have to say.</p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
          {testimonials.map((t, i) => (
            <article key={t.name} className={`card-base p-6 card-lift fade-in-up delay-${i + 1}`}>
              <StarRating rating={t.rating} />
              <p className="text-sm text-foreground leading-relaxed mt-4 mb-6">&ldquo;{t.text}&rdquo;</p>
              <footer className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-lg bg-accent/10 flex items-center justify-center text-accent text-xs font-semibold shrink-0">
                  {t.initial}
                </span>
                <div>
                  <p className="font-medium text-sm text-foreground">{t.name}</p>
                  <p className="text-xs text-foreground-tertiary">{t.role}</p>
                </div>
              </footer>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Waitlist ─── */

function WaitlistSection() {
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
    <section id="waitlist" className="section-padding" aria-labelledby="waitlist-title">
      <div className="container-page text-center max-w-lg mx-auto">
        <p className="eyebrow">Expanding soon</p>
        <h2 id="waitlist-title" className="heading-lg text-foreground mt-2">Be first in your city</h2>
        <p className="text-sm text-foreground-secondary mt-3 mb-8 leading-relaxed">
          We&rsquo;re expanding to more cities. Join the waitlist and get early access when we launch in your area.
        </p>

        {error && (
          <div className="mb-6 px-4 py-3 rounded-lg bg-warm-subtle border border-warm/20 text-sm text-warm" role="alert">
            {error}
          </div>
        )}

        {submitted ? (
          <div className="card-base p-8 animate-scale-in">
            <h3 className="heading-md mb-2">You&rsquo;re on the list!</h3>
            <p className="text-sm text-foreground-secondary">We&rsquo;ll notify you when we launch in your city.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
            <Input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              aria-label="Email address for waitlist"
            />
            <Button type="submit" loading={loading} className="shrink-0">
              {loading ? 'Joining...' : 'Join Waitlist'}
            </Button>
          </form>
        )}

        <p className="mt-4 text-xs text-foreground-tertiary">No spam. Unsubscribe anytime.</p>
      </div>
    </section>
  );
}

/* ─── FAQ ─── */

const faqs = [
  { q: 'What cities do you operate in?', a: "We're live in Kolkata! More cities coming soon. Join the waitlist to be notified when we launch in your city." },
  { q: 'How are workers verified?', a: 'All workers undergo Aadhaar verification, background checks, and in-person interviews. Home help workers also receive skill training before they\'re onboarded.' },
  { q: 'Can I cancel a booking?', a: 'Yes, free cancellation up to 2 hours before the scheduled time. Late cancellations may incur a nominal fee.' },
  { q: 'How does Driver mode work?', a: 'A verified driver comes to your location and drives your own car. The driver handles everything from pickup to drop-off — you just relax.' },
  { q: 'What payment methods do you accept?', a: 'All major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards, and net banking. Payments are processed securely through Razorpay.' },
  { q: 'Is there a subscription required?', a: 'No subscription required — pay only for what you use. Our subscription plan (coming soon) offers priority booking and discounted rates.' },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding" aria-labelledby="faq-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="heading-lg text-foreground mt-2">Frequently asked questions</h2>
        </header>

        <div className="max-w-2xl mx-auto">
          <Card variant="elevated" padding="none">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              const id = `faq-${i}`;
              return (
                <div key={i} className="border-b border-border last:border-0">
                  <h3>
                    <button
                      onClick={() => setOpenIndex(isOpen ? null : i)}
                      className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-medium text-foreground hover:text-accent transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
                      aria-expanded={isOpen}
                      aria-controls={id}
                    >
                      <span className="pr-4">{faq.q}</span>
                      <svg
                        className={`w-4 h-4 shrink-0 text-foreground-tertiary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                        fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </h3>
                  <div
                    id={id}
                    role="region"
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                    aria-hidden={!isOpen}
                  >
                    <div className="overflow-hidden">
                      <p className="px-6 pb-5 text-sm text-foreground-secondary leading-relaxed">{faq.a}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </Card>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary">
      <div className="container-page py-12">
        <div className="grid md:grid-cols-4 gap-8 mb-10">
          <div className="md:col-span-2">
            <a href="/" className="font-display text-lg font-medium text-foreground">HomeHelp</a>
            <p className="mt-3 text-sm text-foreground-secondary max-w-xs leading-relaxed">
              Home services &amp; drivers — whenever you need them. Verified professionals, transparent pricing, no subscriptions.
            </p>
          </div>
          <nav aria-label="Services">
            <h4 className="text-sm font-medium text-foreground mb-4">Services</h4>
            <ul className="space-y-2">
              <li><a href="#services" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Home Help</a></li>
              <li><a href="#services" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Driver Mode</a></li>
              <li><a href="#pricing" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h4 className="text-sm font-medium text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="/join" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Work with Us</a></li>
              <li><a href="#faq" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </nav>
        </div>

        <hr className="border-border mb-8" />

        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-foreground-tertiary">&copy; {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
          <ul className="flex items-center gap-5">
            <li>
              <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </a>
            </li>
            <li>
              <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </li>
          </ul>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page ─── */

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main>
        <HeroSection />
        <ServicesSection />
        <PricingSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <WaitlistSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
