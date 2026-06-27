'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

function NavLink({ href, children, className = '' }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <a href={href} className={`text-sm font-medium text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors ${className}`}>
      {children}
    </a>
  );
}

function FeatureCard({ icon, title, description, features, delay }: { 
  icon: React.ReactNode; 
  title: string; 
  description: string; 
  features: string[];
  delay: number;
}) {
  return (
    <Card className="h-full animate-slide-up" style={{ animationDelay: `${delay}ms` }} padding="lg">
      <div className="w-12 h-12 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mb-5">
        {icon}
      </div>
      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">{title}</h3>
      <p className="text-gray-600 dark:text-gray-400 mb-5">{description}</p>
      <ul className="space-y-2.5">
        {features.map((feature, i) => (
          <li key={i} className="flex items-center gap-2.5 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-medium flex-shrink-0">
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function PricingCard({ 
  title, 
  price, 
  period, 
  features, 
  cta, 
  popular, 
  mode 
}: { 
  title: string; 
  price: string; 
  period: string; 
  features: string[];
  cta: string;
  popular?: boolean;
  mode: 'home' | 'driver' | 'subscription';
}) {
  const modeColors = {
    home: { bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800', icon: '🏠', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', iconColor: 'text-emerald-600 dark:text-emerald-400' },
    driver: { bg: 'bg-teal-50 dark:bg-teal-900/20', border: 'border-teal-200 dark:border-teal-800', icon: '🚗', iconBg: 'bg-teal-100 dark:bg-teal-900/30', iconColor: 'text-teal-600 dark:text-teal-400' },
    subscription: { bg: 'bg-purple-50 dark:bg-purple-900/20', border: 'border-purple-200 dark:border-purple-800', icon: '⭐', iconBg: 'bg-purple-100 dark:bg-purple-900/30', iconColor: 'text-purple-600 dark:text-purple-400' },
  };

  const colors = modeColors[mode];

  return (
    <Card 
      className={`relative h-full ${popular ? 'ring-2 ring-emerald-500 dark:ring-emerald-500 scale-[1.02] z-10' : ''}`}
      padding="lg"
    >
      {popular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge variant="success" className="text-xs px-3 py-1">Most Popular</Badge>
        </div>
      )}
      
      <div className="text-center mb-6">
        <div className={`w-14 h-14 rounded-2xl ${colors.iconBg} flex items-center justify-center mx-auto mb-4 text-2xl`}>
          {colors.icon}
        </div>
        <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
      </div>

      <div className="text-center mb-6">
        <span className="text-5xl font-bold text-gray-900 dark:text-white">{price}</span>
        <span className="text-gray-500 dark:text-gray-400 ml-1">{period}</span>
      </div>

      <ul className="space-y-3 mb-8">
        {features.map((feature, i) => (
          <li key={i} className="flex items-start gap-3 text-sm text-gray-600 dark:text-gray-400">
            <span className="w-5 h-5 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400 text-xs font-medium flex-shrink-0 mt-0.5">
              ✓
            </span>
            <span className="text-left">{feature}</span>
          </li>
        ))}
      </ul>

      <Button 
        className="w-full" 
        variant={popular ? 'primary' : 'outline'}
        size="lg"
      >
        {cta}
      </Button>
    </Card>
  );
}

function TestimonialCard({ name, role, avatar, rating, text }: { 
  name: string; 
  role: string; 
  avatar: string;
  rating: number;
  text: string;
}) {
  return (
    <Card className="h-full" padding="lg">
      <div className="flex items-center gap-1 mb-4">
        {[...Array(5)].map((_, i) => (
          <svg key={i} className={`w-5 h-5 ${i < rating ? 'text-amber-400' : 'text-gray-300 dark:text-gray-600'}`} fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
      <p className="text-gray-600 dark:text-gray-400 mb-6 leading-relaxed">"{text}"</p>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-medium text-sm">
          {name.charAt(0)}
        </div>
        <div>
          <p className="font-medium text-gray-900 dark:text-white text-sm">{name}</p>
          <p className="text-gray-500 dark:text-gray-400 text-xs">{role}</p>
        </div>
      </div>
    </Card>
  );
}

function FAQItem({ question, answer, index, openIndex, setOpenIndex }: { 
  question: string; 
  answer: string; 
  index: number;
  openIndex: number | null;
  setOpenIndex: (index: number | null) => void;
}) {
  const isOpen = openIndex === index;
  
  return (
    <div className="border-b border-gray-200 dark:border-gray-800 last:border-0">
      <button
        onClick={() => setOpenIndex(isOpen ? null : index)}
        className="w-full flex items-center justify-between py-5 text-left text-gray-900 dark:text-white font-medium hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
        aria-expanded={isOpen}
      >
        <span>{question}</span>
        <svg 
          className={`w-5 h-5 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''} text-gray-500`} 
          fill="none" 
          viewBox="0 0 24 24" 
          stroke="currentColor"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      <div 
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-5' : 'max-h-0'}`}
        aria-hidden={!isOpen}
      >
        <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{answer}</p>
      </div>
    </div>
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

  const scrollToWaitlist = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('waitlist');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const faqs = [
    { q: "What cities do you operate in?", a: "We're live in Bangalore! More cities coming soon. Join the waitlist to be notified when we launch in your city." },
    { q: "How are workers verified?", a: "All workers undergo Aadhaar verification, background checks, and in-person interviews. Home help workers also receive skill training before they're onboarded." },
    { q: "Can I cancel a booking?", a: "Yes, free cancellation up to 2 hours before the scheduled time. Late cancellations may incur a nominal fee." },
    { q: "How does Driver mode work?", a: "A verified driver comes to your location and drives your own car. You don't need to own a car — just need one available. The driver handles everything from pickup to drop-off." },
    { q: "What payment methods do you accept?", a: "We accept all major UPI apps (Google Pay, PhonePe, Paytm), credit/debit cards, and net banking. All payments are processed securely through Razorpay." },
    { q: "Is there a subscription required?", a: "No subscription required! Pay only for what you use. Our subscription plan (coming soon) offers priority booking and discounted rates for frequent users." },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-gray-950">
      {/* Navigation */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 dark:bg-gray-950/95 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <nav className="container-custom h-16 flex items-center justify-between">
          <a href="/" className="text-2xl font-bold gradient-text" aria-label="HomeHelp Home">
            HomeHelp
          </a>
          
          <div className="hidden md:flex items-center gap-8">
            <NavLink href="#services">Services</NavLink>
            <NavLink href="#pricing">Pricing</NavLink>
            <NavLink href="#testimonials">Reviews</NavLink>
            <NavLink href="#faq">FAQ</NavLink>
          </div>

          <div className="flex items-center gap-3">
            <NavLink href="/join" className="hidden sm:block btn-secondary text-sm px-4 py-2">
              Work with Us
            </NavLink>
            <a 
              href="#waitlist" 
              onClick={scrollToWaitlist}
              className="btn-primary text-sm px-5 py-2"
            >
              Get Started
            </a>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-28 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 to-transparent dark:from-emerald-900/10 dark:to-transparent" aria-hidden="true" />
        <div className="absolute top-20 right-10 w-96 h-96 bg-emerald-200/30 dark:bg-emerald-900/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-20 left-10 w-72 h-72 bg-teal-200/30 dark:bg-teal-900/10 rounded-full blur-3xl" aria-hidden="true" />
        
        <div className="container-custom relative">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 dark:bg-emerald-900/30 border border-emerald-200 dark:border-emerald-800 mb-6 animate-fade-in">
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" aria-hidden="true" />
              <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Now Live in Bangalore</span>
            </div>
            
            <h1 className="text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white leading-tight mb-6 animate-slide-up text-balance">
              Home Services & Drivers —{' '}
              <span className="gradient-text">Whenever You Need Them</span>
            </h1>
            
            <p className="text-lg lg:text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto mb-10 animate-slide-up stagger-1 text-balance">
              Book verified home help for cleaning, cooking, and chores, or hire a driver for your own car. 
              Instant or scheduled, hourly billing, no subscription required.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-slide-up stagger-2">
              <Button size="xl" onClick={scrollToWaitlist} className="w-full sm:w-auto">
                Book Your First Service
              </Button>
              <Button size="xl" variant="outline" className="w-full sm:w-auto">
                How It Works
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-sm text-gray-500 dark:text-gray-400 animate-fade-in stagger-3">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>500+ Verified Workers</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>4.9/5 Avg Rating</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>10-min Avg Arrival</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>No Subscription</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <Badge variant="outline" className="mb-4">Two Modes, One App</Badge>
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Choose How We Help
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Whether you need help at home or a driver for your car, we've got you covered with verified professionals.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              }
              title="Home Help"
              description="Background-verified domestic workers for cleaning, kitchen work, laundry, ironing, and more. Available in ~10 minutes or schedule ahead."
              features={[
                "1–4 hour sessions with 15-min billing slots",
                "Verified & trained female workers",
                "Free cancellation up to 2 hours before",
                "Real-time tracking & live updates",
              ]}
              delay={0}
            />
            <FeatureCard
              icon={
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              }
              title="Driver Mode"
              description="A verified driver for your own car. Daily commute, airport runs, outstation trips, late nights, senior errands. Your car, your rules."
              features={[
                "4-hour minimum for outstation trips",
                "Aadhaar + license verified drivers",
                "Your car only — safe & insured",
                "Late night & senior-friendly service",
              ]}
              delay={100}
            />
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Simple, Transparent Pricing
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Pay only for what you use. No hidden fees, no subscription required.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <PricingCard
              title="Home Help"
              price="₹199"
              period="/hour"
              mode="home"
              popular
              features={[
                "1–4 hour sessions",
                "15-min billing increments",
                "Verified & trained workers",
                "Free cancellation (2hr notice)",
                "Real-time tracking",
              ]}
              cta="Book Home Help"
            />
            <PricingCard
              title="Driver Mode"
              price="₹149"
              period="/hour"
              mode="driver"
              features={[
                "4hr minimum for outstation",
                "Aadhaar & license verified",
                "Your car — safe & insured",
                "Late night friendly",
                "Airport & outstation trips",
              ]}
              cta="Book Driver"
            />
            <PricingCard
              title="Subscription"
              price="₹499"
              period="/month"
              mode="subscription"
              features={[
                "Priority booking & dispatch",
                "15% discounted hourly rates",
                "Dedicated support line",
                "Flexible cancellations",
                "Coming soon — join waitlist",
              ]}
              cta="Join Waitlist"
            />
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Trusted by Thousands
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            <TestimonialCard
              name="Priya Sharma"
              role="Working Professional, Bangalore"
              avatar="PS"
              rating={5}
              text="This is exactly what our city needs. I can finally get reliable help at home without going through an agency. The workers are professional and punctual."
            />
            <TestimonialCard
              name="Rahul Mehta"
              role="Tech Lead, Bangalore"
              avatar="RM"
              rating={5}
              text="Driver mode is genius. I have a car but driving in Bangalore traffic exhausts me. Having a verified driver is the perfect solution for my daily commute."
            />
            <TestimonialCard
              name="Ananya Krishnan"
              role="Parent, Bangalore"
              avatar="AK"
              rating={5}
              text="As a working parent, I need someone I can trust at home. The verification process here gives me real peace of mind. Highly recommended!"
            />
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 lg:py-28">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              How It Works
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Get help in three simple steps — no apps to download, just book and relax.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[1, 2, 3].map((step) => (
              <Card key={step} className="relative text-center" padding="lg">
                <div className="absolute -top-6 left-1/2 -translate-x-1/2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-600 flex items-center justify-center text-white text-2xl font-bold">
                    {step}
                  </div>
                </div>
                <div className="mt-6">
                  {step === 1 && (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Choose Your Service</h3>
                      <p className="text-gray-600 dark:text-gray-400">Select Home Help or Driver mode, set your location, and pick a time slot.</p>
                    </>
                  )}
                  {step === 2 && (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Get Matched</h3>
                      <p className="text-gray-600 dark:text-gray-400">We instantly match you with a verified professional nearby. Track their arrival in real-time.</p>
                    </>
                  )}
                  {step === 3 && (
                    <>
                      <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Done & Rated</h3>
                      <p className="text-gray-600 dark:text-gray-400">Service completed. Pay securely via UPI/card. Rate your experience to help others.</p>
                    </>
                  )}
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Waitlist / CTA Section */}
      <section id="waitlist" className="py-20 lg:py-28 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-emerald-700 to-teal-700" aria-hidden="true" />
        <div className="absolute top-10 right-10 w-72 h-72 bg-white/10 rounded-full blur-3xl" aria-hidden="true" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-white/5 rounded-full blur-3xl" aria-hidden="true" />
        
        <div className="container-custom relative max-w-3xl mx-auto text-center">
          <Badge variant="outline" className="mb-4 border-white/30 text-white bg-white/10">
            Launching Soon in More Cities
          </Badge>
          <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
            Be First in Your City
          </h2>
          <p className="text-lg text-emerald-100 mb-8">
            We're expanding fast. Join the waitlist and get early access when we launch in your area.
          </p>
          
          {error && (
            <div className="mb-6 px-4 py-3 rounded-xl bg-red-500/20 border border-red-500/30 text-red-100 text-sm" role="alert">
              {error}
            </div>
          )}
          
          {submitted ? (
            <div className="px-6 py-8 rounded-2xl bg-white/10 border border-white/20 animate-fade-in">
              <svg className="w-12 h-12 text-emerald-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <h3 className="text-xl font-semibold text-white mb-2">You're on the list!</h3>
              <p className="text-emerald-100">We'll notify you when we launch in your city.</p>
            </div>
          ) : (
            <form onSubmit={handleWaitlistSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
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
                className="whitespace-nowrap"
              >
                {loading ? 'Joining...' : 'Join Waitlist'}
              </Button>
            </form>
          )}
          
          <p className="mt-4 text-sm text-emerald-200">No spam. Unsubscribe anytime.</p>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 lg:py-28 bg-gray-50 dark:bg-gray-900">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-400">
              Everything you need to know about HomeHelp.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
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
      <section className="py-20 lg:py-28 bg-gray-900 dark:bg-gray-950">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-4">
              Want to Work with Us?
            </h2>
            <p className="text-lg text-gray-400 mb-8">
              Join as a verified home help professional or driver. Flexible hours, weekly payouts, professional growth.
            </p>
            <a 
              href="/join" 
              className="btn-primary text-lg px-8 py-4 inline-block"
            >
              Apply Now →
            </a>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-950 dark:bg-gray-950 border-t border-gray-800 py-12">
        <div className="container-custom">
          <div className="grid md:grid-cols-4 gap-8 mb-10">
            <div className="md:col-span-2">
              <a href="/" className="text-2xl font-bold gradient-text">HomeHelp</a>
              <p className="mt-4 text-gray-400 max-w-sm">
                Home services & drivers — whenever you need them. Verified professionals, transparent pricing, no subscriptions.
              </p>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="#services" className="hover:text-white transition-colors">Home Help</a></li>
                <li><a href="#services" className="hover:text-white transition-colors">Driver Mode</a></li>
                <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400 text-sm">
                <li><a href="/join" className="hover:text-white transition-colors">Work with Us</a></li>
                <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-gray-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-gray-500 text-sm">
              © {new Date().getFullYear()} HomeHelp. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Twitter">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="LinkedIn">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors" aria-label="Instagram">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}