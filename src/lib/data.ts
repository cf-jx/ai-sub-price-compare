// Static data layer — during SSG, read from generated JSON files.
// In dev, can optionally read directly from Turso.
// For Phase 1 MVP, this reads bundled JSON seed data.

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

export interface ProductData {
  id: number;
  name: string;
  slug: string;
  logoUrl: string | null;
  descriptionEn: string | null;
  descriptionZh: string | null;
  pricingModel: "regional" | "uniform";
  basePriceUsd: number | null;
  plans: PlanData[];
}

export interface PlanData {
  id: number;
  name: string;
  slug: string;
  billingPeriod: "monthly" | "annual";
  tierOrder: number;
  descriptionEn: string | null;
  descriptionZh: string | null;
}

export interface CountryData {
  code: string;
  nameEn: string;
  nameZh: string;
  flagEmoji: string | null;
  region: string;
  currencyCode: string;
  currencySymbol: string | null;
  usesUsdForWeb?: boolean;
}

export interface PriceEntry {
  countryCode: string;
  currencyCode: string;
  symbol: string | null;
  displayAmount: number;
  displayTaxHandling: "inclusive" | "exclusive";
  taxType: string | null;
  taxPercent: number | null;
  taxInclusiveAmount: number | null;
  taxExclusiveAmount: number | null;
  calculatedUsdEquivalent: number;
  premiumVsUsPct: number;
  source: string;
  fetchedAt: string;
}

export interface ProductPrices {
  product: ProductData;
  webPrices: Record<string, PriceEntry[]>;  // planSlug -> prices
  appStorePrices: Record<string, PriceEntry[]>;  // planSlug -> prices
}

function loadJson<T>(filename: string): T {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

export function getProducts(): ProductData[] {
  return loadJson<ProductData[]>("products.json");
}

export function getProduct(slug: string): ProductData | undefined {
  const products = getProducts();
  return products.find((p) => p.slug === slug);
}

export function getCountries(): CountryData[] {
  return loadJson<CountryData[]>("countries.json");
}

export function getProductPrices(slug: string): ProductPrices | null {
  try {
    return loadJson<ProductPrices>(`prices/${slug}.json`);
  } catch {
    return null;
  }
}

export function getExchangeRates(): Record<string, number> {
  try {
    return loadJson<Record<string, number>>("exchange-rates.json");
  } catch {
    return {};
  }
}
