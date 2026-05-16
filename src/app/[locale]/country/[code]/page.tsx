import { getCountries } from "@/lib/data";
import { locales, defaultLocale, getMessages, type Locale } from "@/i18n";

export function generateStaticParams() {
  const countries = getCountries();
  const params: { locale: string; code: string }[] = [];
  for (const locale of locales) {
    for (const country of countries) {
      params.push({ locale, code: country.code });
    }
  }
  return params;
}

export default async function CountryPage({
  params,
}: {
  params: Promise<{ locale: string; code: string }>;
}) {
  const { code, locale: rawLocale } = await params;
  const locale = (locales.includes(rawLocale as Locale) ? rawLocale : defaultLocale) as Locale;
  const msg = getMessages(locale);
  const cnt = msg.country as Record<string, string>;
  const countries = getCountries();
  const country = countries.find((c) => c.code === code);
  if (!country) return <p>Country not found</p>;

  const name = locale === "zh" ? country.nameZh : country.nameEn;

  return (
    <div className="mx-auto max-w-[1200px] px-5 sm:px-8 py-10 sm:py-14">
      <h1 className="text-[36px] sm:text-[44px] font-semibold tracking-[-0.02em] text-[#1d1d1f] mb-4">
        {country.flagEmoji} {name}
      </h1>
      <p className="text-[17px] text-[#86868b] mb-3">
        {cnt.all_products.replace("{country}", name)}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[980px] bg-[#f5f5f7] text-[14px] text-[#1d1d1f]">
        <span className="text-[#86868b]">{locale === "zh" ? "货币" : "Currency"}:</span>
        {country.currencyCode} ({country.currencySymbol})
        {country.usesUsdForWeb && (
          <span className="badge badge-amber text-[11px]">
            {locale === "zh" ? "网页端 USD 定价" : "Web: USD pricing"}
          </span>
        )}
      </div>
    </div>
  );
}
