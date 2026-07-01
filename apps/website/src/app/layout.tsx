import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeHelp — Hourly Home Services & Driver Booking, Kolkata",
  description:
    "Book verified home help or a driver for your car. By the hour, no subscription needed. Live in Kolkata.",
  openGraph: {
    title: "HomeHelp — Hourly Home Services & Driver Booking",
    description: "Book verified home help or a driver for your car. By the hour, no subscription needed.",
    type: "website",
    locale: "en_IN",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var theme = localStorage.getItem('homehelp_theme');
                if (theme === 'dark' || (!theme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `}
        </Script>
      </head>
      <body className="font-body antialiased">
        {children}
      </body>
    </html>
  );
}
