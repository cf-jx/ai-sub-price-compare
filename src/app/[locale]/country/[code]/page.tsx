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
    <div className="mx-auto max-w-[1152px] px-5 sm:px-8 py-10 sm:py-14">
      <h1 className="text-[2.25rem] sm:text-[3rem] font-semibold tracking-[-0.02em] text-[var(--color-text)] mb-3">
        {country.flagEmoji} {name}
      </h1>
      <p className="text-[1.0625rem] text-[var(--color-text-secondary)] mb-5 max-w-[560px]">
        {cnt.all_products.replace("{country}", name)}
      </p>
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-[980px] bg-[var(--color-accent-subtle)] text-[0.875rem] text-[var(--color-text)]">
        <span className="text-[var(--color-text-tertiary)]">{locale === "zh" ? "货币" : "Currency"}:</span>
        {country.currencyCode} ({country.currencySymbol})
        {country.usesUsdForWeb && (
          <span className="badge badge-warn text-[0.6875rem]">
            {locale === "zh" ? "网页端 USD 定价" : "Web: USD pricing"}
          </span>
        )}
      </div>
    </div>
  );
}
