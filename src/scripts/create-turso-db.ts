/**
 * Create Turso database and get credentials via Platform API.
 * Uses the session cookie extracted from the CDP browser.
 *
 * Usage: npx tsx src/scripts/create-turso-db.ts
 */

const CDP = "http://localhost:3456";

interface Organization {
  id: string;
  name: string;
  slug: string;
  type: "personal" | "team";
  blocked_reads: boolean;
  blocked_writes: boolean;
  overages: boolean;
}

interface Database {
  Name: string;
  DbId: string;
  Hostname: string;
  block_reads: boolean;
  block_writes: boolean;
  allow_attach: boolean;
  regions: string[];
  primaryRegion: string;
  type: string;
  version: string;
  group: string;
  is_schema: boolean;
  schema: string;
  archived: boolean;
}

async function cdpEval(targetId: number, js: string): Promise<string> {
  const res = await fetch(`${CDP}/eval?target=${targetId}`, {
    method: "POST",
    body: js,
  });
  const data = await res.json() as { result?: { value?: string }; error?: string };
  if (data.error) throw new Error(`CDP eval error: ${data.error}`);
  return data.result?.value ?? "";
}

async function main() {
  console.log("Getting session from CDP browser...");

  // Get the __session cookie from Turso tab
  const cookies = await cdpEval(5, "document.cookie");
  const sessionMatch = cookies.match(/__session=([^;]+)/);
  if (!sessionMatch) {
    console.error("No __session cookie found. Please ensure you are logged into app.turso.tech");
    process.exit(1);
  }
  const sessionToken = sessionMatch[1];
  console.log("Session token obtained ✓");

  const API_BASE = "https://api.turso.tech";
  const headers = {
    Authorization: `Bearer ${sessionToken}`,
    "Content-Type": "application/json",
  };

  // Step 1: List organizations
  console.log("\n[1] Listing organizations...");
  const orgsRes = await fetch(`${API_BASE}/v1/organizations`, { headers });
  const orgs = (await orgsRes.json()) as Organization[];
  console.log(`  Found ${orgs.length} org(s):`);
  for (const org of orgs) {
    console.log(`    - ${org.name} (${org.slug}) [${org.type}]`);
  }

  const personalOrg = orgs.find((o) => o.type === "personal");
  if (!personalOrg) {
    console.error("No personal org found");
    process.exit(1);
  }
  const orgName = personalOrg.slug;

  // Step 2: Check if database already exists
  console.log(`\n[2] Checking for existing databases...`);
  const dbsRes = await fetch(`${API_BASE}/v1/organizations/${orgName}/databases`, { headers });
  const dbs = (await dbsRes.json()) as Database[];

  const existingDb = dbs.find((d) => d.Name === "ai-sub-prices");
  if (existingDb) {
    console.log(`  Database "ai-sub-prices" already exists!`);
    console.log(`    Hostname: ${existingDb.Hostname}`);
    console.log(`    Region: ${existingDb.primaryRegion}`);
  } else {
    // Step 3: Create the database
    console.log(`\n[3] Creating database "ai-sub-prices"...`);
    const createRes = await fetch(
      `${API_BASE}/v1/organizations/${orgName}/databases`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "ai-sub-prices",
          location: "nrt", // Tokyo
          image: "latest",
        }),
      }
    );

    if (!createRes.ok) {
      const err = await createRes.text();
      console.error(`  Failed: ${createRes.status} ${err}`);

      // Try alternative location
      console.log(`  Retrying with default location...`);
      const retryRes = await fetch(
        `${API_BASE}/v1/organizations/${orgName}/databases`,
        {
          method: "POST",
          headers,
          body: JSON.stringify({ name: "ai-sub-prices", image: "latest" }),
        }
      );
      if (!retryRes.ok) {
        const err2 = await retryRes.text();
        console.error(`  Also failed: ${retryRes.status} ${err2}`);
        process.exit(1);
      }
      const db = (await retryRes.json()) as { Name: string; Hostname: string };
      console.log(`  Created: ${db.Name} @ ${db.Hostname}`);
    } else {
      const db = (await createRes.json()) as { Name: string; Hostname: string };
      console.log(`  Created: ${db.Name} @ ${db.Hostname}`);
    }
  }

  // Step 4: Get the database info
  console.log(`\n[4] Getting database info...`);
  const dbInfoRes = await fetch(
    `${API_BASE}/v1/organizations/${orgName}/databases/ai-sub-prices`,
    { headers }
  );
  const dbInfo = (await dbInfoRes.json()) as Database;
  console.log(`  Name: ${dbInfo.Name}`);
  console.log(`  Hostname: ${dbInfo.Hostname}`);
  console.log(`  Region: ${dbInfo.primaryRegion}`);

  // Step 5: Create an auth token for the database
  console.log(`\n[5] Creating auth token...`);
  const tokenRes = await fetch(
    `${API_BASE}/v1/organizations/${orgName}/databases/ai-sub-prices/auth-tokens`,
    {
      method: "POST",
      headers,
      body: JSON.stringify({}),
    }
  );

  if (!tokenRes.ok) {
    // Token might already exist — list tokens
    console.log(`  Token may already exist. Listing tokens...`);
    const listTokensRes = await fetch(
      `${API_BASE}/v1/organizations/${orgName}/databases/ai-sub-prices/auth-tokens`,
      { headers }
    );
    const tokens = (await listTokensRes.json()) as { tokens?: Array<{ id: string; name: string }> };
    console.log(`  Existing tokens: ${JSON.stringify(tokens)}`);
  } else {
    const token = (await tokenRes.json()) as { jwt: string };
    console.log(`  Token created successfully!`);
  }

  // Step 6: Output connection details
  console.log(`\n========================================`);
  console.log(`Database URL: libsql://${dbInfo.Hostname}`);
  console.log(`========================================`);
  console.log(`\nTo get the auth token, run:`);
  console.log(`  turso auth tokens create ai-sub-prices`);
  console.log(`\nOr check the Turso dashboard:`);
  console.log(`  https://app.turso.tech/${orgName}/databases/ai-sub-prices`);
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
