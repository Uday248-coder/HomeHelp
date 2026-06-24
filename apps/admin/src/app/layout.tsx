import type { Metadata } from "next";
import "./globals.css";

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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">{children}</body>
    </html>
  );
}
