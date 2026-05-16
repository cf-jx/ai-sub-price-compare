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
    title: isZh ? "AI 订阅价格对比" : "AI Subscription Price Comparison",
    description: isZh
      ? "全球 AI 工具订阅价格对比。ChatGPT、Claude、Gemini、Perplexity 等 — 网页端和 App Store 价格，含税详情一览。"
      : "Compare AI subscription prices across countries. ChatGPT, Claude, Gemini, Perplexity & more — Web and App Store pricing with tax details.",
  };
}

function t(obj: Record<string, unknown>, path: string): string {
  const keys = path.split(".");
  let val: unknown = obj;
  for (const k of keys) {
    if (typeof val === "object" && val !== null) {
      val = (val as Record<string, unknown>)[k];
    } else {
      return path;
    }
  }
  return typeof val === "string" ? val : path;
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
      <body className="bg-white text-gray-900 antialiased">
        <nav className="border-b border-gray-200">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              <div className="flex items-center gap-8">
                <Link href={`/${locale}`} className="text-xl font-bold text-blue-600">
                  AISubPrice
                </Link>
                <div className="hidden sm:flex gap-6 text-sm font-medium text-gray-600">
                  <Link href={`/${locale}`} className="hover:text-gray-900">
                    {nav.home}
                  </Link>
                  <Link href={`/${locale}/compare`} className="hover:text-gray-900">
                    {nav.compare}
                  </Link>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Link
                  href={`/${locale === "zh" ? "en" : "zh"}`}
                  className="text-sm text-gray-500 hover:text-gray-700"
                >
                  {isZh ? "English" : "中文"}
                </Link>
              </div>
            </div>
          </div>
        </nav>
        <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">{children}</main>
        <footer className="border-t border-gray-200 mt-16">
          <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-gray-500">
            <p>
              {isZh
                ? "数据仅供参考。价格可能随时变动，实际扣款金额以各平台结账页面为准。"
                : "Prices are for reference only. Actual charges may vary — check the provider's checkout page."}
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
