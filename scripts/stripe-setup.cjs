"use strict";
/**
 * Stripe product & price setup script.
 * Run from workspace root: node scripts/stripe-setup.cjs
 */

const Stripe = require("/home/runner/workspace/artifacts/api-server/node_modules/stripe");

const key = process.env.STRIPE_SECRET_KEY;
if (!key || !key.startsWith("sk_")) {
  console.error("ERROR: STRIPE_SECRET_KEY is not set or invalid.");
  process.exit(1);
}

const stripe = new (Stripe.default || Stripe)(key, { apiVersion: "2023-10-16" });

// ── Pricing model ─────────────────────────────────────────────────────────────
const PACKAGES = [
  {
    id: "starter",
    name: "Starter Launch Package",
    description: "Perfect for entrepreneurs launching their first branded mobile app.",
    prices: {
      full:        { amount: 249700, nickname: "Starter – Paid In Full",        envKey: "STRIPE_PRICE_STARTER",           type: "one_time" },
      setup:       { amount:  99700, nickname: "Starter – Down Payment",         envKey: "STRIPE_PRICE_STARTER_SETUP",     type: "one_time" },
      monthly_rec: { amount:  19700, nickname: "Starter – Monthly Installment",  envKey: "STRIPE_PRICE_STARTER_MONTHLY",   type: "recurring", interval: "month" },
    },
  },
  {
    id: "essentials",
    name: "App Launch Essentials",
    description: "Complete app launch package with branding and launch support.",
    prices: {
      full:        { amount: 249700, nickname: "Essentials – Paid In Full",        envKey: "STRIPE_PRICE_ESSENTIALS",           type: "one_time",  existingId: "price_1TnzBEJJdy0crHI8d1FLz9Et" },
      setup:       { amount:  49700, nickname: "Essentials – Down Payment",         envKey: "STRIPE_PRICE_ESSENTIALS_SETUP",     type: "one_time",  existingId: "price_1TnzBLJJdy0crHI8FHNhiOtw" },
      monthly_rec: { amount:  19900, nickname: "Essentials – Monthly Installment",  envKey: "STRIPE_PRICE_ESSENTIALS_MONTHLY",   type: "recurring", interval: "month", existingId: "price_1TnzBIJJdy0crHI86gETElWE" },
    },
  },
  {
    id: "accelerator",
    name: "App Ownership Accelerator",
    description: "The most popular package for founders wanting branding, monetization and growth.",
    prices: {
      full:        { amount: 499700, nickname: "Accelerator – Paid In Full",        envKey: "STRIPE_PRICE_ACCELERATOR",           type: "one_time",  existingId: "price_1TnzBFJJdy0crHI8yCluGftj" },
      setup:       { amount:  99700, nickname: "Accelerator – Down Payment",         envKey: "STRIPE_PRICE_ACCELERATOR_SETUP",     type: "one_time",  existingId: "price_1TnzBMJJdy0crHI8LawdE6HC" },
      monthly_rec: { amount:  39900, nickname: "Accelerator – Monthly Installment",  envKey: "STRIPE_PRICE_ACCELERATOR_MONTHLY",   type: "recurring", interval: "month", existingId: "price_1TnzBJJJdy0crHI8ZCbKcKSd" },
    },
  },
  {
    id: "growth",
    name: "Growth Launch Package",
    description: "Designed for scaling with enhanced branding, ASO and optimization support.",
    prices: {
      full:        { amount: 499700, nickname: "Growth – Paid In Full",        envKey: "STRIPE_PRICE_GROWTH",           type: "one_time" },
      setup:       { amount: 250000, nickname: "Growth – Down Payment",         envKey: "STRIPE_PRICE_GROWTH_SETUP",     type: "one_time" },
      monthly_rec: { amount:  39700, nickname: "Growth – Monthly Installment",  envKey: "STRIPE_PRICE_GROWTH_MONTHLY",   type: "recurring", interval: "month" },
    },
  },
  {
    id: "empire",
    name: "App Empire Package",
    description: "Our premium, done-for-you ownership experience with VIP implementation.",
    prices: {
      full:        { amount: 999700, nickname: "Empire – Paid In Full",        envKey: "STRIPE_PRICE_EMPIRE",           type: "one_time",  existingId: "price_1TnzBGJJdy0crHI8zTHTCEUV" },
      setup:       { amount: 500000, nickname: "Empire – Down Payment",         envKey: "STRIPE_PRICE_EMPIRE_SETUP",     type: "one_time" },
      monthly_rec: { amount:  49700, nickname: "Empire – Monthly Installment",  envKey: "STRIPE_PRICE_EMPIRE_MONTHLY",   type: "recurring", interval: "month", existingId: "price_1TnzBKJJdy0crHI8csCQAO2H" },
    },
  },
];

async function verifyPrice(priceId) {
  try {
    const p = await stripe.prices.retrieve(priceId);
    return p.active ? p : null;
  } catch (_) {
    return null;
  }
}

async function findProductByName(name) {
  let hasMore = true, startingAfter;
  while (hasMore) {
    const opts = { limit: 100, active: true };
    if (startingAfter) opts.starting_after = startingAfter;
    const list = await stripe.products.list(opts);
    const match = list.data.find(p => p.name === name);
    if (match) return match;
    hasMore = list.has_more;
    if (list.data.length) startingAfter = list.data[list.data.length - 1].id;
  }
  return null;
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
    unit_amount: spec.amount,
  };
  if (spec.type === "recurring") {
    params.recurring = { interval: spec.interval };
  }
  const price = await stripe.prices.create(params);
  console.log(`    ✚ Created price : ${price.id}  («${spec.nickname}», $${(spec.amount / 100).toFixed(2)})`);
  return price;
}

async function main() {
  console.log("\n══════════════════════════════════════════════════════════════════");
  console.log(" Stripe Product & Price Setup");
  console.log("══════════════════════════════════════════════════════════════════\n");

  const results = [];

  for (const pkg of PACKAGES) {
    console.log(`\n▶ ${pkg.name}`);

    let product = await findProductByName(pkg.name);
    if (product) {
      console.log(`  ✔ Product exists: ${product.id}`);
    } else {
      product = await createProduct(pkg);
    }

    const priceIds = {};

    for (const [slot, spec] of Object.entries(pkg.prices)) {
      if (spec.existingId) {
        const verified = await verifyPrice(spec.existingId);
        if (verified) {
          console.log(`  ✔ Price (${slot.padEnd(11)}): ${spec.existingId}  («${spec.nickname}»)`);
          priceIds[slot] = spec.existingId;
          continue;
        }
        console.log(`  ✘ Price ${spec.existingId} not found/inactive — creating replacement`);
      }
      const newPrice = await createPrice(product.id, spec);
      priceIds[slot] = newPrice.id;
    }

    results.push({ packageId: pkg.id, packageName: pkg.name, productId: product.id, priceIds });
  }

  // ── Summary ─────────────────────────────────────────────────────────────────
  console.log("\n\n══════════════════════════════════════════════════════════════════");
  console.log(" FINAL IDs");
  console.log("══════════════════════════════════════════════════════════════════\n");

  const envMap = {};
  for (const r of results) {
    const pkgDef = PACKAGES.find(p => p.id === r.packageId);
    console.log(`${r.packageName}`);
    console.log(`  Product: ${r.productId}`);
    for (const [slot, spec] of Object.entries(pkgDef.prices)) {
      const id = r.priceIds[slot];
      console.log(`  ${spec.envKey.padEnd(42)} = ${id}`);
      envMap[spec.envKey] = id;
    }
    console.log();
  }

  console.log("── JSON ──────────────────────────────────────────────────────────");
  console.log(JSON.stringify(envMap, null, 2));
}

main().catch(e => { console.error(e); process.exit(1); });
