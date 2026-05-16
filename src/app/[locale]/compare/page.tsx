import { getProducts } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";
import Link from "next/link";

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

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
    <div>
      <h1 className="text-3xl font-bold mb-4">{cmp.title}</h1>
      <p className="text-gray-500 mb-8">{cmp.select_products}</p>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {products.map((product) => (
          <Link
            key={product.slug}
            href={`/${locale}/product/${product.slug}`}
            className="p-4 border border-gray-200 rounded-lg hover:border-blue-300"
          >
            <h3 className="font-semibold">{product.name}</h3>
            <p className="text-sm text-gray-500">
              {product.basePriceUsd != null ? `$${product.basePriceUsd}${common.monthly}` : "Free"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
