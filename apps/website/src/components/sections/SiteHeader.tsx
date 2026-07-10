'use client';

import { useState, useEffect } from 'react';

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains('dark'));
    const onScroll = () => setScrolled(window.scrollY > 16);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const toggleDark = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle('dark', next);
    try { localStorage.setItem('homehelp_theme', next ? 'dark' : 'light'); } catch {}
  };

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? 'bg-surface/80 nav-blur border-b border-border'
          : 'bg-transparent'
      }`}
    >
      <nav className="container-page flex items-center justify-between h-16">
        <a href="/" className="font-display text-xl font-medium text-foreground tracking-tight">
          HomeHelp
        </a>

        <ul className="hidden md:flex items-center gap-8">
          <li><a href="#why-us" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Why Us</a></li>
          <li><a href="#services" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Services</a></li>
          <li><a href="#pricing" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Pricing</a></li>
          <li><a href="#faq" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">FAQ</a></li>
          <li><a href="/my-bookings" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">My Bookings</a></li>
          <li><a href="/worker" className="text-sm font-medium text-foreground-secondary hover:text-foreground transition-colors">Worker</a></li>
        </ul>

        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="btn-base btn-ghost p-2 rounded-lg"
            aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {dark ? (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.773-4.227l-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
              </svg>
            )}
          </button>

          <a href="#services" className="btn-base btn-primary text-sm px-4 py-2">Explore Services</a>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden btn-base btn-ghost p-2 rounded-lg"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} aria-hidden="true">
              {mobileOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {mobileOpen && (
        <div className="md:hidden border-t border-border bg-surface/95 nav-blur">
          <ul className="container-page py-4 space-y-3">
            <li><a href="#why-us" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Why Us</a></li>
            <li><a href="#services" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Services</a></li>
            <li><a href="#pricing" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Pricing</a></li>
            <li><a href="#faq" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">FAQ</a></li>
            <li><a href="/my-bookings" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">My Bookings</a></li>
            <li><a href="/worker" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Worker Portal</a></li>
            <li><a href="/join" onClick={() => setMobileOpen(false)} className="block text-sm font-medium text-foreground-secondary hover:text-foreground">Work with Us</a></li>
          </ul>
        </div>
      )}
    </header>
  );
}
