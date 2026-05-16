import type { Metadata } from "next";
import Link from "next/link";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import "../globals.css";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const isZh = locale === "zh";
  return {
    title: isZh ? "AI 订阅价格对比" : "AI Subscription Prices",
    description: isZh
      ? "ChatGPT、Claude、Gemini 等 AI 工具在各国订阅价格对比。网页端 & App Store，含税详情。"
      : "Compare ChatGPT, Claude, Gemini & more across countries. Web & App Store pricing with tax.",
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale;
  const msg = getMessages(locale);
  const isZh = locale === "zh";
  const nav = msg.nav as Record<string, string>;

  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <nav className="nav-bar sticky top-0 z-50">
          <div className="mx-auto max-w-[1152px] px-5 sm:px-8">
            <div className="flex h-11 items-center justify-between">
              <Link
                href={`/${locale}/`}
                className="text-[0.9375rem] font-semibold tracking-[-0.01em] text-[var(--color-text)] no-underline"
              >
                AISubPrice
              </Link>
              <div className="flex items-center gap-6">
                <Link
                  href={`/${locale}/`}
                  className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-150"
                >
                  {nav.home}
                </Link>
                <Link
                  href={`/${locale}/compare/`}
                  className="text-[0.8125rem] font-medium text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors duration-150"
                >
                  {nav.compare}
                </Link>
                <div className="w-px h-4 bg-[var(--color-border)]" />
                <Link
                  href={`/${locale === "zh" ? "en" : "zh"}/`}
                  className="text-[0.75rem] font-medium text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] transition-colors duration-150 uppercase tracking-[0.04em]"
                >
                  {isZh ? "EN" : "中文"}
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-[var(--color-border-light)] mt-20">
          <div className="mx-auto max-w-[1152px] px-5 sm:px-8 py-5">
            <p className="text-[0.6875rem] text-[var(--color-text-tertiary)] text-center tracking-[0.02em]">
              {isZh
                ? "数据仅供参考。实际价格以各平台结账页面为准。"
                : "Prices for reference only. Actual charges may vary — check provider checkout pages."}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
