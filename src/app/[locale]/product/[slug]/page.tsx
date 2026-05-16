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
    <div>
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-2">
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <span className="text-sm px-2 py-0.5 rounded bg-gray-100 text-gray-600">
            {product.pricingModel === "regional"
              ? (locale === "zh" ? "区域定价" : "Regional Pricing")
              : (locale === "zh" ? "统一定价" : "Uniform Pricing")}
          </span>
        </div>
        <p className="text-gray-500">{desc}</p>
        {product.basePriceUsd != null && (
          <p className="text-sm text-gray-400 mt-1">
            US base: ${product.basePriceUsd}{common.monthly}
          </p>
        )}
      </div>

      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-3">{prod.plans}</h2>
        <div className="flex gap-2 flex-wrap">
          {product.plans.map((plan) => (
            <a
              key={plan.slug}
              href={`#plan-${plan.slug}`}
              className="px-4 py-2 rounded-lg border border-gray-200 text-sm hover:border-blue-300"
            >
              {plan.name}
              <span className="text-gray-400 ml-1">
                ({plan.billingPeriod === "monthly" ? common.monthly : common.annual})
              </span>
            </a>
          ))}
        </div>
      </div>

      {product.plans.map((plan) => {
        const webPrices = prices?.webPrices[plan.slug] ?? [];
        const appStorePrices = prices?.appStorePrices[plan.slug] ?? [];

        return (
          <section key={plan.slug} id={`plan-${plan.slug}`} className="mb-12">
            <h3 className="text-xl font-semibold mb-4">
              {plan.name}
              <span className="text-sm text-gray-400 ml-2 font-normal">
                {locale === "zh" ? plan.descriptionZh : plan.descriptionEn}
              </span>
            </h3>
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
