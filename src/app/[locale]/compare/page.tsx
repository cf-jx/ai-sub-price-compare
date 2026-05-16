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
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10 sm:py-14">
      <h1 className="text-[36px] sm:text-[44px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mb-3">
        {cmp.title}
      </h1>
      <p className="text-[17px] text-[#86868b] mb-10">{cmp.select_products}</p>
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
            <h3 className="text-[15px] font-semibold text-[#1d1d1f]">{product.name}</h3>
            <p className="text-[13px] text-[#86868b] mt-1">
              {product.basePriceUsd != null ? `$${product.basePriceUsd}${common.monthly}` : "Free"}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
