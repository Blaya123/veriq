import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "VERIQ - AI Business Operating System",
  description:
    "Run your business with AI. Unify your inbox, CRM, calendar, tasks, and finance into one intelligent platform.",
  keywords: [
    "AI",
    "business",
    "operating system",
    "CRM",
    "automation",
    "productivity",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`} suppressHydrationWarning>
      <body className="min-h-screen bg-white font-body text-neutral-900 antialiased dark:bg-neutral-950 dark:text-neutral-50">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
