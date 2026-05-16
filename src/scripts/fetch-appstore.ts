// Fetch App Store IAP prices using iTunes Search API
// Run: npx tsx src/scripts/fetch-appstore.ts

import fs from "fs";
import path from "path";

const DATA_DIR = path.join(process.cwd(), "data");

interface AppInfo {
  name: string;
  slug: string;
  appId: string; // Apple App Store app ID
}

const APPS: AppInfo[] = [
  { name: "ChatGPT", slug: "chatgpt", appId: "6448311069" },
  { name: "Claude", slug: "claude", appId: "6473753684" },
];

// Common storefronts (country codes for App Store)
const STOREFRONTS = [
  "us", "gb", "de", "fr", "jp", "kr", "in", "br", "tr", "ng",
  "ph", "ca", "au", "za", "mx", "id", "th", "my", "vn", "sg",
  "pk", "eg", "ar", "ae", "pl", "se", "ch", "il", "sa", "tw",
];

async function fetchAppStorePrice(appId: string, storefront: string) {
  const url = `https://itunes.apple.com/lookup?id=${appId}&country=${storefront}`;
  try {
    const res = await fetch(url);
    const json = await res.json();
    if (json.resultCount === 0) return null;
    const result = json.results[0];
    return {
      price: result.price,
      currency: result.currency,
      formattedPrice: result.formattedPrice,
    };
  } catch (e) {
    console.error(`Failed to fetch ${appId} in ${storefront}:`, e);
    return null;
  }
}

async function main() {
  for (const app of APPS) {
    console.log(`Fetching App Store prices for ${app.name}...`);
    const results: Record<string, unknown> = {};

    for (const sf of STOREFRONTS) {
      const price = await fetchAppStorePrice(app.appId, sf);
      if (price) {
        results[sf] = price;
      }
      // Rate limiting — be nice to Apple's API
      await new Promise((r) => setTimeout(r, 200));
    }

    const outPath = path.join(DATA_DIR, "appstore", `${app.slug}.json`);
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(results, null, 2));
    console.log(`  Saved ${Object.keys(results).length} storefronts`);
  }
}

main().catch(console.error);
