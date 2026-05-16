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
    <div>
      <h1 className="text-3xl font-bold mb-4">
        {country.flagEmoji} {name}
      </h1>
      <p className="text-gray-500 mb-4">
        {cnt.all_products.replace("{country}", name)}
      </p>
      <p className="text-gray-400 text-sm">
        Currency: {country.currencyCode} ({country.currencySymbol})
        {country.usesUsdForWeb ? " (Web prices in USD)" : ""}
      </p>
    </div>
  );
}
