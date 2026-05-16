import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  logoUrl: text("logo_url"),
  descriptionEn: text("description_en"),
  descriptionZh: text("description_zh"),
  pricingModel: text("pricing_model", { enum: ["regional", "uniform"] }).notNull(),
  hasAppStorePricing: integer("has_app_store_pricing", { mode: "boolean" }).default(true),
  hasWebPricing: integer("has_web_pricing", { mode: "boolean" }).default(true),
  basePriceUsd: real("base_price_usd"),
  createdAt: text("created_at").default(new Date().toISOString()),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

export const countries = sqliteTable("countries", {
  code: text("code").primaryKey(),
  nameEn: text("name_en").notNull(),
  nameZh: text("name_zh").notNull(),
  flagEmoji: text("flag_emoji"),
  region: text("region", {
    enum: ["asia_pacific", "europe", "americas", "middle_east_africa", "oceania"],
  }).notNull(),
  currencyCode: text("currency_code").notNull(),
  currencySymbol: text("currency_symbol"),
  usesUsdForWeb: integer("uses_usd_for_web", { mode: "boolean" }).default(false),
  isRestricted: integer("is_restricted", { mode: "boolean" }).default(false),
});

export const plans = sqliteTable("plans", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  productId: integer("product_id").references(() => products.id).notNull(),
  name: text("name").notNull(),
  slug: text("slug").notNull(),
  billingPeriod: text("billing_period", { enum: ["monthly", "annual"] }).notNull().default("monthly"),
  tierOrder: integer("tier_order").default(0),
  descriptionEn: text("description_en"),
  descriptionZh: text("description_zh"),
});

export const webPrices = sqliteTable("web_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  countryCode: text("country_code").references(() => countries.code).notNull(),
  source: text("source").notNull(),
  currencyCode: text("currency_code").notNull(),
  symbol: text("symbol"),
  minorUnitExponent: integer("minor_unit_exponent").default(2),
  displayAmount: real("display_amount").notNull(),
  displayTaxHandling: text("display_tax_handling", { enum: ["inclusive", "exclusive"] }),
  taxType: text("tax_type"),
  taxPercent: real("tax_percent"),
  taxInclusiveAmount: real("tax_inclusive_amount"),
  taxExclusiveAmount: real("tax_exclusive_amount"),
  pspOverrideAmount: real("psp_override_amount"),
  pspOverrideTaxHandling: text("psp_override_tax_handling"),
  vatDisplayType: text("vat_display_type"),
  showReverseChargeDisclaimer: integer("show_reverse_charge_disclaimer", { mode: "boolean" }),
  calculatedUsdEquivalent: real("calculated_usd_equivalent"),
  premiumVsUsPct: real("premium_vs_us_pct"),
  fetchedAt: text("fetched_at").default(new Date().toISOString()),
  fetchMethod: text("fetch_method"),
});

export const appStorePrices = sqliteTable("app_store_prices", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  countryCode: text("country_code").references(() => countries.code).notNull(),
  store: text("store", { enum: ["apple_app_store", "google_play_store"] }).notNull(),
  currencyCode: text("currency_code").notNull(),
  price: real("price").notNull(),
  calculatedUsdEquivalent: real("calculated_usd_equivalent"),
  premiumVsUsPct: real("premium_vs_us_pct"),
  fetchedAt: text("fetched_at").default(new Date().toISOString()),
});

export const exchangeRates = sqliteTable("exchange_rates", {
  currencyCode: text("currency_code").primaryKey(),
  rateToUsd: real("rate_to_usd").notNull(),
  updatedAt: text("updated_at").default(new Date().toISOString()),
});

export const priceSnapshots = sqliteTable("price_snapshots", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  planId: integer("plan_id").references(() => plans.id).notNull(),
  countryCode: text("country_code").references(() => countries.code).notNull(),
  source: text("source", { enum: ["web", "appstore"] }).notNull(),
  priceData: text("price_data").notNull(),
  capturedAt: text("captured_at").default(new Date().toISOString()),
});
