import { getProducts } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PRODUCT_ICONS: Record<string, string> = {
  chatgpt: "◇",
  claude: "✦",
  gemini: "◆",
  perplexity: "◈",
  cursor: "▷",
  midjourney: "◎",
};

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
        <h1 className="text-[44px] sm:text-[64px] font-semibold tracking-[-0.02em] leading-[1.05] text-[#1d1d1f]">
          {home.hero_title}
        </h1>
        <p className="mt-5 text-[19px] sm:text-[21px] leading-[1.4] text-[#86868b] max-w-[560px] mx-auto tracking-[-0.01em]">
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
              <div className="w-9 h-9 rounded-[12px] bg-[#f5f5f7] flex items-center justify-center text-[18px] text-[#1d1d1f]/60 mb-4 group-hover:scale-110 transition-transform duration-300">
                {PRODUCT_ICONS[product.slug] || product.name[0]}
              </div>
              <h3 className="text-[15px] font-semibold text-[#1d1d1f] mb-1">
                {product.name}
              </h3>
              <p className="text-[13px] text-[#86868b] mb-3">
                {product.basePriceUsd != null
                  ? `$${product.basePriceUsd}${common.monthly}`
                  : "Free"}
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

      {/* Cheapest Regions */}
      <section className="mx-auto max-w-[1200px] px-5 sm:px-8 mt-20">
        <h2 className="text-[28px] font-semibold tracking-[-0.01em] text-[#1d1d1f] mb-6">
          {home.cheapest_regions}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { country: "🇹🇷 Turkey", product: "ChatGPT App Store", save: "70%", slug: "chatgpt" },
            { country: "🇦🇷 Argentina", product: "ChatGPT App Store", save: "70%", slug: "chatgpt" },
            { country: "🇳🇬 Nigeria", product: "Claude Pro Web", save: "52%", slug: "claude" },
            { country: "🇹🇷 Turkey", product: "Gemini AI Pro", save: "44%", slug: "gemini" },
          ].map((item, i) => (
            <Link
              key={i}
              href={`/${locale}/product/${item.slug}/`}
              className="apple-card p-4 bg-[#f0faf4] border-[#34c759]/15 group"
            >
              <div className="text-[13px] font-medium text-[#1d1d1f] mb-1">{item.country}</div>
              <div className="text-[11px] text-[#86868b] mb-2">{item.product}</div>
              <div className="text-[17px] font-semibold text-[#1a7f37] tracking-[-0.01em]">
                {locale === "zh" ? `省 ${item.save}` : `Save ${item.save}`}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
