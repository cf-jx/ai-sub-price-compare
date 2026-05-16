/**
 * Transform raw ChatGPT API data into the application's price format.
 * Reads data/chatgpt-api-raw.json → updates data/prices/chatgpt.json
 *
 * Usage: npx tsx src/scripts/transform-chatgpt-data.ts
 */

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");
const RAW_FILE = path.join(DATA_DIR, "chatgpt-api-raw.json");
const PRICE_FILE = path.join(DATA_DIR, "prices", "chatgpt.json");

// Exchange rates (approx May 2026)
const RATES: Record<string, number> = {
  USD: 1.0, EUR: 0.92, GBP: 0.79, JPY: 156.5, KRW: 1370,
  INR: 85.5, BRL: 5.72, TRY: 36.0, NGN: 1550, PHP: 57.8,
  CAD: 1.37, AUD: 1.53, ZAR: 18.6, MXN: 20.1, IDR: 16300,
  THB: 36.4, MYR: 4.68, VND: 25250, SGD: 1.34, PKR: 278,
  EGP: 48.5, AED: 3.67, PLN: 3.95, SEK: 10.4, CHF: 0.88,
  ILS: 3.67, SAR: 3.75, TWD: 32.3, NZD: 1.65, COP: 4160,
  CLP: 950, NOK: 10.7, ARS: 1060,
};

interface ApiData {
  country_code: string;
  currency_config: {
    symbol_code: string;
    symbol: string;
    minor_unit_exponent: number;
    tax_type: string;
    tax_percent?: number;
    plus: { month: { amount: number; tax: string }; year?: { amount: number; tax: string } };
    pro: { month: { amount: number; tax: string } };
    prolite?: { month: { amount: number; tax: string } };
    go?: { month: { amount: number; tax: string } };
    vat_display: {
      inclusive_tax_display: string;
      exclusive_tax_display: string;
      show_reverse_charge_disclaimer: boolean;
    };
  };
}

function toUsd(amount: number, currency: string): number {
  const rate = RATES[currency];
  if (!rate || rate === 0) return amount;
  return currency === "USD" ? amount : amount / rate;
}

function transform() {
  const raw = JSON.parse(fs.readFileSync(RAW_FILE, "utf-8"));
  const existing = JSON.parse(fs.readFileSync(PRICE_FILE, "utf-8"));

  const webPlusPrices: unknown[] = [];
  const webProPrices: unknown[] = [];
  const webGoPrices: unknown[] = [];

  for (const [cc, data] of Object.entries(raw) as [string, ApiData][]) {
    if (!data?.currency_config) continue;
    const cfg = data.currency_config;
    const currency = cfg.symbol_code;
    const symbol = cfg.symbol;

    // Plus plan
    const plusAmount = cfg.plus?.month?.amount;
    const plusTax = cfg.plus?.month?.tax;
    if (plusAmount != null) {
      const usd = toUsd(plusAmount, currency);
      webPlusPrices.push({
        countryCode: cc,
        currencyCode: currency,
        symbol,
        displayAmount: plusAmount,
        displayTaxHandling: plusTax,
        taxType: cfg.tax_type,
        taxPercent: cfg.tax_percent ?? null,
        taxInclusiveAmount: plusTax === "inclusive" ? plusAmount : null,
        taxExclusiveAmount: plusTax === "exclusive" ? plusAmount : (plusAmount / (1 + (cfg.tax_percent ?? 0) / 100)),
        calculatedUsdEquivalent: Math.round(usd * 100) / 100,
        premiumVsUsPct: Math.round(((usd - 20) / 20) * 1000) / 10,
        source: "openai_api",
        fetchedAt: new Date().toISOString().split("T")[0],
      });
    }

    // Pro $200 plan
    const proAmount = cfg.pro?.month?.amount;
    if (proAmount != null) {
      const usd = toUsd(proAmount, currency);
      webProPrices.push({
        countryCode: cc,
        currencyCode: currency,
        symbol,
        displayAmount: proAmount,
        displayTaxHandling: cfg.pro.month.tax,
        taxType: cfg.tax_type,
        taxPercent: cfg.tax_percent ?? null,
        calculatedUsdEquivalent: Math.round(usd * 100) / 100,
        premiumVsUsPct: Math.round(((usd - 200) / 200) * 1000) / 10,
        source: "openai_api",
        fetchedAt: new Date().toISOString().split("T")[0],
      });
    }

    // Go plan
    const goAmount = cfg.go?.month?.amount;
    if (goAmount != null) {
      const usd = toUsd(goAmount, currency);
      webGoPrices.push({
        countryCode: cc,
        currencyCode: currency,
        symbol,
        displayAmount: goAmount,
        displayTaxHandling: cfg.go?.month?.tax ?? plusTax,
        taxType: cfg.tax_type,
        taxPercent: cfg.tax_percent ?? null,
        calculatedUsdEquivalent: Math.round(usd * 100) / 100,
        premiumVsUsPct: 0,
        source: "openai_api",
        fetchedAt: new Date().toISOString().split("T")[0],
      });
    }
  }

  // Update the price file
  existing.webPrices.plus = webPlusPrices;
  existing.webPrices.pro = webProPrices;
  existing.webPrices.go = webGoPrices;
  existing._updatedAt = new Date().toISOString();

  fs.writeFileSync(PRICE_FILE, JSON.stringify(existing, null, 2));
  console.log(`Updated ${PRICE_FILE}`);
  console.log(`  Plus: ${webPlusPrices.length} countries`);
  console.log(`  Pro: ${webProPrices.length} countries`);
  console.log(`  Go: ${webGoPrices.length} countries`);

  // Show highlights
  const sorted = [...webPlusPrices].sort((a: any, b: any) => a.calculatedUsdEquivalent - b.calculatedUsdEquivalent);
  console.log("\nCheapest Plus:");
  sorted.slice(0, 5).forEach((p: any) => console.log(`  ${p.countryCode}: ${p.symbol}${p.displayAmount} ≈ $${p.calculatedUsdEquivalent} (${p.premiumVsUsPct}%)`));
  console.log("Most expensive Plus:");
  sorted.slice(-5).reverse().forEach((p: any) => console.log(`  ${p.countryCode}: ${p.symbol}${p.displayAmount} ≈ $${p.calculatedUsdEquivalent} (${p.premiumVsUsPct}%)`));
}

transform();
