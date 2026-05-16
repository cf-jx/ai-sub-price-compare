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
        <nav className="glass-nav sticky top-0 z-50">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
            <div className="flex h-12 items-center justify-between">
              <Link
                href={`/${locale}/`}
                className="text-[15px] font-semibold tracking-tight text-[#1d1d1f] no-underline"
              >
                AISubPrice
              </Link>
              <div className="flex items-center gap-7">
                <Link
                  href={`/${locale}/`}
                  className="text-[13px] text-[#1d1d1f]/75 hover:text-[#1d1d1f] transition-colors"
                >
                  {nav.home}
                </Link>
                <Link
                  href={`/${locale}/compare/`}
                  className="text-[13px] text-[#1d1d1f]/75 hover:text-[#1d1d1f] transition-colors"
                >
                  {nav.compare}
                </Link>
                <div className="w-px h-4 bg-black/10" />
                <Link
                  href={`/${locale === "zh" ? "en" : "zh"}/`}
                  className="text-[13px] text-[#86868b] hover:text-[#1d1d1f] transition-colors"
                >
                  {isZh ? "EN" : "中文"}
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main>{children}</main>
        <footer className="border-t border-[#d2d2d7] mt-20">
          <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-6">
            <p className="text-[11px] text-[#86868b] text-center tracking-wide">
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
