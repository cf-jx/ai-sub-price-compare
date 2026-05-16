import { getProduct, getProductPrices, getCountries, getExchangeRates, getProducts } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import { notFound } from "next/navigation";
import PriceTable from "@/components/PriceTable";

export function generateStaticParams() {
  const products = getProducts();
  const params: { locale: string; slug: string }[] = [];
  for (const locale of locales) {
    for (const product of products) {
      params.push({ locale, slug: product.slug });
    }
  }
  return params;
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { slug, locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale;
  const msg = getMessages(locale);
  const prod = msg.product as Record<string, string>;
  const common = msg.common as Record<string, string>;

  const product = getProduct(slug);
  if (!product) notFound();

  const prices = getProductPrices(slug);
  const countries = getCountries();
  const exchangeRates = getExchangeRates();
  const countryMap = new Map(countries.map((c) => [c.code, c]));
  const desc = locale === "zh" ? product.descriptionZh : product.descriptionEn;

  return (
    <div className="mx-auto max-w-[1152px] px-5 sm:px-8">
      {/* Header */}
      <div className="py-10 sm:py-14">
        <div className="flex items-center gap-3 mb-2 flex-wrap">
          <h1 className="text-[2.25rem] sm:text-[3rem] font-semibold tracking-[-0.02em] text-[var(--color-text)]">
            {product.name}
          </h1>
          <span className={`badge ${
            product.pricingModel === "regional" ? "badge-good" : "badge-muted"
          }`}>
            {product.pricingModel === "regional"
              ? (locale === "zh" ? "区域定价" : "Regional")
              : (locale === "zh" ? "统一定价" : "Uniform")}
          </span>
        </div>
        <p className="text-[1.0625rem] text-[var(--color-text-secondary)] leading-relaxed max-w-[600px]">
          {desc}
        </p>
        {product.basePriceUsd != null && (
          <p className="text-[0.875rem] text-[var(--color-text-tertiary)] mt-1.5">
            US {common.monthly}: ${product.basePriceUsd}
          </p>
        )}
      </div>

      {/* Plan tabs */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {product.plans.map((plan) => (
          <a
            key={plan.slug}
            href={`#plan-${plan.slug}`}
            className="btn-pill"
          >
            {plan.name}
            <span className="text-[0.6875rem] text-[var(--color-text-tertiary)]">
              {plan.billingPeriod === "monthly" ? common.monthly : common.annual}
            </span>
          </a>
        ))}
      </div>

      {/* Price sections per plan */}
      {product.plans.map((plan) => {
        const webPrices = prices?.webPrices[plan.slug] ?? [];
        const appStorePrices = prices?.appStorePrices[plan.slug] ?? [];

        return (
          <section key={plan.slug} id={`plan-${plan.slug}`} className="mb-14">
            <div className="flex items-baseline gap-3 mb-5">
              <h2 className="text-[1.375rem] font-semibold tracking-[-0.01em] text-[var(--color-text)]">
                {plan.name}
              </h2>
              <span className="text-[0.875rem] text-[var(--color-text-tertiary)]">
                {locale === "zh" ? plan.descriptionZh : plan.descriptionEn}
              </span>
            </div>
            <PriceTable
              webPrices={webPrices}
              appStorePrices={appStorePrices}
              countryMap={countryMap}
              exchangeRates={exchangeRates}
              basePriceUsd={product.basePriceUsd ?? 0}
              locale={locale}
            />
          </section>
        );
      })}
    </div>
  );
}
