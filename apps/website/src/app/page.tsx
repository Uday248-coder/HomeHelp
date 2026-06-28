'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

function NavLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a
      href={href}
      className={`text-sm font-medium text-[#8C847C] hover:text-[#1C1C1C] transition-colors ${className}`}
    >
      {children}
    </a>
  );
}

function LiveStat({ value, label }: { value: string; label: string }) {
  return (
    <div className="text-center">
      <div className="font-display text-3xl text-[#1C1C1C] font-medium leading-none mb-1">{value}</div>
      <div className="text-sm text-[#8C847C]">{label}</div>
    </div>
  );
}

function FeatureCard({ title, description, features, mode }: {
  title: string;
  description: string;
  features: string[];
  mode: 'home' | 'driver';
}) {
  return (
    <Card className="h-full fade-in" padding="lg">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-[#1A3C34] flex items-center justify-center text-white text-sm font-medium shrink-0">
          {mode === 'home' ? 'H' : 'D'}
        </div>
        <h3 className="font-display text-xl font-medium text-[#1C1C1C]">{title}</h3>
      </div>
      <p className="text-[#8C847C] text-sm leading-relaxed mb-5">{description}</p>
      <ul className="space-y-2">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[#1C1C1C]">
            <span className="text-[#C4774B] mt-0.5 shrink-0">→</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
      <a
        href={mode === 'home' ? '/book?mode=home_help' : '/book?mode=driver'}
        className="btn-clay mt-6 w-full text-center"
      >
        {mode === 'home' ? 'Book Home Help' : 'Book a Driver'}
      </a>
    </Card>
  );
}

function PricingCard({
  title, price, period, features, cta, href, popular, mode: plan
}: {
  title: string; price: string; period: string; features: string[];
  cta: string; href: string; popular?: boolean; mode: 'home' | 'driver' | 'subscription';
}) {
  return (
    <Card
      className={`relative h-full fade-in ${popular ? 'ring-1 ring-[#C4774B]' : ''}`}
      padding="lg"
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" size="sm">Most Popular</Badge>
        </div>
      )}

      <div className="text-center mb-6">
        <h3 className="font-display text-xl font-medium text-[#1C1C1C]">{title}</h3>
      </div>

      <div className="text-center mb-6">
        <span className="font-display text-5xl font-medium text-[#1C1C1C]">{price}</span>
        <span className="text-[#8C847C] text-sm ml-1">{period}</span>
      </div>

      <ul className="space-y-2.5 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-2.5 text-sm text-[#1C1C1C]">
            <span className="text-[#C4774B] shrink-0">→</span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <a href={href}>
        <Button
          className="w-full"
          variant={popular ? 'primary' : 'outline'}
          size="lg"
        >
          {cta}
        </Button>
      </a>
    </Card>
  );
}

function TestimonialCard({ name, role, rating, text, initial }: {
  name: string; role: string; rating: number; text: string; initial: string;
}) {
  return (
    <Card className="h-full fade-in" padding="lg">
      <div className="flex items-center gap-0.5 mb-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg
            key={i}
            className={`w-4 h-4 ${i < rating ? 'text-[#C4774B]' : 'text-[#E4DFD6]'}`}
            fill="currentColor" viewBox="0 0 20 20"
            aria-hidden="true"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-[#1C1C1C] text-sm leading-relaxed mb-6">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#1A3C34] flex items-center justify-center text-white text-xs font-medium shrink-0">
          {initial}
        </div>
        <div>
          <p className="font-medium text-[#1C1C1C] text-sm">{name}</p>
          <p className="text-[#8C847C] text-xs">{role}</p>
        </div>
      </div>
    </Card>
  );
}

function FAQItem({ question, answer, index, openIndex, setOpenIndex }: {
  question: string; answer: string; index: number;
  openIndex: number | null; setOpenIndex: (i: number | null) => void;
}) {
  const isOpen = openIndex === index;

  return (
    <div className="border-b border-[#E4DFD6] last:border-0">
      <button
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="w-full flex items-center justify-between py-5 text-left text-[#1C1C1C] font-medium hover:text-[#C4774B] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#C4774B] focus-visible:ring-offset-2"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg
          className={`w-4 h-4 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-[#8C847C]`}
          fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
        aria-hidden={!isOpen}
      >
        <p className="text-[#8C847C] text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} className="text-sm text-[#8C847C] hover:text-[#F0EBE4] transition-colors">
      {children}
    </a>
  );
}

export default function HomePage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
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

  const faqs = [
    { q: 'What cities do you operate in?', a: "We're live in Kolkata! More cities coming soon. Join the waitlist to be notified when we launch in your city." },
    { q: 'How are workers verified?', a: 'All workers undergo Aadhaar verification, background checks, and in-person interviews. Home help workers also receive skill training before they\'re onboarded.' },
    { q: 'Can I cancel a booking?', a: 'Yes, free cancellation up to 2 hours before the scheduled time. Late cancellations may incur a nominal fee.' },
    { q: 'How does Driver mode work?', a: 'A verified driver comes to your location and drives your own car. The driver handles everything from pickup to drop-off — you just relax.' },
    { q: 'What payment methods do you accept?', a: 'All major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards, and net banking. Payments are processed securely through Razorpay.' },
    { q: 'Is there a subscription required?', a: 'No subscription required — pay only for what you use. Our subscription plan (coming soon) offers priority booking and discounted rates.' },
  ];

  return (
    <div className="min-h-screen bg-[#F6F4EF]">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-[#F6F4EF]/90 border-b border-[#E4DFD6]">
        <nav className="container-page h-14 md:h-16 flex items-center justify-between">
          <a href="/" className="font-display text-lg font-medium text-[#1A3C34]" aria-label="HomeHelp Home">
            HomeHelp
          </a>

          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#services">Services</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <NavLink href="/join" className="hidden sm:block">
              Work with Us
            </NavLink>
            <a href="/book" className="btn-clay text-sm px-5 py-2 h-auto">
              Book Now
            </a>
          </div>
        </nav>
      </header>

      {/* Hero */}
      <section className="bg-[#1A3C34] pt-28 pb-16 md:pt-36 md:pb-20">
        <div className="container-page">
          <div className="grid md:grid-cols-5 gap-10 md:gap-16 items-center">
            {/* Left: Text */}
            <div className="md:col-span-3 fade-in">
              <span className="eyebrow text-[#8C847C]">Kolkata — Live Now</span>
              <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-medium text-[#F0EBE4] leading-tight mt-4 mb-5">
                The hours you spend cleaning and driving?<br />
                <span className="text-[#C4774B]">Take them back.</span>
              </h1>
              <p className="text-[#8C847C] text-base md:text-lg leading-relaxed max-w-lg mb-8">
                Verified home help and on-demand drivers in Kolkata. Book by the hour, pay only for what you use.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a href="/book?mode=home_help" className="btn-clay text-sm">
                  Book Home Help
                </a>
                <a href="/book?mode=driver" className="btn-outline-dark text-sm">
                  Book a Driver
                </a>
              </div>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 mt-6 text-sm text-[#8C847C]">
                <span>500+ verified workers</span>
                <span>4.9 avg rating</span>
                <span>10-min avg arrival</span>
              </div>
            </div>

            {/* Right: Live Status Card */}
            <div className="md:col-span-2 fade-in delay-2">
              <div className="bg-[#F6F4EF] rounded-2xl p-6 md:p-8">
                <div className="flex items-center gap-2 mb-5">
                  <span className="w-2 h-2 rounded-full bg-[#C4774B]" aria-hidden="true" />
                  <span className="text-xs font-medium text-[#8C847C] uppercase tracking-widest">Live</span>
                </div>
                <div className="space-y-4">
                  <LiveStat value="12" label="workers available now" />
                  <div className="border-t border-[#E4DFD6]" />
                  <LiveStat value="3" label="drivers nearby" />
                  <div className="border-t border-[#E4DFD6]" />
                  <LiveStat value="4.9" label="★ average rating" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="section-padding bg-[#F6F4EF]">
        <div className="container-page">
          <div className="max-w-xl mb-14">
            <span className="eyebrow">Two modes</span>
            <h2 className="heading-section text-[#1A3C34] mt-2">Choose how we help</h2>
            <p className="text-[#8C847C] mt-3 text-base leading-relaxed">
              Whether you need help at home or a driver for your car, we've got you covered with verified professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-4xl">
            <FeatureCard
              mode="home"
              title="Home Help"
              description="Background-verified workers for cleaning, kitchen work, laundry, ironing, and more. Available in ~10 minutes or schedule ahead."
              features={[
                '1–4 hour sessions with 15-min billing slots',
                'Verified & trained workers',
                'Free cancellation up to 2 hours before',
                'Real-time tracking',
              ]}
            />
            <FeatureCard
              mode="driver"
              title="Driver Mode"
              description="A verified driver for your own car. Daily commute, airport runs, late nights, senior errands — your car, your rules."
              features={[
                'Aadhaar + license verified drivers',
                'Your car only — safe & insured',
                'Late night & senior-friendly service',
                '4-hour minimum for outstation trips',
              ]}
            />
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="section-padding bg-[#F6F4EF]">
        <div className="container-page">
          <div className="max-w-xl mb-14">
            <span className="eyebrow">Pricing</span>
            <h2 className="heading-section text-[#1A3C34] mt-2">Simple, transparent</h2>
            <p className="text-[#8C847C] mt-3 text-base leading-relaxed">
              Pay only for what you use. No hidden fees, no subscription required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <PricingCard
              title="Home Help"
              price="₹199"
              period="/hour"
              mode="home"
              popular
              href="/book?mode=home_help"
              features={[
                '1–4 hour sessions',
                '15-min billing increments',
                'Verified & trained workers',
                'Free cancellation (2hr notice)',
                'Real-time tracking',
              ]}
              cta="Book Home Help"
            />
            <PricingCard
              title="Driver Mode"
              price="₹149"
              period="/hour"
              mode="driver"
              href="/book?mode=driver"
              features={[
                'Aadhaar & license verified',
                'Your car — safe & insured',
                'Late night friendly',
                'Airport & outstation trips',
              ]}
              cta="Book a Driver"
            />
            <PricingCard
              title="Subscription"
              price="₹499"
              period="/month"
              mode="subscription"
              href="#waitlist"
              features={[
                'Priority booking & dispatch',
                '15% discounted hourly rates',
                'Dedicated support line',
                'Coming soon — join waitlist',
              ]}
              cta="Join Waitlist"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="section-padding bg-[#1A3C34]">
        <div className="container-page">
          <div className="max-w-xl mb-14">
            <span className="eyebrow text-[#8C847C]">Three steps</span>
            <h2 className="heading-section text-[#F0EBE4] mt-2">How it works</h2>
            <p className="text-[#8C847C] mt-3 text-base leading-relaxed">
              No apps to download. Just pick a service, confirm, and relax.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12 max-w-4xl">
            {[
              { n: '01', title: 'Choose', desc: 'Select Home Help or Driver mode, pick your time slot, and confirm your booking.' },
              { n: '02', title: 'Get matched', desc: 'We instantly match you with a verified worker or driver nearby. Track their arrival live.' },
              { n: '03', title: 'Done & rated', desc: 'Service complete. Pay securely via UPI or card. Rate your experience to help others.' },
            ].map((step, i) => (
              <div key={i} className="fade-in" style={{ animationDelay: `${i * 0.15}s` }}>
                <div className="font-display text-4xl md:text-5xl font-medium text-[#C4774B] mb-3">{step.n}</div>
                <h3 className="font-display text-xl font-medium text-[#F0EBE4] mb-2">{step.title}</h3>
                <p className="text-[#8C847C] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="section-padding bg-[#F6F4EF]">
        <div className="container-page">
          <div className="max-w-xl mb-14">
            <span className="eyebrow">Testimonials</span>
            <h2 className="heading-section text-[#1A3C34] mt-2">Trusted by Kolkata</h2>
            <p className="text-[#8C847C] mt-3 text-base leading-relaxed">
              See what our customers have to say.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto">
            <TestimonialCard
              name="Priya Sharma"
              role="Working Professional"
              rating={5}
              text="This is exactly what our city needs. I can finally get reliable help at home without going through an agency. The workers are professional and punctual."
              initial="PS"
            />
            <TestimonialCard
              name="Rahul Mehta"
              role="Tech Lead"
              rating={5}
              text="Driver mode is genius. I have a car but driving in Kolkata traffic exhausts me. Having a verified driver is the perfect solution for my daily commute."
              initial="RM"
            />
            <TestimonialCard
              name="Ananya Krishnan"
              role="Working Parent"
              rating={5}
              text="As a working parent, I need someone I can trust at home. The verification process here gives me real peace of mind. Highly recommended!"
              initial="AK"
            />
          </div>
        </div>
      </section>

      {/* Waitlist CTA */}
      <section id="waitlist" className="section-padding bg-[#C4774B]">
        <div className="container-page text-center max-w-lg mx-auto">
          <span className="eyebrow text-[#F0EBE4]">Expanding soon</span>
          <h2 className="heading-section text-white mt-2">Be first in your city</h2>
          <p className="text-[#F0EBE4] text-sm mt-3 mb-8 leading-relaxed opacity-90">
            We're expanding to more cities. Join the waitlist and get early access when we launch in your area.
          </p>

          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-white/20 text-white text-sm" role="alert">
              {error}
            </div>
          )}

          {submitted ? (
            <div className="px-6 py-8 rounded-2xl bg-white/10 fade-in">
              <h3 className="text-xl font-display font-medium text-white mb-2">You're on the list!</h3>
              <p className="text-[#F0EBE4] text-sm opacity-90">We'll notify you when we launch in your city.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-sm mx-auto">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="flex-1"
                aria-label="Email address for waitlist"
              />
              <Button
                type="submit"
                size="lg"
                loading={loading}
                variant="secondary"
                className="whitespace-nowrap"
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>
          )}

          <p className="mt-4 text-xs text-[#F0EBE4] opacity-70">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="section-padding bg-[#F6F4EF]">
        <div className="container-page">
          <div className="max-w-xl mb-14">
            <span className="eyebrow">FAQ</span>
            <h2 className="heading-section text-[#1A3C34] mt-2">Frequently asked questions</h2>
          </div>

          <div className="max-w-2xl mx-auto">
            <Card variant="outlined" padding="none">
              {faqs.map((faq, i) => (
                <FAQItem
                  key={i}
                  question={faq.q}
                  answer={faq.a}
                  index={i}
                  openIndex={openFaq}
                  setOpenIndex={setOpenFaq}
                />
              ))}
            </Card>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="section-padding bg-[#1A3C34] text-center">
        <div className="container-page">
          <h2 className="font-display text-3xl md:text-4xl font-medium text-[#F0EBE4] mb-3">
            Want to work with us?
          </h2>
          <p className="text-[#8C847C] text-sm mb-8 max-w-md mx-auto">
            Join as a verified home help professional or driver. Flexible hours, weekly payouts, professional growth.
          </p>
          <a href="/join" className="btn-clay">
            Apply Now →
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1A3C34] border-t border-[#2A5C50] py-12">
        <div className="container-page">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <a href="/" className="font-display text-lg font-medium text-[#F0EBE4]">HomeHelp</a>
              <p className="mt-3 text-sm text-[#8C847C] max-w-xs">
                Home services & drivers — whenever you need them. Verified professionals, transparent pricing, no subscriptions.
              </p>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#F0EBE4] mb-4">Services</h4>
              <ul className="space-y-2">
                <li><FooterLink href="#services">Home Help</FooterLink></li>
                <li><FooterLink href="#services">Driver Mode</FooterLink></li>
                <li><FooterLink href="#pricing">Pricing</FooterLink></li>
              </ul>
            </div>
            <div>
              <h4 className="text-sm font-medium text-[#F0EBE4] mb-4">Company</h4>
              <ul className="space-y-2">
                <li><FooterLink href="/join">Work with Us</FooterLink></li>
                <li><FooterLink href="#faq">FAQ</FooterLink></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[#2A5C50] flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-sm text-[#8C847C]">© {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <a href="#" className="text-[#8C847C] hover:text-[#F0EBE4] transition-colors" aria-label="Twitter">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-[#8C847C] hover:text-[#F0EBE4] transition-colors" aria-label="LinkedIn">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </a>
              <a href="#" className="text-[#8C847C] hover:text-[#F0EBE4] transition-colors" aria-label="Instagram">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
