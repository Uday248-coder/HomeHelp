import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HomeHelp - Hourly Home Services & Driver Booking",
  description:
    "Book verified home help (cleaning, cooking) or a driver for your car. Instant or scheduled, hourly billing, no subscription required.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
