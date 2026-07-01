'use client';

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

export function ServiceSpotlight() {
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
                    <><path strokeLinecap="round" strokeLinejoin="round" d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" /><path strokeLinecap="round" strokeLinejoin="round" d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-16a1 1 0 011 1v10a1 1 0 01-1 1m-4-10a1 1 0 01-1 1v10a1 1 0 011 1m-4-10a1 1 0 01-1 1v10a1 1 0 011 1" /></>
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
