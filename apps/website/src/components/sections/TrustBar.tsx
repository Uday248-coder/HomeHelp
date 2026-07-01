export function TrustBar() {
  return (
    <section className="py-8 border-y border-border bg-surface-secondary/50">
      <div className="container-page">
        <div className="flex flex-wrap justify-center items-center gap-8 md:gap-16 opacity-60 grayscale">
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>
            Verified Professionals
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/></svg>
            Aadhaar Verified
          </div>
          <div className="flex items-center gap-2 text-sm font-medium text-foreground">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 15l-5-5 1.41-1.41L11 14.17l7.59-7.59L20 6.59 11 16.59z"/></svg>
            Insured Service
          </div>
        </div>
      </div>
    </section>
  );
}
