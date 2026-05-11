import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { Toaster } from "@/components/ui/sonner";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { BreakingTicker } from "@/components/breaking-ticker";
import { MobileNav } from "@/components/mobile-nav";
import { AnalyticsTracker } from "@/components/analytics-tracker";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Assam Jobs Alert – Government Jobs, Results & Education Portal",
    template: "%s | Assam Jobs Alert",
  },
  description:
    "Your trusted source for Assam Government Jobs, Results, Admit Cards, Admissions & Scholarships. Stay updated with the latest notifications from APSC, SLPRB, SEBA, and more.",
  keywords: [
    "Assam Jobs",
    "Assam Government Jobs",
    "APSC",
    "SLPRB",
    "SEBA",
    "Assam Results",
    "Assam Admit Cards",
    "Assam Admissions",
    "Assam Scholarships",
    "Government Jobs in Assam",
  ],
  authors: [{ name: "Assam Jobs Alert" }],
  openGraph: {
    title: "Assam Jobs Alert – Government Jobs & Education Portal",
    description:
      "Latest Assam Government Jobs, Results, Admit Cards, Admissions & Scholarships",
    type: "website",
    siteName: "Assam Jobs Alert",
  },
  twitter: {
    card: "summary_large_image",
    title: "Assam Jobs Alert – Government Jobs & Education Portal",
    description:
      "Latest Assam Government Jobs, Results, Admit Cards, Admissions & Scholarships",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <div className="min-h-screen flex flex-col">
            <SiteHeader />
            <BreakingTicker />
            <main className="flex-1">{children}</main>
            <SiteFooter />
            <MobileNav />
            <AnalyticsTracker />
          </div>
          <Toaster position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}
