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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/80 nav-blur border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-16">
        <a href="/" className="font-display text-xl font-medium text-foreground tracking-tight">
          HomeHelp
        </a>

        <ul className="hidden md:flex items-center gap-8">
          <li><a href="#why-us" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Why Us</a></li>
          <li><a href="#services" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Services</a></li>
          <li><a href="#pricing" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Pricing</a></li>
          <li><a href="#faq" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">FAQ</a></li>
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

          <a href="#services" className="btn-base btn-primary text-sm px-4 py-2">Explore Services</a>

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
            <li><a href="#why-us" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Why Us</a></li>
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

function HeroSection() {
  return (
    <section className="relative overflow-hidden pt-32 pb-20 md:pt-48 md:pb-32">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-full pointer-events-none overflow-hidden">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-warm/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="container-page relative z-10 text-center">
        <div className="max-w-4xl mx-auto">
          <p className="eyebrow inline-flex items-center gap-2 mb-6 px-3 py-1 rounded-full bg-accent/10 text-accent border border-accent/20 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            Now serving across Kolkata
          </p>
          <h1 className="heading-xl text-balance mb-8 leading-tight animate-fade-in-up">
            Reclaim your time. <br />
            <span className="text-gradient">Leave the chores to us.</span>
          </h1>
          <p className="text-lg md:text-xl text-foreground-secondary leading-relaxed max-w-2xl mx-auto mb-10 text-pretty animate-fade-in-up delay-1">
            Premium, background-verified home help and on-demand drivers. 
            Professional service, hourly billing, and absolute peace of mind.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-2">
            <a href="#services" className="btn-base btn-primary text-base px-8 py-3 w-full sm:w-auto">
              Explore Services
            </a>
            <a href="#why-us" className="btn-base btn-secondary text-base px-8 py-3 w-full sm:w-auto">
              Why HomeHelp?
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Trust Bar ─── */

function TrustBar() {
  return (
    <section className="py-8 border-y border-border bg-surface-secondary/50">
      <div className="container-page">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Verified Professionals
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Aadhaar Verified
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 6.59 11 16.59z"/></svg>
            Insured Service
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Why Us (Bento Grid) ─── */

function WhyUsSection() {
  const features = [
    {
      title: 'Background Verified',
      desc: 'Every worker undergoes a multi-step verification process, including Aadhaar and police checks.',
      icon: '🛡️',
      className: 'md:col-span-2 md:row-span-1',
    },
    {
      title: '10-Min Arrival',
      desc: 'Hyper-local matching ensures a pro is at your door in minutes.',
      icon: '⚡',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Hourly Billing',
      desc: 'No monthly contracts. Pay exactly for the hours you use.',
      icon: '⏱️',
      className: 'md:col-span-1 md:row-span-2',
    },
    {
      title: 'Professional Training',
      desc: 'Trained in modern home management and professional etiquette.',
      icon: '🎓',
      className: 'md:col-span-1 md:row-span-1',
    },
    {
      title: 'Insured & Safe',
      desc: 'Comprehensive insurance coverage for every booking for your total peace of mind.',
      icon: '💎',
      className: 'md:col-span-2 md:row-span-1',
    },
  ];

  return (
    <section id="why-us" className="section-padding" aria-labelledby="why-us-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">The HomeHelp Standard</p>
          <h2 id="why-us-title" className="heading-lg text-foreground mt-2">Why choose us?</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">
            We don&rsquo;t just match you with workers; we manage the entire quality lifecycle.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 auto-rows-[200px]">
          {features.map((f, i) => (
            <div key={i} className={`bento-item ${f.className} flex flex-col justify-between p-8`}>
              <div className="text-3xl mb-4">{f.icon}</div>
              <div>
                <h3 className="heading-md mb-2">{f.title}</h3>
                <p className="text-sm text-foreground-secondary leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
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
    subtitle: 'Professional Home Management',
    description: 'Verified workers for cleaning, kitchen work, laundry, and daily chores. High-standard training for modern households.',
    features: [
      '1–4 hour sessions with 15-min billing',
      'Background-verified & trained',
      'Flexible scheduling',
      'Real-time tracking',
    ],
    color: 'accent',
    href: '/book?mode=home_help',
  },
  {
    mode: 'driver' as const,
    title: 'Driver Mode',
    subtitle: 'Your Car, Our Professional',
    description: 'A verified driver for your own car. Perfect for daily commutes, airport runs, or long city trips.',
    features: [
      'Aadhaar + license verified',
      'Safe, insured, & professional',
      'Late night & senior-friendly',
      'Outstation capabilities',
    ],
    color: 'warm',
    href: '/book?mode=driver',
  },
];

function ServiceSpotlight() {
  return (
    <section id="services" className="section-padding bg-surface-secondary" aria-labelledby="services-title">
      <div className="container-page">
        <header className="max-w-xl mb-14 text-center mx-auto">
          <p className="eyebrow">Dual Mode</p>
          <h2 id="services-title" className="heading-lg text-foreground mt-2">Expert help for every need</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">
            Choose the mode that fits your current requirement.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {services.map((s) => (
            <article key={s.mode} className="glass-card p-8 rounded-3xl flex flex-col h-full transition-all duration-300 hover:shadow-xl group">
              <div className={`w-12 h-12 rounded-2xl bg-${s.color}/10 flex items-center justify-center text-${s.color} mb-6 group-hover:scale-110 transition-transform`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  {s.mode === 'home' ? (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m0-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-16a1 1 0 011 1v10a1 1 0 01-1 1m-4-10a1 1 0 01-1 1v10a1 1 0 011 1m-4-10a1 1 0 01-1 1v10a1 1 0 011 1" />
                  )}
                </svg>
              </div>
              <p className={`text-xs font-bold uppercase tracking-wider text-${s.color} mb-2`}>{s.subtitle}</p>
              <h3 className="heading-lg mb-4">{s.title}</h3>
              <p className="text-foreground-secondary mb-8 leading-relaxed">{s.description}</p>
              
              <ul className="space-y-3 mb-10 flex-grow">
                {s.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm text-foreground">
                    <svg className="w-4 h-4 text-accent shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
              
              <a href={s.href} className={`btn-base btn-primary w-full text-center py-3`}>
                Book {s.title}
              </a>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── How It Works ─── */

function HowItWorksSection() {
  const steps = [
    { n: '01', title: 'Select', desc: 'Pick Home Help or Driver mode and choose your time.' },
    { n: '02', title: 'Match', desc: 'We instantly dispatch a verified pro nearby.' },
    { n: '03', title: 'Relax', desc: 'Pay by the hour and get your time back.' },
  ];

  return (
    <section className="section-padding" aria-labelledby="how-title">
      <div className="container-page">
        <header className="max-w-xl mb-16 text-center mx-auto">
          <p className="eyebrow">Seamless Experience</p>
          <h2 id="how-title" className="heading-lg text-foreground mt-2">How it works</h2>
        </header>

        <div className="grid md:grid-cols-3 gap-12 max-w-5xl mx-auto relative">
          {/* Connection Line (Desktop) */}
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />
          
          {steps.map((step, i) => (
            <div key={step.n} className="relative z-10 flex flex-col items-center text-center group">
              <div className="w-14 h-14 rounded-full bg-surface border-2 border-border flex items-center justify-center text-xl font-display font-bold text-foreground mb-6 group-hover:border-accent group-hover:text-accent transition-all duration-300 shadow-sm">
                {step.n}
              </div>
              <h3 className="heading-md mb-2">{step.title}</h3>
              <p className="text-sm text-foreground-secondary leading-relaxed">{step.desc}</p>
            </div>
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
      className={`relative glass-card p-8 rounded-3xl transition-all duration-300 hover:shadow-xl ${
        plan.popular ? 'ring-2 ring-accent shadow-md' : ''
      }`}
    >
      {plan.popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" size="sm">Most Popular</Badge>
        </div>
      )}

      <header className="text-center mb-6">
        <h3 className="heading-md">{plan.title}</h3>
      </header>

      <div className="text-center mb-6">
        <span className="font-display text-5xl font-medium text-foreground">{plan.price}</span>
        <span className="text-sm text-foreground-tertiary ml-1">{plan.period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {plan.features.map((feat, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-foreground">
            <svg className="w-4 h-4 text-accent mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
            <span>{feat}</span>
          </li>
        ))}
      </ul>

      <a href={plan.href} className={`btn-base btn-primary w-full text-center py-3`}>
        {plan.cta}
      </a>
    </article>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="section-padding bg-surface-secondary" aria-labelledby="pricing-title">
      <div className="container-page">
        <header className="max-w-xl mb-14 text-center mx-auto">
          <p className="eyebrow">Transparent Pricing</p>
          <h2 id="pricing-title" className="heading-lg text-foreground mt-2">Simple, hourly rates</h2>
          <p className="text-base text-foreground-secondary mt-3 leading-relaxed">
            Pay only for what you use. No hidden fees, no subscriptions.
          </p>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {plans.map((plan, i) => (
            <PricingCard key={plan.title} plan={plan} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Testimonials ─── */

const testimonials = [
  { name: 'Priya Sharma', role: 'Working Professional', rating: 5, text: 'This is exactly what our city needs. I can finally get reliable help at home without going through an agency.', initial: 'PS' },
  { name: 'Rahul Mehta', role: 'Tech Lead', rating: 5, text: 'Driver mode is genius. I have a car but driving in Kolkata traffic exhausts me. Perfect for my daily commute.', initial: 'RM' },
  { name: 'Ananya Krishnan', role: 'Working Parent', rating: 5, text: 'As a working parent, I need someone I can trust. The verification process here gives me real peace of mind.', initial: 'AK' },
];

function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-padding" aria-labelledby="testimonials-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">Voices of Trust</p>
          <h2 id="testimonials-title" className="heading-lg text-foreground mt-2">Loved by the city</h2>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <article key={t.name} className="glass-card p-8 rounded-3xl transition-all duration-300 hover:shadow-lg">
              <div className="flex items-center gap-0.5 mb-4">
                {Array.from({ length: 5 }).map((_, j) => (
                  <svg key={j} className="w-4 h-4 text-amber-500" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                ))}
              </div>
              <p className="text-sm text-foreground leading-relaxed mb-8 italic">&ldquo;{t.text}&rdquo;</p>
              <footer className="flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center text-accent text-xs font-bold shrink-0">
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

/* ─── FAQ ─── */

const faqs = [
  { q: 'What cities do you operate in?', a: "We're currently live in Kolkata! More cities coming soon. Join the waitlist to be notified when we launch in your area." },
  { q: 'How are workers verified?', a: 'Every worker undergoes a rigorous verification process: Aadhaar identity check, police verification, and a personal interview. Home help workers are also skill-tested.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel for free up to 2 hours before the scheduled time. For late cancellations, a small fee may apply.' },
  { q: 'How does Driver mode work?', a: 'A verified professional driver comes to your home and drives your own car. You maintain control of the vehicle while enjoying a stress-free ride.' },
  { q: 'What payment methods do you accept?', a: 'We support all major UPI apps, credit/debit cards, and net banking via our secure Razorpay integration.' },
  { q: 'Is there a subscription required?', a: 'No. We believe in flexibility. Pay only for the hours you use. A premium subscription for priority booking is coming soon.' },
];

function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="section-padding" aria-labelledby="faq-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">FAQ</p>
          <h2 id="faq-title" className="heading-lg text-foreground mt-2">Common questions</h2>
        </header>

        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, i) => {
              const isOpen = openIndex === i;
              return (
                <div key={i} className="glass-card rounded-2xl overflow-hidden transition-all duration-300">
                  <button
                    onClick={() => setOpenIndex(isOpen ? null : i)}
                    className="w-full flex items-center justify-between px-6 py-5 text-left text-sm font-medium text-foreground hover:text-accent transition-colors"
                    aria-expanded={isOpen}
                  >
                    <span>{faq.q}</span>
                    <svg
                      className={`w-4 h-4 shrink-0 text-foreground-tertiary transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                      fill="none" viewBox="0 0 24 24" stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  <div
                    className={`grid transition-all duration-300 ease-out ${
                      isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-6 pb-5 text-sm text-foreground-secondary leading-relaxed">
                        {faq.a}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */

function Footer() {
  return (
    <footer className="border-t border-border bg-surface-secondary">
      <div className="container-page py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <a href="/" className="font-display text-2xl font-medium text-foreground">HomeHelp</a>
            <p className="mt-4 text-sm text-foreground-secondary max-w-sm leading-relaxed">
              The modern standard for on-demand home assistance. Reclaiming your time, one hour at a time.
            </p>
          </div>
          <nav aria-label="Quick Links">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#services" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Home Help</a></li>
              <li><a href="#services" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Driver Mode</a></li>
              <li><a href="#pricing" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="/join" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Work with Us</a></li>
              <li><a href="#faq" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          <p className="text-xs text-foreground-tertiary">&copy; {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </a>
            <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
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
        <TrustBar />
        <WhyUsSection />
        <ServiceSpotlight />
        <HowItWorksSection />
        <PricingSection />
        <TestimonialsSection />
        <WaitlistSection />
        <FAQSection />
      </main>
      <Footer />
    </>
  );
}
