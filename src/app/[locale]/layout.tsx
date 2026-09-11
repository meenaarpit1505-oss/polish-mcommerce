import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { brand } from "@/config/theme";
import { CurrencyProvider } from "@/providers/CurrencyProvider";
import { ThemeProvider } from "@/providers/ThemeProvider";
import { CartProvider } from "@/providers/CartProvider";
import { Header } from "@/components/layout/Header";
import { LegalStrip } from "@/components/layout/LegalStrip";
import "../globals.css";

const MYLEAD_VERIFICATION_TOKENS = [
  "e056bba49dc780db1425a0a91a0ccebc",
] as const;

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const tagline =
    brand.tagline[locale as Locale] ?? brand.tagline.pl;

  return {
    title: `${brand.name} — ${tagline}`,
    description: tagline,
    other: {
      "mylead-verification": [...MYLEAD_VERIFICATION_TOKENS],
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: LayoutProps<"/[locale]">) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <head>
        {MYLEAD_VERIFICATION_TOKENS.map((token) => (
          <meta key={token} name="mylead-verification" content={token} />
        ))}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{if(localStorage.theme==='dark'||(!('theme' in localStorage)&&window.matchMedia('(prefers-color-scheme: dark)').matches)){document.documentElement.classList.add('dark')}else{document.documentElement.classList.remove('dark')}}catch(e){}`,
          }}
        />
      </head>
      <body className="flex min-h-full flex-col bg-background text-foreground transition-colors duration-300">
        <div
          hidden
          dangerouslySetInnerHTML={{
            __html: MYLEAD_VERIFICATION_TOKENS.map(
              (token) => `<!-- mylead-verification:${token} -->${token}`,
            ).join(""),
          }}
        />
        <NextIntlClientProvider messages={messages}>
          <ThemeProvider>
            <CurrencyProvider>
              <CartProvider>
                <Suspense
                  fallback={
                    <header className="sticky top-0 z-50 h-14 border-b border-slate-200/80 dark:border-slate-800/80 bg-surface/95" />
                  }
                >
                  <Header />
                </Suspense>
                <main className="flex-1">{children}</main>
                <LegalStrip />
              </CartProvider>
            </CurrencyProvider>
          </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
