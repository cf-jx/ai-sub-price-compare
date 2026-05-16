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
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8">
      {/* Header */}
      <div className="py-10 sm:py-14">
        <div className="flex items-center gap-3 mb-3">
          <h1 className="text-[36px] sm:text-[48px] font-semibold tracking-[-0.02em] text-[#1d1d1f]">
            {product.name}
          </h1>
          <span className="badge badge-blue mt-3">
            {product.pricingModel === "regional"
              ? (locale === "zh" ? "区域定价" : "Regional")
              : (locale === "zh" ? "统一定价" : "Uniform")}
          </span>
        </div>
        <p className="text-[17px] text-[#86868b] leading-relaxed max-w-[600px]">{desc}</p>
        {product.basePriceUsd != null && (
          <p className="text-[14px] text-[#86868b] mt-1">
            US {common.monthly}: ${product.basePriceUsd}
          </p>
        )}
      </div>

      {/* Plan tabs — jump to section */}
      <div className="flex gap-3 mb-10 flex-wrap">
        {product.plans.map((plan) => (
          <a
            key={plan.slug}
            href={`#plan-${plan.slug}`}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[980px] text-[14px] font-medium
                       bg-white border border-[#d2d2d7] text-[#1d1d1f] hover:border-[#86868b] hover:shadow-sm transition-all"
          >
            {plan.name}
            <span className="text-[12px] text-[#86868b]">
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
          <section key={plan.slug} id={`plan-${plan.slug}`} className="mb-16">
            <div className="flex items-baseline gap-3 mb-6">
              <h2 className="text-[24px] font-semibold tracking-[-0.01em] text-[#1d1d1f]">
                {plan.name}
              </h2>
              <span className="text-[14px] text-[#86868b]">
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
