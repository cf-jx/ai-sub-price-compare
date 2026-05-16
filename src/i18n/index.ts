import enMessages from "../../messages/en.json";
import zhMessages from "../../messages/zh.json";

export const locales = ["en", "zh"] as const;
export const defaultLocale = "en";
export type Locale = (typeof locales)[number];

const messages: Record<Locale, Record<string, unknown>> = { en: enMessages, zh: zhMessages };

export function getMessages(locale: Locale) {
  return messages[locale] ?? messages.en;
}

export function getStaticParams() {
  return locales.map((locale) => ({ locale }));
}
