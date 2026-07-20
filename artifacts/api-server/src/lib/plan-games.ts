// ── Central plan → game configuration ─────────────────────────────────────────
// Single source of truth for which game templates each purchased plan unlocks.
// Game IDs and names mirror the catalog in app-squad/src/pages/game-selection.tsx.
// The frontend never decides plan access — it fetches the allowed IDs from
// GET /api/enrollment/allowed-games, which reads this file.
//
// Tier rule (from the package copy): Essentials includes the standard
// templates; Accelerator and Empire additionally unlock the premium templates.
// Adjust the lists below to tighten or differentiate tiers.

export type Plan = "essentials" | "accelerator" | "empire";

export const PLANS: Plan[] = ["essentials", "accelerator", "empire"];

// Standard (non-premium) templates
const STANDARD_GAMES = [
  "xtetris",
  "galaxy-attack",
  "crossy-word-search",
  "word-search-puzzle",
  "word-chef",
  "word-connect",
  "crossy-word",
  "hexa-puzzle",
  "unroll-ball",
  "tetris-block",
  "bubble-shooter",
  "match3",
  "mandala-coloring",
  "marble-zuma",
  "brother-squad",
  "head-soccer",
  "basketball-strike",
  "stickman-ping-pong",
];

// Premium templates
const PREMIUM_GAMES = [
  "metal-soldiers",
  "squid-survival",
  "blackjack",
  "bus-simulator",
  "truck-simulator-usa",
  "dental-simulator",
  "flight-pilot",
  "run-forrest",
  "crossy-road",
  "fashion-competition",
  "ear-doctor",
  "bowling-3d",
  "8-ball-pool",
  "foxone",
  "soccer-3d",
  "huge-casino-slots",
  "billionaire-casino",
  "88-fortunes",
  "twerk-race",
  "spider-robot",
  "millionaire-trivia",
  "gangster-crime",
  "farming-simulator",
  "truck-offroad",
  "ninja-archer",
  "death-moto",
  "race-master",
  "sniper-3d",
  "toy-blast",
  "sniper-warrior",
  "real-gangster",
  "limo-parking",
];

export const PLAN_GAMES: Record<Plan, string[]> = {
  essentials: [...STANDARD_GAMES],
  accelerator: [...STANDARD_GAMES, ...PREMIUM_GAMES],
  empire: [...STANDARD_GAMES, ...PREMIUM_GAMES],
};

// Game display names by ID — used to validate the game_type field (which the
// onboarding flow stores by name, not ID) against the purchased plan.
export const GAME_NAME_BY_ID: Record<string, string> = {
  "xtetris": "Xtetris™: Block Puzzle Games",
  "metal-soldiers": "Metal Soldiers",
  "squid-survival": "Squid Survival Player 456",
  "blackjack": "Blackjack",
  "galaxy-attack": "Galaxy Attack: Alien Shooting",
  "crossy-word-search": "Crossy Word Search",
  "bus-simulator": "Bus Simulator: Ultimate",
  "truck-simulator-usa": "Truck Simulator USA - Evolution",
  "dental-simulator": "Dental Simulator",
  "word-search-puzzle": "Word Search Puzzle",
  "word-chef": "Word Chef",
  "word-connect": "Word Connect",
  "crossy-word": "Crossy Word",
  "hexa-puzzle": "Hexa Puzzle",
  "unroll-ball": "Unroll Ball Slide Puzzle",
  "tetris-block": "Tetris Block Puzzle",
  "bubble-shooter": "Bubble Shooter",
  "match3": "Match 3 Candy Crush Style",
  "flight-pilot": "Flight Pilot: 3D Simulator",
  "run-forrest": "Run Forrest Run: Running Games",
  "crossy-road": "Crossy Road",
  "fashion-competition": "Fashion Competition Dress Up",
  "ear-doctor": "Ear Doctor",
  "mandala-coloring": "Mandala Coloring Book",
  "bowling-3d": "3D Bowling",
  "marble-zuma": "Marble Zuma",
  "8-ball-pool": "8 Ball Pool",
  "foxone": "FoxOne Special Missions",
  "soccer-3d": "Soccer Game 3D",
  "huge-casino-slots": "Huge Casino Slots Vegas 777",
  "billionaire-casino": "Billionaire Casino Slots 777",
  "brother-squad": "Brother Squad - Metal Shooter",
  "sniper-warrior": "Sniper Warrior: PvP Sniper",
  "real-gangster": "Real Gangster Crime",
  "limo-parking": "Limo Parking Simulator 3D",
  "head-soccer": "Head Soccer - Star League",
  "basketball-strike": "Basketball Strike",
  "88-fortunes": "88 Fortunes Slots Casino Games",
  "twerk-race": "Twerk Race 3D Running Game",
  "stickman-ping-pong": "Stickman Ping Pong",
  "spider-robot": "Spider Robot Car Transform War",
  "millionaire-trivia": "Millionaire Trivia Game Quiz",
  "gangster-crime": "Gangster Crime City War Games",
  "farming-simulator": "Farming Simulator 20",
  "truck-offroad": "Truck Simulator Offroad 2",
  "ninja-archer": "Ninja Archer Assassin Shooter",
  "death-moto": "Death Moto 3: Fighting Rider",
  "race-master": "Race Master 3D - Car Racing",
  "sniper-3d": "Sniper 3D: Gun Shooting Games",
  "toy-blast": "Toy Blast",
};

/** Allowed game display names for a plan (for validating game_type writes). */
export function allowedGameNamesForPlan(plan: Plan): Set<string> {
  return new Set(PLAN_GAMES[plan].map((id) => GAME_NAME_BY_ID[id]).filter(Boolean));
}

/**
 * Normalize any plan identifier used across the codebase — plan ID, package
 * display name, or planTag — to the canonical plan key. Returns null when the
 * input doesn't map to a known plan.
 */
export function normalizePlan(input: string | null | undefined): Plan | null {
  if (!input) return null;
  const v = input.trim().toLowerCase();
  if (v.includes("essential")) return "essentials";
  if (v.includes("accelerator")) return "accelerator";
  if (v.includes("empire")) return "empire";
  return null;
}

/**
 * Map a Stripe price ID to the plan it belongs to, using the STRIPE_PRICE_*
 * environment configuration (full / monthly / setup variants all count).
 * This is the trusted source: the price actually paid determines the plan.
 */
export function planFromStripePriceId(priceId: string | null | undefined): Plan | null {
  if (!priceId) return null;
  const e = process.env;
  const table: Array<[string | undefined, Plan]> = [
    [e.STRIPE_PRICE_ESSENTIALS, "essentials"],
    [e.STRIPE_PRICE_ESSENTIALS_MONTHLY, "essentials"],
    [e.STRIPE_PRICE_ESSENTIALS_SETUP, "essentials"],
    [e.VITE_STRIPE_PRICE_ESSENTIALS, "essentials"],
    [e.VITE_STRIPE_PRICE_ESSENTIALS_MONTHLY, "essentials"],
    [e.VITE_STRIPE_PRICE_ESSENTIALS_SETUP, "essentials"],
    [e.STRIPE_PRICE_ACCELERATOR, "accelerator"],
    [e.STRIPE_PRICE_ACCELERATOR_MONTHLY, "accelerator"],
    [e.STRIPE_PRICE_ACCELERATOR_SETUP, "accelerator"],
    [e.VITE_STRIPE_PRICE_ACCELERATOR, "accelerator"],
    [e.VITE_STRIPE_PRICE_ACCELERATOR_MONTHLY, "accelerator"],
    [e.VITE_STRIPE_PRICE_ACCELERATOR_SETUP, "accelerator"],
    [e.STRIPE_PRICE_EMPIRE, "empire"],
    [e.STRIPE_PRICE_EMPIRE_MONTHLY, "empire"],
    [e.STRIPE_PRICE_EMPIRE_SETUP, "empire"],
    [e.VITE_STRIPE_PRICE_EMPIRE, "empire"],
    [e.VITE_STRIPE_PRICE_EMPIRE_MONTHLY, "empire"],
    [e.VITE_STRIPE_PRICE_EMPIRE_SETUP, "empire"],
  ];
  for (const [envPrice, plan] of table) {
    if (envPrice && envPrice.trim() === priceId.trim()) return plan;
  }
  return null;
}
