import type { Metadata } from "next";
import Script from "next/script";
import { AuthProvider } from "@/lib/auth-context";
import AdminGate from "@/components/AdminGate";
import "./globals.css";
import { Inter } from "next/font/google";
import { cn } from "@/lib/utils";

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "HomeHelp Admin",
  description: "HomeHelp operations dashboard",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={cn("font-sans", inter.variable)}>
      <head>
        <Script id="dark-mode-prevent-flash" strategy="beforeInteractive">
          {`
            (function() {
              try {
                var isDark = localStorage.getItem('admin_dark_mode') === 'true';
                if (isDark) {
                  document.documentElement.classList.add('dark');
                }
              } catch(e) {}
            })();
          `}
        </Script>
      </head>
      <body className="antialiased">
        <AuthProvider>
          <AdminGate>{children}</AdminGate>
        </AuthProvider>
      </body>
    </html>
  );
}
