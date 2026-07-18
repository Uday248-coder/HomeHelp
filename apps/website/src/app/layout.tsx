import type { Metadata, Viewport } from "next";
import Script from "next/script";
import "./globals.css";
import { Inter, Newsreader } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-body",
  weight: ["400", "500", "600", "700"],
});

const newsreader = Newsreader({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-display",
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://homehelp-website.vercel.app"),
  title: {
    default: "HomeHelp — Hourly Home Services & Driver Booking, Kolkata",
    template: "%s · HomeHelp",
  },
  description:
    "Book verified home help or a driver for your car. By the hour, no subscription needed. Live in Kolkata.",
  keywords: [
    "home help",
    "cleaning service Kolkata",
    "driver booking",
    "hourly cleaning",
    "verified home workers",
  ],
  authors: [{ name: "HomeHelp" }],
  openGraph: {
    title: "HomeHelp — Hourly Home Services & Driver Booking",
    description: "Book verified home help or a driver for your car. By the hour, no subscription needed.",
    type: "website",
    locale: "en_IN",
    siteName: "HomeHelp",
  },
  twitter: {
    card: "summary_large_image",
    title: "HomeHelp — Hourly Home Services & Driver Booking",
    description: "Book verified home help or a driver for your car. By the hour, no subscription needed.",
  },
  robots: { index: true, follow: true },
  icons: { icon: "/favicon.ico" },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0c1413" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={cn(inter.variable, newsreader.variable)}>
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
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:z-[100] focus:top-4 focus:left-4 focus:rounded-pill focus:bg-surface focus:text-foreground focus:px-5 focus:py-3 focus:shadow-lg focus:border focus:border-border"
        >
          Skip to content
        </a>
        {children}
      </body>
    </html>
  );
}
