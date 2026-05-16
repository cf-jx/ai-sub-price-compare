import { getProducts } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

const PRODUCT_ICONS: Record<string, string> = {
  chatgpt: "◇", claude: "✦", gemini: "◆", perplexity: "◈", cursor: "▷", midjourney: "◎",
};

export default async function ComparePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale;
  const msg = getMessages(locale);
  const cmp = msg.compare as Record<string, string>;
  const common = msg.common as Record<string, string>;
  const products = getProducts();

  return (
    <div className="mx-auto max-w-[1152px] px-5 sm:px-8 py-10 sm:py-14">
      <div className="mb-10">
        <h1 className="text-[2rem] sm:text-[2.5rem] font-semibold tracking-[-0.02em] text-[var(--color-text)] mb-2">
          {cmp.title}
        </h1>
        <p className="text-[1rem] text-[var(--color-text-secondary)]">{cmp.select_products}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {products.map((product, i) => {
          const icon = PRODUCT_ICONS[product.slug] || product.name[0];
          const isWide = i === 0;
          return (
            <Link
              key={product.slug}
              href={`/${locale}/product/${product.slug}/`}
              className={`card card-interactive p-5 group ${
                isWide ? "sm:col-span-2" : ""
              }`}
            >
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-[10px] bg-[var(--color-accent-subtle)] flex items-center justify-center text-[1.125rem] text-[var(--color-accent)] shrink-0 group-hover:scale-105 motion-safe:transition-transform motion-safe:duration-250">
                  {icon}
                </div>
                <div>
                  <h3 className="text-[1rem] font-semibold text-[var(--color-text)]">{product.name}</h3>
                  <p className="text-[0.8125rem] text-[var(--color-text-secondary)]">
                    {product.basePriceUsd != null ? `$${product.basePriceUsd}${common.monthly}` : "Free"}
                  </p>
                </div>
                <span className={`badge ml-auto shrink-0 ${
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
    </div>
  );
}
