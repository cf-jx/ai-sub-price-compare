import { getProducts } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
      <section className="text-center py-16">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
          {home.hero_title}
        </h1>
        <p className="mt-4 text-lg text-gray-500 max-w-2xl mx-auto">
          {home.hero_subtitle}
        </p>
      </section>

      <section>
        <h2 className="text-2xl font-semibold mb-6">{home.popular_products}</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((product) => (
            <Link
              key={product.slug}
              href={`/${locale}/product/${product.slug}`}
              className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-sm transition"
            >
              <div className="w-8 h-8 rounded bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm mb-2">
                {product.name[0]}
              </div>
              <h3 className="font-semibold text-sm">{product.name}</h3>
              <p className="text-xs text-gray-500 mt-1">
                {product.basePriceUsd != null
                  ? `$${product.basePriceUsd}${common.monthly}`
                  : "Free"}
              </p>
              <span className="inline-block mt-2 text-xs px-2 py-0.5 rounded bg-gray-100 text-gray-600">
                {product.pricingModel === "regional" ? (locale === "zh" ? "区域定价" : "Regional") : (locale === "zh" ? "统一定价" : "Uniform")}
              </span>
            </Link>
          ))}
        </div>
      </section>

      {/* Cheapest Regions */}
      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">{home.cheapest_regions}</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
          {[
            { country: "🇹🇷 Turkey", product: "ChatGPT App Store", save: "70%", slug: "chatgpt" },
            { country: "🇦🇷 Argentina", product: "ChatGPT App Store", save: "70%", slug: "chatgpt" },
            { country: "🇳🇬 Nigeria", product: "Claude Pro Web", save: "52%", slug: "claude" },
            { country: "🇹🇷 Turkey", product: "Gemini AI Pro Web", save: "44%", slug: "gemini" },
          ].map((item, i) => (
            <Link
              key={i}
              href={`/${locale}/product/${item.slug}`}
              className="p-3 border border-green-200 rounded-lg bg-green-50 hover:bg-green-100 transition"
            >
              <div className="font-medium">{item.country}</div>
              <div className="text-gray-500 text-xs">{item.product}</div>
              <div className="text-green-600 font-semibold mt-1">{common.save_pct.replace("{percent}", item.save)}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
