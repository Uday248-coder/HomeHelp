'use client';

export function HowItWorksSection() {
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
          <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-border -translate-y-1/2 z-0" />

          {steps.map((step) => (
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
