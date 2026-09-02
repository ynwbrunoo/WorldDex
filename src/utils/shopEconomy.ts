// ────────────────────────────────────────────────────────────────────────────
// Shop economy utilities
// ────────────────────────────────────────────────────────────────────────────
//
// Pricing formulas based on birth probability:
//   Coins earned from duplicate = max(1, Math.round(BASE x (1/prob)^0.4))
//   Country buy price           = max(5, Math.round(BASE_PRICE x (1/prob)^0.5))
//   BASE = 2, BASE_PRICE = 10

const BASE = 2;
const BASE_PRICE = 10;

// ─────────────────────────────────────────────
// Upgrade definitions
// ─────────────────────────────────────────────

export interface ShopUpgrade {
  id: string;
  /** Namespaced i18n key, e.g. 'shop.upgrades.autoclicker'. */
  i18nKey: string;
  /** Base price in coins at level 0 → 1. */
  price: number;
  /** Maximum purchasable level. 1 = one-time purchase, >1 = stackable. */
  maxLevel: number;
  // Effect is handled in game logic
}

export const SHOP_UPGRADES: ShopUpgrade[] = [
  {
    id: "autoclicker",
    i18nKey: "shop.upgrades.autoclicker",
    price: 500,
    maxLevel: 1,
  },
  {
    id: "coin_multiplier",
    i18nKey: "shop.upgrades.coinMultiplier",
    price: 200,
    maxLevel: 3,
  },
  {
    id: "luck_boost",
    i18nKey: "shop.upgrades.luckBoost",
    price: 300,
    maxLevel: 3,
  },
  {
    id: "pity_reducer",
    i18nKey: "shop.upgrades.pityReducer",
    price: 400,
    maxLevel: 1,
  },
];

// ─────────────────────────────────────────────
// Economy functions
// ─────────────────────────────────────────────

/**
 * Returns the number of coins awarded when a player rolls a duplicate country.
 *
 * Rarer countries (lower `probability`) award more coins. Each level of the
 * `coin_multiplier` upgrade adds +1 to the base multiplier (i.e. level 1 -> x2,
 * level 2 -> x3, level 3 -> x4).
 *
 * Formula: `max(1, round(BASE x (1/prob)^0.4)) x (1 + coinMultiplierLevel)`
 *
 * @param probability         The country's `birthProbability` (0 < prob <= 1).
 * @param coinMultiplierLevel Current level of the `coin_multiplier` upgrade (0-3).
 */
export function getDuplicateCoins(
  probability: number,
  coinMultiplierLevel: number,
): number {
  const base = Math.max(1, Math.round(BASE * Math.pow(1 / probability, 0.4)));
  const multiplier = 1 + coinMultiplierLevel;
  return base * multiplier;
}

/**
 * Returns the coin cost to directly buy (unlock) a country from the shop.
 *
 * Rarer countries cost more. The formula mirrors `getDuplicateCoins` but uses
 * a steeper exponent (0.5) and higher base price so shop-buying is never
 * strictly better than grinding rolls.
 *
 * Formula: `max(5, round(BASE_PRICE x (1/prob)^0.5))`
 *
 * @param probability The country's `birthProbability` (0 < prob <= 1).
 */
export function getCountryPrice(probability: number): number {
  return Math.max(5, Math.round(BASE_PRICE * Math.pow(1 / probability, 0.5)));
}

/**
 * Returns the coin cost to purchase the next level of an upgrade.
 *
 * Each successive level costs 1.5x the previous level's price (compound),
 * rounded to the nearest whole number.
 *
 * Formula: `round(upgrade.price x 1.5^currentLevel)`
 *
 * @param upgrade      The upgrade definition from `SHOP_UPGRADES`.
 * @param currentLevel The player's current level for this upgrade (0 = not bought).
 */
export function getUpgradeCurrentPrice(
  upgrade: ShopUpgrade,
  currentLevel: number,
): number {
  return Math.round(upgrade.price * Math.pow(1.5, currentLevel));
}
