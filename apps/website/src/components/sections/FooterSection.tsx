'use client';

export function FooterSection() {
  return (
    <footer className="border-t border-border bg-surface-secondary">
      <div className="container-page py-16">
        <div className="grid md:grid-cols-4 gap-12 mb-16">
          <div className="md:col-span-2">
            <a href="/" className="font-display text-2xl font-medium text-foreground">HomeHelp</a>
            <p className="mt-4 text-sm text-foreground-secondary max-w-sm leading-relaxed">
              The modern standard for on-demand home assistance. Reclaiming your time, one hour at a time.
            </p>
          </div>
          <nav aria-label="Quick Links">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Services</h4>
            <ul className="space-y-3">
              <li><a href="#services" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Home Help</a></li>
              <li><a href="#services" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Driver Mode</a></li>
              <li><a href="#pricing" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Pricing</a></li>
            </ul>
          </nav>
          <nav aria-label="Company">
            <h4 className="text-sm font-bold text-foreground uppercase tracking-wider mb-6">Company</h4>
            <ul className="space-y-3">
              <li><a href="/join" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">Work with Us</a></li>
              <li><a href="#faq" className="text-sm text-foreground-tertiary hover:text-foreground transition-colors">FAQ</a></li>
            </ul>
          </nav>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pt-8 border-t border-border">
          <p className="text-xs text-foreground-tertiary">&copy; {new Date().getFullYear()} HomeHelp. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z"/></svg>
            </a>
            <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2zM4 6a2 2 0 100-4 2 2 0 000 4z"/></svg>
            </a>
            <a href="#" className="text-foreground-tertiary hover:text-foreground transition-colors" aria-label="Instagram">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
