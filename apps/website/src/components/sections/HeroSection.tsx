'use client';

export function HeroSection() {
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
