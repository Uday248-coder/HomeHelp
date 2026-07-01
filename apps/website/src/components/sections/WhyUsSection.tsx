'use client';

export function WhyUsSection() {
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
