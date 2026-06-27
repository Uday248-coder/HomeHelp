'use client';

import { useState } from 'react';

function PricingCard({
  title,
  price,
  period,
  features,
  cta,
  disabled,
  delay,
}: {
  title: string;
  price: string;
  period: string;
  features: string[];
  cta: string;
  disabled?: boolean;
  delay: number;
}) {
  return (
    <div
      className={`rounded-2xl p-8 border text-center animate-fade-in-up ${disabled ? 'bg-gray-50 border-gray-200 opacity-70' : 'bg-white shadow-sm border-gray-200 hover:shadow-md hover:border-emerald-200 transition-all duration-200'}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <h4 className="text-lg font-semibold text-gray-900 mb-1">{title}</h4>
      <div className="mb-6">
        <span className="text-4xl font-bold text-gray-900">{price}</span>
        <span className="text-gray-500 text-sm ml-1">{period}</span>
      </div>
      <ul className="text-sm text-gray-600 space-y-2 mb-8 text-left">
        {features.map((f, i) => (
          <li key={i} className="flex items-start gap-2">
            <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
            <span>{f}</span>
          </li>
        ))}
      </ul>
      <button
        disabled={disabled}
        className={`w-full py-3 rounded-full font-medium text-sm transition-all duration-200 ${
          disabled
            ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
            : 'bg-emerald-600 text-white hover:bg-emerald-700 hover:shadow-md active:scale-[0.98]'
        }`}
      >
        {cta}
      </button>
    </div>
  );
}

function AccordionItem({
  question,
  answer,
  open,
  onToggle,
}: {
  question: string;
  answer: string;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between py-5 text-left text-gray-900 font-medium hover:text-emerald-600 transition-colors"
      >
        <span>{question}</span>
        <svg
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${open ? 'max-h-96 pb-5' : 'max-h-0'}`}
      >
        <p className="text-gray-600 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

export default function Home() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [waitlistError, setWaitlistError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    setWaitlistError('');
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) {
        const data = await res.json();
        setWaitlistError(data.error || 'Something went wrong');
        return;
      }
      setSubmitted(true);
      setEmail('');
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('waitlist');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b sticky top-0 bg-white/95 backdrop-blur-sm z-50">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-600">HomeHelp</h1>
          <nav className="hidden md:flex gap-6 text-sm text-gray-600">
            <a href="#modes" className="hover:text-emerald-600 transition-colors">Services</a>
            <a href="#pricing" className="hover:text-emerald-600 transition-colors">Pricing</a>
            <a href="#waitlist" className="hover:text-emerald-600 transition-colors">Join Waitlist</a>
            <a href="/join" className="hover:text-emerald-600 font-medium text-emerald-600 transition-colors">Work with us</a>
          </nav>
          <a href="/join" className="md:hidden bg-emerald-600 text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-emerald-700 transition-colors">
            Get Started
          </a>
        </div>
      </header>

      <section className="max-w-6xl mx-auto px-4 py-24 text-center">
        <div className="animate-fade-in-up">
          <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-700 px-4 py-2 rounded-full text-sm font-medium mb-6">
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse-dot"></span>
            Launching soon in Bangalore
          </div>
          <h2 className="text-5xl md:text-6xl font-bold tracking-tight text-gray-900 mb-6 text-balance">
            Home services & drivers —<br />whenever you need them
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto mb-10 text-balance">
            Book verified home help for cleaning, cooking, and chores, or hire a
            driver for your own car. Instant or scheduled, hourly billing, no
            subscription required.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button onClick={scrollToWaitlist} className="btn-primary text-base">
              Join the Waitlist
            </button>
            <a href="#modes" className="btn-secondary text-base">
              Learn More
            </a>
          </div>
        </div>
      </section>

      <section id="modes" className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">Two modes, one app</h3>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Whether you need help at home or a driver for your car, we&apos;ve got you covered.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="card animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-emerald-100 flex items-center justify-center text-2xl mb-4">
                🧹
              </div>
              <h4 className="text-xl font-semibold mb-2">Home Help</h4>
              <p className="text-gray-600 mb-4">
                Background-verified domestic workers for cleaning, kitchen work,
                laundry, ironing, and more. Instant ~10 min arrival or schedule
                ahead.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> 1–4 hour sessions
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Hourly billing
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Female verified workers
                </li>
              </ul>
            </div>
            <div className="card animate-fade-in-up" style={{ animationDelay: '100ms' }}>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl mb-4">
                🚗
              </div>
              <h4 className="text-xl font-semibold mb-2">Driver Mode</h4>
              <p className="text-gray-600 mb-4">
                A verified driver for <em>your own car</em>. Daily commute,
                airport runs, outstation trips, late nights, senior errands.
              </p>
              <ul className="text-sm text-gray-500 space-y-2">
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> 4-hour minimum for outstation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Aadhaar + license verified
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-emerald-500">✓</span> Instant or scheduled
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-4">Simple, transparent pricing</h3>
          <p className="text-gray-600 text-center mb-12 max-w-xl mx-auto">
            Pay only for what you use. No hidden fees, no subscription required.
          </p>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <PricingCard
              title="Home Help"
              price="₹199"
              period="/hr"
              features={[
                '1–4 hour sessions',
                'Hourly billing with 15-min slots',
                'Verified & trained workers',
                'Free cancellation up to 2hr before',
              ]}
              cta="Join Waitlist"
              delay={0}
            />
            <PricingCard
              title="Driver Mode"
              price="₹149"
              period="/hr"
              features={[
                '4hr minimum for outstation trips',
                'Aadhaar & license verified drivers',
                'Your car only — safe & insured',
                'Late night & senior errand friendly',
              ]}
              cta="Join Waitlist"
              delay={100}
            />
            <PricingCard
              title="Subscription"
              price="₹499"
              period="/mo"
              features={[
                'Priority bookings & dispatch',
                'Discounted hourly rates',
                'Dedicated support',
                'Coming soon — join waitlist for updates',
              ]}
              cta="Coming Soon"
              disabled
              delay={200}
            />
          </div>
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-6xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">What our early users say</h3>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Priya S.',
                role: 'Early Access User',
                text: 'This is exactly what our city needs. I can finally get reliable help at home without going through an agency.',
              },
              {
                name: 'Rahul M.',
                role: 'Early Access User',
                text: 'Driver mode is genius. I have a car but driving in traffic exhausts me. Having a verified driver is the perfect solution.',
              },
              {
                name: 'Ananya K.',
                role: 'Early Access User',
                text: 'As a working parent, I need someone I can trust at home. The verification process here gives me real peace of mind.',
              },
            ].map((testimonial, i) => (
              <div key={i} className="card animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>
                <div className="flex items-center gap-1 text-yellow-400 mb-3">
                  {"★★★★★".split('').map((s, j) => <span key={j}>{s}</span>)}
                </div>
                <p className="text-gray-600 text-sm mb-4">
                  &ldquo;{testimonial.text}&rdquo;
                </p>
                <div className="text-sm">
                  <p className="font-medium text-gray-900">{testimonial.name}</p>
                  <p className="text-gray-500">{testimonial.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="waitlist" className="py-20">
        <div className="max-w-xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold mb-4">Get early access</h3>
          <p className="text-gray-600 mb-8">
            We are launching soon. Join the waitlist and be the first to know.
          </p>
          {waitlistError && (
            <div className="bg-red-50 text-red-600 px-6 py-3 rounded-xl mb-6 text-sm">
              {waitlistError}
            </div>
          )}
          {submitted ? (
            <div className="bg-emerald-50 text-emerald-700 px-6 py-4 rounded-xl animate-fade-in-up">
              Thanks! We&apos;ll notify you when we launch.
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex gap-3">
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="input flex-1"
              />
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex items-center gap-2 whitespace-nowrap"
              >
                {loading ? (
                  <>
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                    </svg>
                    Sending...
                  </>
                ) : (
                  'Notify me'
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      <section className="bg-gray-50 py-20">
        <div className="max-w-3xl mx-auto px-4">
          <h3 className="text-3xl font-bold text-center mb-12">Frequently asked questions</h3>
          <div className="bg-white rounded-2xl px-6 shadow-sm border border-gray-100">
            <AccordionItem
              question="What cities do you operate in?"
              answer="We are launching in Bangalore soon. Join the waitlist to be notified when we launch in your city."
              open={openFaq === 0}
              onToggle={() => setOpenFaq(openFaq === 0 ? null : 0)}
            />
            <AccordionItem
              question="How are workers verified?"
              answer="All workers undergo Aadhaar verification, background checks, and in-person interviews. Home help workers also receive skill training before they are onboarded."
              open={openFaq === 1}
              onToggle={() => setOpenFaq(openFaq === 1 ? null : 1)}
            />
            <AccordionItem
              question="Can I cancel a booking?"
              answer="Yes, free cancellation up to 2 hours before the scheduled time. Late cancellations may incur a nominal fee."
              open={openFaq === 2}
              onToggle={() => setOpenFaq(openFaq === 2 ? null : 2)}
            />
            <AccordionItem
              question="How does Driver mode work?"
              answer="A verified driver comes to your location and drives your own car. You don&apos;t need to own a car — just need one available. The driver handles everything from pickup to drop-off."
              open={openFaq === 3}
              onToggle={() => setOpenFaq(openFaq === 3 ? null : 3)}
            />
            <AccordionItem
              question="What payment methods do you accept?"
              answer="We accept all major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards, and net banking. All payments are processed securely through Razorpay."
              open={openFaq === 4}
              onToggle={() => setOpenFaq(openFaq === 4 ? null : 4)}
            />
          </div>
        </div>
      </section>

      <section className="bg-emerald-600 py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">Want to work with us?</h3>
          <p className="text-emerald-100 mb-8">
            Join as a verified home help professional or driver. Flexible hours, weekly payouts.
          </p>
          <a
            href="/join"
            className="inline-block bg-white text-emerald-700 px-8 py-3 rounded-full font-medium hover:bg-emerald-50 transition-all duration-200 hover:shadow-md"
          >
            Apply Now
          </a>
        </div>
      </section>

      <footer className="border-t py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
      </footer>
    </div>
  );
}
