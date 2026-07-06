/**
 * Stripe product & price setup script.
 * Run: node scripts/stripe-setup.mjs
 *
 * Rules:
 *  - Never modifies or deletes existing products/prices.
 *  - Creates only what is missing.
 *  - Logs every Product ID and Price ID at the end.
 */

import Stripe from "../artifacts/api-server/node_modules/stripe/cjs/stripe.cjs.node.js";

const key = process.env.STRIPE_SECRET_KEY;
if (!key || !key.startsWith("sk_")) {
  console.error("ERROR: STRIPE_SECRET_KEY is not set or invalid.");
  process.exit(1);
}

const stripe = new Stripe(key, { apiVersion: "2023-10-16" });

// ── Pricing model ─────────────────────────────────────────────────────────────
// For each package we need:
//   full_price  → one-time, paid-in-full  (used when payment_type="subscription")
//   setup_price → one-time, down-payment  (used when payment_type="monthly")
//   monthly_rec → recurring $X/month      (for reference / future sub billing)
//
// Amounts are in cents.
const PACKAGES = [
  {
    id: "starter",
    name: "Starter Launch Package",
    description: "Perfect for entrepreneurs launching their first branded mobile app.",
    prices: {
      full:       { amount: 249700, nickname: "Starter – Paid In Full",       envKey: "STRIPE_PRICE_STARTER",          type: "one_time" },
      setup:      { amount:  99700, nickname: "Starter – Down Payment",        envKey: "STRIPE_PRICE_STARTER_SETUP",    type: "one_time" },
      monthly_rec:{ amount:  19700, nickname: "Starter – Monthly Installment", envKey: "STRIPE_PRICE_STARTER_MONTHLY",  type: "recurring", interval: "month" },
    },
  },
  {
    id: "essentials",
    name: "App Launch Essentials",
    description: "Complete app launch package with branding and launch support.",
    prices: {
      full:       { amount: 249700, nickname: "Essentials – Paid In Full",       envKey: "STRIPE_PRICE_ESSENTIALS",          type: "one_time",  existingId: "price_1TnzBEJJdy0crHI8d1FLz9Et" },
      setup:      { amount:  49700, nickname: "Essentials – Down Payment",        envKey: "STRIPE_PRICE_ESSENTIALS_SETUP",    type: "one_time",  existingId: "price_1TnzBLJJdy0crHI8FHNhiOtw" },
      monthly_rec:{ amount:  19900, nickname: "Essentials – Monthly Installment", envKey: "STRIPE_PRICE_ESSENTIALS_MONTHLY",  type: "recurring", interval: "month", existingId: "price_1TnzBIJJdy0crHI86gETElWE" },
    },
  },
  {
    id: "accelerator",
    name: "App Ownership Accelerator",
    description: "The most popular package for founders wanting branding, monetization and growth.",
    prices: {
      full:       { amount: 499700, nickname: "Accelerator – Paid In Full",       envKey: "STRIPE_PRICE_ACCELERATOR",          type: "one_time",  existingId: "price_1TnzBFJJdy0crHI8yCluGftj" },
      setup:      { amount:  99700, nickname: "Accelerator – Down Payment",        envKey: "STRIPE_PRICE_ACCELERATOR_SETUP",    type: "one_time",  existingId: "price_1TnzBMJJdy0crHI8LawdE6HC" },
      monthly_rec:{ amount:  39900, nickname: "Accelerator – Monthly Installment", envKey: "STRIPE_PRICE_ACCELERATOR_MONTHLY",  type: "recurring", interval: "month", existingId: "price_1TnzBJJJdy0crHI8ZCbKcKSd" },
    },
  },
  {
    id: "growth",
    name: "Growth Launch Package",
    description: "Designed for scaling with enhanced branding, ASO and optimization support.",
    prices: {
      full:       { amount: 499700, nickname: "Growth – Paid In Full",       envKey: "STRIPE_PRICE_GROWTH",          type: "one_time" },
      setup:      { amount: 250000, nickname: "Growth – Down Payment",        envKey: "STRIPE_PRICE_GROWTH_SETUP",    type: "one_time" },
      monthly_rec:{ amount:  39700, nickname: "Growth – Monthly Installment", envKey: "STRIPE_PRICE_GROWTH_MONTHLY",  type: "recurring", interval: "month" },
    },
  },
  {
    id: "empire",
    name: "App Empire Package",
    description: "Our premium, done-for-you ownership experience with VIP implementation.",
    prices: {
      full:       { amount: 999700, nickname: "Empire – Paid In Full",       envKey: "STRIPE_PRICE_EMPIRE",          type: "one_time",  existingId: "price_1TnzBGJJdy0crHI8zTHTCEUV" },
      setup:      { amount: 500000, nickname: "Empire – Down Payment",        envKey: "STRIPE_PRICE_EMPIRE_SETUP",    type: "one_time" },
      monthly_rec:{ amount:  49700, nickname: "Empire – Monthly Installment", envKey: "STRIPE_PRICE_EMPIRE_MONTHLY",  type: "recurring", interval: "month", existingId: "price_1TnzBKJJdy0crHI8csCQAO2H" },
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
async function verifyPrice(priceId) {
  try {
    const p = await stripe.prices.retrieve(priceId);
    return p.active ? p : null;
  } catch {
    return null;
  }
}

async function findProductByName(name) {
  const list = await stripe.products.list({ limit: 100, active: true });
  return list.data.find(p => p.name === name) ?? null;
}

async function createProduct(pkg) {
  const product = await stripe.products.create({
    name: pkg.name,
    description: pkg.description,
    metadata: { package_id: pkg.id },
  });
  console.log(`  ✚ Created product: ${product.id}  («${product.name}»)`);
  return product;
}

async function createPrice(productId, spec) {
  const params = {
    product: productId,
    currency: "usd",
    nickname: spec.nickname,
    metadata: { env_key: spec.envKey },
  };
  if (spec.type === "recurring") {
    params.unit_amount = spec.amount;
    params.recurring = { interval: spec.interval };
  } else {
    params.unit_amount = spec.amount;
  }
  const price = await stripe.prices.create(params);
  console.log(`    ✚ Created price: ${price.id}  («${spec.nickname}», $${(spec.amount / 100).toFixed(2)})`);
  return price;
}

// ── Main ──────────────────────────────────────────────────────────────────────
const results = []; // { packageId, productId, prices: { full, setup, monthly_rec } }

console.log("\n══════════════════════════════════════════════════════════════════");
console.log(" Stripe Product & Price Setup");
console.log("══════════════════════════════════════════════════════════════════\n");

for (const pkg of PACKAGES) {
  console.log(`\n▶ Package: ${pkg.name}`);

  // 1 — Find or create product
  let product = await findProductByName(pkg.name);
  if (product) {
    console.log(`  ✔ Product exists: ${product.id}`);
  } else {
    product = await createProduct(pkg);
  }

  const priceIds = {};

  // 2 — For each price slot, verify existing or create new
  for (const [slot, spec] of Object.entries(pkg.prices)) {
    if (spec.existingId) {
      const verified = await verifyPrice(spec.existingId);
      if (verified) {
        console.log(`  ✔ Price (${slot}): ${spec.existingId}  («${spec.nickname}»)`);
        priceIds[slot] = spec.existingId;
        continue;
      }
      console.log(`  ✘ Existing price ${spec.existingId} not found — will create replacement`);
    }
    const newPrice = await createPrice(product.id, spec);
    priceIds[slot] = newPrice.id;
  }

  results.push({ packageId: pkg.id, packageName: pkg.name, productId: product.id, priceIds });
}

// ── Summary ───────────────────────────────────────────────────────────────────
console.log("\n\n══════════════════════════════════════════════════════════════════");
console.log(" RESULTS — copy these into your environment secrets");
console.log("══════════════════════════════════════════════════════════════════\n");

const envLines = {};
for (const r of results) {
  console.log(`${r.packageName} (${r.packageId})`);
  console.log(`  Product ID : ${r.productId}`);
  for (const [slot, spec] of Object.entries(PACKAGES.find(p => p.id === r.packageId).prices)) {
    const id = r.priceIds[slot];
    console.log(`  ${spec.envKey.padEnd(40)} = ${id}`);
    envLines[spec.envKey] = id;
  }
  console.log();
}

console.log("\n── JSON (for programmatic use) ───────────────────────────────────");
console.log(JSON.stringify(envLines, null, 2));
