'use client';

const testimonials = [
  { name: 'Priya Sharma', role: 'Working Professional', rating: 5, text: 'This is exactly what our city needs. I can finally get reliable help at home without going through an agency.', initial: 'PS' },
  { name: 'Rahul Mehta', role: 'Tech Lead', rating: 5, text: 'Driver mode is genius. I have a car but driving in Kolkata traffic exhausts me. Perfect for my daily commute.', initial: 'RM' },
  { name: 'Ananya Krishnan', role: 'Working Parent', rating: 5, text: 'As a working parent, I need someone I can trust. The verification process here gives me real peace of mind.', initial: 'AK' },
];

export function TestimonialsSection() {
  return (
    <section id="testimonials" className="section-padding" aria-labelledby="testimonials-title">
      <div className="container-page">
        <header className="max-w-xl mb-14">
          <p className="eyebrow">Voices of Trust</p>
          <h2 id="testimonials-title" className="heading-lg text-foreground mt-2">Loved by the city</h2>
        </header>

        <div className="grid md:grid-cols-3 gap-6 md:gap-8 max-w-6xl mx-auto">
          {testimonials.map((t) => (
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
