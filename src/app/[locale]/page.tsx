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
  { country: "Turkey", flag: "🇹🇷", product: "ChatGPT App Store", save: "70%", slug: "chatgpt" },
  { country: "Argentina", flag: "🇦🇷", product: "ChatGPT App Store", save: "70%", slug: "chatgpt" },
  { country: "Nigeria", flag: "🇳🇬", product: "Claude Pro Web", save: "52%", slug: "claude" },
  { country: "Turkey", flag: "🇹🇷", product: "Gemini AI Pro", save: "44%", slug: "gemini" },
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

  // Assign visual weights: featured products get larger cards
  const featured = new Set(["chatgpt", "claude", "gemini"]);

  return (
    <div>
      {/* Hero — typographic, no gradient */}
      <section className="mx-auto max-w-[1152px] px-5 sm:px-8 pt-20 sm:pt-28 pb-16 sm:pb-20">
        <h1 className="text-[2.5rem] sm:text-[3.5rem] font-semibold tracking-[-0.025em] leading-[1.08] max-w-[640px] text-[var(--color-text)]">
          {home.hero_title}
        </h1>
        <p className="mt-4 text-[1.0625rem] sm:text-[1.125rem] leading-[1.55] text-[var(--color-text-secondary)] max-w-[520px]">
          {home.hero_subtitle}
        </p>
      </section>

      {/* Products — bento grid */}
      <section className="mx-auto max-w-[1152px] px-5 sm:px-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {products.map((product) => {
            const isFeatured = featured.has(product.slug);
            const icon = PRODUCT_ICONS[product.slug] || product.name[0];
            return (
              <Link
                key={product.slug}
                href={`/${locale}/product/${product.slug}/`}
                className={`card card-interactive p-4 sm:p-5 group flex flex-col ${
                  isFeatured ? "sm:col-span-2 sm:flex-row sm:items-center sm:gap-5" : ""
                }`}
              >
                <div className={`shrink-0 flex items-center justify-center rounded-[10px] bg-[var(--color-accent-subtle)] text-[var(--color-accent)] group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-250 ${
                  isFeatured ? "w-10 h-10 text-[1.25rem] sm:mb-0 mb-3" : "w-8 h-8 text-[1rem] mb-3"
                }`}>
                  {icon}
                </div>
                <div className={isFeatured ? "min-w-0" : ""}>
                  <h3 className={`font-semibold tracking-[-0.01em] ${
                    isFeatured ? "text-[1.0625rem] sm:text-[1.125rem]" : "text-[0.875rem]"
                  }`}>
                    {product.name}
                  </h3>
                  <p className="text-[0.8125rem] text-[var(--color-text-secondary)] mt-0.5">
                    {product.basePriceUsd != null ? `$${product.basePriceUsd}${common.monthly}` : "Free"}
                  </p>
                  <span className={`badge mt-2 ${
                    product.pricingModel === "regional" ? "badge-good" : "badge-muted"
                  }`}>
                    {product.pricingModel === "regional"
                      ? (locale === "zh" ? "区域定价" : "Regional")
                      : (locale === "zh" ? "统一定价" : "Uniform")}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Best deals — horizontal strip, not card grid */}
      <section className="mx-auto max-w-[1152px] px-5 sm:px-8 mt-16">
        <h2 className="text-[1.25rem] font-semibold tracking-[-0.01em] mb-4 text-[var(--color-text)]">
          {home.cheapest_regions}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {HIGHLIGHTS.map((item, i) => (
            <Link
              key={i}
              href={`/${locale}/product/${item.slug}/`}
              className="card card-interactive p-4 group flex items-center gap-3"
            >
              <div className="text-[1.5rem] shrink-0">{item.flag}</div>
              <div className="min-w-0">
                <div className="text-[0.8125rem] font-medium truncate">{item.product}</div>
                <div className="text-[0.75rem] text-[var(--color-text-secondary)]">{item.country}</div>
              </div>
              <div className="ml-auto shrink-0 text-[0.9375rem] font-semibold tracking-[-0.01em] text-[var(--color-good)]">
                {locale === "zh" ? `省 ${item.save}` : `Save ${item.save}`}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
