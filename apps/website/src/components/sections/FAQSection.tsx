'use client';

import { useState } from 'react';

const faqs = [
  { q: 'What cities do you operate in?', a: "We're currently live in Kolkata! More cities coming soon. Join the waitlist to be notified when we launch in your area." },
  { q: 'How are workers verified?', a: 'Every worker undergoes a rigorous verification process: Aadhaar identity check, police verification, and a personal interview. Home help workers are also skill-tested.' },
  { q: 'Can I cancel a booking?', a: 'Yes, you can cancel for free up to 2 hours before the scheduled time. For late cancellations, a small fee may apply.' },
  { q: 'How does Driver mode work?', a: 'A verified professional driver comes to your home and drives your own car. You maintain control of the vehicle while enjoying a stress-free ride.' },
  { q: 'What payment methods do you accept?', a: 'We support all major UPI apps, credit/debit cards, and net banking via our secure Razorpay integration.' },
  { q: 'Is there a subscription required?', a: 'No. We believe in flexibility. Pay only for the hours you use. A premium subscription for priority booking is coming soon.' },
];

export function FAQSection() {
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
