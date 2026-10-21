import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL("../" + path, import.meta.url), "utf8");
const store = read("src/lib/platform/store.ts");
const books = read("src/lib/supabase/books.ts");
const currencyTests = read("supabase/tests/currency_wallet_behavior.test.sql");
const admin = read("src/routes/admin.tsx");

// Active customer-facing financial operations must use USD-only entry points.
assert.match(store, /buy_investment_plan_usd/);
assert.match(store, /const ledgerCurrency = "USD"/);
assert.match(store, /\["BITCOIN", "ETHEREUM"\]/);
assert.doesNotMatch(store, /rpc\(["']buy_investment_plan["']/);
assert.doesNotMatch(store, /rpc\(["']admin_adjust_bdx_balance["']/);

// Existing records retain their recorded currency when read; this is display
// compatibility only and must not create a new BDX-denominated operation.
assert.match(books, /currency: p\.currency === "BDX" \? "BDX" : "USD"/);
assert.match(currencyTests, /transaction ledger blocks new non-USD accounting writes/);
assert.match(currencyTests, /investment ledger blocks new non-USD accounting writes/);
assert.match(currencyTests, /new non-USD transaction write is rejected/);
assert.match(currencyTests, /new non-USD investment write is rejected/);

// Admin screens may inspect historical records, but live user searches must not
// use BDX-specific balance mutation or investment purchasing RPCs.
assert.doesNotMatch(admin, /rpc\(["']admin_adjust_bdx_balance["']/);
assert.doesNotMatch(admin, /rpc\(["']buy_investment_plan["']/);

console.log("USD-only investment contract checks passed.");
