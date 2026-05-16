import { getProducts } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PRODUCT_ICONS: Record<string, string> = {
  chatgpt: "◇", claude: "✦", gemini: "◆", perplexity: "◈", cursor: "▷", midjourney: "◎",
};

const HIGHLIGHTS = [
  { country: "🇹🇷 Turkey", product: "ChatGPT App Store", save: "70%", slug: "chatgpt", size: "lg" },
  { country: "🇦🇷 Argentina", product: "ChatGPT App Store", save: "70%", slug: "chatgpt", size: "sm" },
  { country: "🇳🇬 Nigeria", product: "Claude Pro Web", save: "52%", slug: "claude", size: "sm" },
  { country: "🇹🇷 Turkey", product: "Gemini AI Pro", save: "44%", slug: "gemini", size: "sm" },
];

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale;
  const msg = getMessages(locale);
  const home = msg.home as Record<string, string>;
  const common = msg.common as Record<string, string>;
  const products = getProducts();

  return (
    <div>
      {/* Hero */}
      <section className="hero-gradient text-center py-24 sm:py-32">
        <h1 className="text-[44px] sm:text-[64px] font-semibold tracking-[-0.02em] leading-[1.05]">
          {home.hero_title}
        </h1>
        <p className="mt-5 text-[19px] sm:text-[21px] leading-[1.4] text-[var(--color-apple-text-secondary)] max-w-[560px] mx-auto tracking-normal">
          {home.hero_subtitle}
        </p>
      </section>

      {/* Products */}
      <section className="mx-auto max-w-[1200px] px-5 sm:px-8 -mt-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/${locale}/product/${product.slug}/`}
              className="apple-card p-5 group"
            >
              <div className="w-9 h-9 rounded-[12px] bg-[var(--color-apple-bg)] flex items-center justify-center text-[18px] text-[var(--color-apple-text)]/40 mb-4 group-hover:scale-110 motion-safe:transition-transform motion-safe:duration-300">
                {PRODUCT_ICONS[product.slug] || product.name[0]}
              </div>
              <h3 className="text-[15px] font-semibold mb-1">{product.name}</h3>
              <p className="text-[13px] text-[var(--color-apple-text-secondary)] mb-3">
                {product.basePriceUsd != null ? `$${product.basePriceUsd}${common.monthly}` : "Free"}
              </p>
              <span className="badge badge-gray">
                {product.pricingModel === "regional"
                  ? (locale === "zh" ? "区域定价" : "Regional")
                  : (locale === "zh" ? "统一定价" : "Uniform")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Cheapest Regions — varied layout */}
      <section className="mx-auto max-w-[1200px] px-5 sm:px-8 mt-20">
        <h2 className="text-[28px] font-semibold tracking-[-0.01em] mb-6">
          {home.cheapest_regions}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-[1.5fr_1fr_1fr] gap-4">
          {HIGHLIGHTS.map((item, i) => {
            const isLarge = i === 0;
            return (
              <Link
                key={i}
                href={`/${locale}/product/${item.slug}/`}
                className={`apple-card p-5 bg-[var(--color-apple-green-bg)] border-[var(--color-apple-green)]/10 group ${
                  isLarge ? "sm:row-span-2 flex flex-col justify-center" : ""
                }`}
              >
                <div className="text-[13px] font-medium mb-1">{item.country}</div>
                <div className="text-[11px] text-[var(--color-apple-text-secondary)] mb-2">{item.product}</div>
                <div className={`font-semibold tracking-[-0.01em] text-[var(--color-apple-green-text)] ${isLarge ? "text-[28px]" : "text-[17px]"}`}>
                  {locale === "zh" ? `省 ${item.save}` : `Save ${item.save}`}
                </div>
                {isLarge && (
                  <div className="text-[13px] text-[var(--color-apple-green-text)]/70 mt-2">
                    {locale === "zh" ? "通过 App Store 内购订阅" : "via App Store in-app purchase"}
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
