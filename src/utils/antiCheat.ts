import { SaveData, CountryData } from "@/store/types";
import {
  getUpgradeCurrentPrice,
  SHOP_UPGRADES,
  getDuplicateCoins,
} from "@/utils/shopEconomy";

/**
 * Validates the user's save data integrity (coins, roll counts, total rolls).
 * Returns the maximum possible coins they could have right now, and true if obvious tampering was found.
 */
export function validateEconomy(
  save: SaveData,
  countries: CountryData[],
): { maxCoins: number; tampered: boolean } {
  let totalEarned = 0;
  let totalCalculatedRolls = 0;
  let tampered = false;

  for (const countryId of Object.keys(save.rollCounts)) {
    const count = save.rollCounts[countryId];
    if (typeof count !== "number" || count < 0) {
      tampered = true;
      continue;
    }

    totalCalculatedRolls += count;

    if (count > 1) {
      const country = countries.find((c) => c.id === countryId);
      if (country) {
        // Assume maximum possible multiplier level for the sake of benefit-of-doubt
        const multiplierLevel = save.shopUpgrades["coin_multiplier"] ?? 0;
        const maxDuplicateCoins = getDuplicateCoins(
          country.birthProbability,
          multiplierLevel,
        );

        totalEarned += maxDuplicateCoins * (count - 1);
      }
    }
  }

  // Check if roll counts exceed total rolls (impossible without editing save)
  if (totalCalculatedRolls > save.totalRolls + 5) {
    tampered = true;
  }

  let totalSpentOnUpgrades = 0;
  for (const upgradeId of Object.keys(save.shopUpgrades)) {
    const level = save.shopUpgrades[upgradeId];
    if (typeof level !== "number" || level < 0 || level > 50) {
      tampered = true;
      continue;
    }

    const upgradeDef = SHOP_UPGRADES.find((u) => u.id === upgradeId);
    if (upgradeDef) {
      for (let l = 0; l < level; l++) {
        totalSpentOnUpgrades += getUpgradeCurrentPrice(upgradeDef, l);
      }
    }
  }

  // Allow a small buffer of 500 coins for rounding differences or initial gifts
  const maxPossibleCoins = totalEarned - totalSpentOnUpgrades + 500;

  if (save.coins > Math.max(0, maxPossibleCoins) + 100) {
    tampered = true;
  }

  return { maxCoins: Math.max(0, maxPossibleCoins), tampered };
}
