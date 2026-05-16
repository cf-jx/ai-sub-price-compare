/**
 * ChatGPT Web Pricing Fetcher
 *
 * Uses the CDP Proxy (localhost:3456) to access chatgpt.com with the user's
 * logged-in browser session, then calls OpenAI's internal pricing API:
 *   GET /backend-api/checkout_pricing_config/configs/{COUNTRY_CODE}
 *
 * This returns structured JSON with plan prices, tax handling, PSP overrides,
 * currency configs — far more reliable than HTML scraping.
 *
 * Usage:
 *   1. Ensure CDP Proxy is running (check-deps.mjs)
 *   2. Ensure you're logged into chatgpt.com in Chrome
 *   3. npx tsx src/scripts/fetch-chatgpt-web.ts
 */

import fs from "fs";
import path from "path";

const CDP = "http://localhost:3456";
const DATA_DIR = path.join(process.cwd(), "data");
const OUTPUT_FILE = path.join(DATA_DIR, "chatgpt-api-raw.json");

// Country codes supported by OpenAI's internal API
// From GET /backend-api/checkout_pricing_config/countries
const PRIORITY_COUNTRIES = [
  "US", "GB", "DE", "FR", "ES", "IT", "NL", "BE", "AT", "CH", "SE", "NO",
  "DK", "FI", "PL", "PT", "IE", "JP", "KR", "IN", "BR", "TR", "NG", "PH",
  "CA", "AU", "ZA", "MX", "ID", "TH", "MY", "VN", "SG", "PK", "EG", "AR",
  "AE", "SA", "QA", "IL", "TW", "HK", "NZ", "CO", "CL", "PE", "HU", "CZ",
  "RO", "GR", "BG", "HR", "SK", "SI", "LT", "LV", "EE", "LU", "MT", "CY",
];

interface CdpResponse {
  result?: { value?: string };
  error?: string;
}

async function cdpEval(targetId: number, js: string): Promise<string> {
  const url = `${CDP}/eval?target=${targetId}`;
  const res = await fetch(url, {
    method: "POST",
    body: js,
  });
  const data = (await res.json()) as CdpResponse;
  if (data.error) throw new Error(`CDP eval error: ${JSON.stringify(data.error)}`);
  return data.result?.value ?? "";
}

async function cdpNavigate(targetId: number, url: string): Promise<void> {
  await fetch(`${CDP}/navigate?target=${targetId}`, {
    method: "POST",
    body: url,
  });
}

async function cdpClose(targetId: number): Promise<void> {
  await fetch(`${CDP}/close?target=${targetId}`);
}

async function main() {
  // Step 1: Open chatgpt.com in a new CDP tab
  console.log("[1/4] Opening chatgpt.com...");
  const newTabRes = await fetch(`${CDP}/new`, {
    method: "POST",
    body: "https://chatgpt.com",
  });
  const newTabData = (await newTabRes.json()) as { targetId?: number; id?: number };
  const targetId = newTabData.targetId ?? newTabData.id;
  if (!targetId) {
    console.error("Failed to create CDP tab:", JSON.stringify(newTabData));
    process.exit(1);
  }
  console.log(`  Tab opened: targetId=${targetId}`);

  // Step 2: Wait for page load and check login state
  console.log("[2/4] Waiting for page load + checking login state...");
  await new Promise((r) => setTimeout(r, 5000));

  // Check if we have a valid session by looking for the pricing API to be accessible
  const loginCheck = await cdpEval(
    targetId,
    `(async () => {
      try {
        const res = await fetch("https://chatgpt.com/backend-api/checkout_pricing_config/configs/US");
        if (res.ok) return "logged_in";
        return "api_failed_" + res.status;
      } catch(e) {
        return "error_" + e.message;
      }
    })()`
  );
  console.log(`  Login check: ${loginCheck}`);
  if (!loginCheck.includes("logged_in")) {
    console.error("  Cannot access ChatGPT pricing API. Check login state in Chrome.");
    await cdpClose(targetId);
    process.exit(1);
  }
  console.log("  ChatGPT API accessible ✓");

  // Step 3: Fetch pricing for each country via the internal API
  console.log(`[3/4] Fetching pricing for ${PRIORITY_COUNTRIES.length} countries...`);
  const results: Record<string, unknown> = {};

  for (let i = 0; i < PRIORITY_COUNTRIES.length; i++) {
    const cc = PRIORITY_COUNTRIES[i];
    const apiUrl = `https://chatgpt.com/backend-api/checkout_pricing_config/configs/${cc}`;

    try {
      const raw = await cdpEval(
        targetId,
        `(async () => {
          try {
            const res = await fetch("${apiUrl}");
            const json = await res.json();
            return JSON.stringify(json);
          } catch(e) { return 'ERROR:' + e.message; }
        })()`
      );

      // Parse the double-JSON-encoded result
      const clean = raw.replace(/^"|"$/g, "").replace(/\\"/g, '"');
      if (clean.startsWith("ERROR:")) {
        console.log(`  [${i + 1}/${PRIORITY_COUNTRIES.length}] ${cc}: ${clean}`);
        continue;
      }
      const parsed = JSON.parse(clean);
      results[cc] = parsed;
      console.log(`  [${i + 1}/${PRIORITY_COUNTRIES.length}] ${cc}: ${parsed.currency_config?.symbol_code ?? "?"} ${parsed.currency_config?.plus?.month?.amount ?? "?"}`);
    } catch (e) {
      console.log(`  [${i + 1}/${PRIORITY_COUNTRIES.length}] ${cc}: FAILED — ${e}`);
    }

    // Rate limit
    await new Promise((r) => setTimeout(r, 300));
  }

  // Step 4: Save results
  console.log("[4/4] Saving results...");
  fs.mkdirSync(path.dirname(OUTPUT_FILE), { recursive: true });
  fs.writeFileSync(
    OUTPUT_FILE,
    JSON.stringify({ fetchedAt: new Date().toISOString(), countries: results }, null, 2)
  );
  console.log(`  Saved ${Object.keys(results).length} countries to ${OUTPUT_FILE}`);

  await cdpClose(targetId);
  console.log("Done.");
}

main().catch((e) => {
  console.error("Fatal error:", e);
  process.exit(1);
});
