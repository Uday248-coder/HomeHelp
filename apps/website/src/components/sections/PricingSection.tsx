'use client';

import { Badge } from '@/components/ui/Badge';

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

export function PricingSection() {
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
