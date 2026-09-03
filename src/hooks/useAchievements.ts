import { useEffect, useRef } from "react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { COUNTRIES } from "@/data/countries";
import type { GameState, GameAction } from "@/store/types";
import type { ContinentKey } from "@/data/continents";
import { getCountryRarity } from "@/utils/rarity";

// ─────────────────────────────────────────────
// Achievement checking
// ─────────────────────────────────────────────

/**
 * Checks which achievements should fire given the current game state,
 * and dispatches UNLOCK_ACHIEVEMENT for each newly earned one.
 *
 * This hook is intentionally side-effect-free in its logic —
 * it only dispatches when an achievement transitions from locked → unlocked.
 */
/**
 * useAchievements — Game engine hook that evaluates achievement conditions
 * on every render and dispatches unlock actions when conditions are met.
 *
 * Tracks multiple conditions: total rolls, specific country unlocks,
 * consecutive streaks, continent completion, and custom groups (e.g. BRICS).
 *
 * @param state - The current game state.
 * @param dispatch - Dispatch function to trigger UNLOCK_ACHIEVEMENT.
 * @param unlockedCount - Total number of unique countries unlocked.
 * @param completedContinents - Array of continent IDs that are 100% complete.
 * @param longestStreak - The player's longest streak without duplicates.
 */
export function useAchievements(
  state: GameState,
  dispatch: React.Dispatch<GameAction>,
  unlockedCount: number,
  completedContinents: ContinentKey[],
  longestStreak: number,
  userCountryId?: string | null,
): void {
  const totalCountries = COUNTRIES.length;

  // Use a ref to avoid re-running checks when unrelated state changes
  const prevUnlockedCount = useRef<number>(-1);
  const prevTotalRolls = useRef<number>(-1);
  const prevCompletedContinents = useRef<ContinentKey[]>([]);
  const prevLongestStreak = useRef<number>(0);

  useEffect(() => {
    const {
      save: { achievements, totalRolls },
    } = state;

    const isAlreadyUnlocked = (id: string): boolean =>
      !!achievements[id]?.unlockedAt;

    const tryUnlock = (id: string): void => {
      if (!isAlreadyUnlocked(id)) {
        dispatch({ type: "UNLOCK_ACHIEVEMENT", payload: id });
        dispatch({
          type: "ADD_TOAST",
          payload: {
            id: `achievement-${id}`,
            message: `achievements.${id}.name`,
            type: "achievement",
            achievementId: id,
          },
        });
      }
    };

    for (const achievement of ACHIEVEMENTS) {
      if (isAlreadyUnlocked(achievement.id)) continue;

      switch (achievement.type) {
        case "count":
          if (
            achievement.threshold !== undefined &&
            unlockedCount >= achievement.threshold
          ) {
            tryUnlock(achievement.id);
          }
          break;

        case "percentage": {
          const percentage = (unlockedCount / totalCountries) * 100;
          if (
            achievement.threshold !== undefined &&
            percentage >= achievement.threshold
          ) {
            tryUnlock(achievement.id);
          }
          break;
        }

        case "continent":
          if (completedContinents.length >= 1) {
            tryUnlock(achievement.id);
          }
          break;

        case "continents":
          if (
            achievement.continents !== undefined &&
            completedContinents.length >= achievement.continents
          ) {
            tryUnlock(achievement.id);
          }
          break;

        case "all":
          if (unlockedCount >= totalCountries && totalCountries > 0) {
            tryUnlock(achievement.id);
          }
          break;

        case "streak":
          if (
            achievement.threshold !== undefined &&
            longestStreak >= achievement.threshold
          ) {
            tryUnlock(achievement.id);
          }
          break;

        case "rolls":
          if (
            achievement.threshold !== undefined &&
            totalRolls >= achievement.threshold
          ) {
            tryUnlock(achievement.id);
          }
          break;

        case "country_rolls":
          if (achievement.countryId && achievement.threshold !== undefined) {
            const currentRolls =
              state.save.rollCounts[achievement.countryId] || 0;
            if (currentRolls >= achievement.threshold) {
              tryUnlock(achievement.id);
            }
          }
          break;

        case "rarity":
          if (achievement.rarityLabel && achievement.threshold !== undefined) {
            let matchCount = 0;
            for (const id of Object.keys(state.save.unlockedCountries)) {
              const country = COUNTRIES.find((c) => c.id === id);
              if (
                country &&
                getCountryRarity(country.birthProbability).label ===
                  achievement.rarityLabel
              ) {
                matchCount++;
              }
            }
            if (matchCount >= achievement.threshold) {
              tryUnlock(achievement.id);
            }
          }
          break;

        case "group":
          if (achievement.countryIds) {
            const hasAll = achievement.countryIds.every(
              (id) => !!state.save.unlockedCountries[id],
            );
            if (hasAll) {
              tryUnlock(achievement.id);
            }
          }
          break;

        case "special":
          if (achievement.id === "home_sweet_home" && userCountryId && state.save.unlockedCountries[userCountryId]) {
            tryUnlock(achievement.id);
          }
          break;

        case "all_achievements": {
          const totalOtherAchievements = ACHIEVEMENTS.length - 1;
          const unlockedOtherAchievements = Object.keys(state.save.achievements).filter(id => id !== achievement.id).length;
          if (unlockedOtherAchievements >= totalOtherAchievements) {
            tryUnlock(achievement.id);
          }
          break;
        }
      }
    }

    prevUnlockedCount.current = unlockedCount;
    prevTotalRolls.current = totalRolls;
    prevCompletedContinents.current = completedContinents;
    prevLongestStreak.current = longestStreak;
  }, [
    unlockedCount,
    completedContinents,
    longestStreak,
    userCountryId,
    state,
    dispatch,
    totalCountries,
  ]);
}

// ─────────────────────────────────────────────
// Achievement progress helpers
// ─────────────────────────────────────────────

/**
 * Returns the current progress toward an achievement.
 * E.g., for count achievements: { current: 42, total: 50 }
 */
export function getAchievementProgress(
  achievementId: string,
  unlockedCount: number,
  totalCountries: number,
  totalRolls: number,
  completedContinents: number,
  longestStreak: number,
  unlockedCountries: Record<string, unknown>,
  rollCounts: Record<string, number>,
  achievements: Record<string, any>,
): { current: number; total: number } | null {
  const def = ACHIEVEMENTS.find((a) => a.id === achievementId);
  if (!def) return null;

  switch (def.type) {
    case "count":
      return { current: unlockedCount, total: def.threshold ?? 0 };

    case "percentage": {
      const pct = Math.round((unlockedCount / totalCountries) * 100);
      return { current: pct, total: def.threshold ?? 100 };
    }

    case "continent":
      return { current: completedContinents, total: 1 };

    case "continents":
      return { current: completedContinents, total: def.continents ?? 6 };

    case "all":
      return { current: unlockedCount, total: totalCountries };
      
    case "all_achievements": {
      const totalOtherAchievements = ACHIEVEMENTS.length - 1;
      const unlockedOtherAchievements = Object.keys(achievements).filter(id => id !== achievementId).length;
      return { current: unlockedOtherAchievements, total: totalOtherAchievements };
    }

    case "streak":
      return { current: longestStreak, total: def.threshold ?? 5 };

    case "rolls":
      return { current: totalRolls, total: def.threshold ?? 100 };

    case "country_rolls": {
      if (!def.countryId) return null;
      const current = rollCounts[def.countryId] || 0;
      return { current, total: def.threshold ?? 1 };
    }

    case "rarity": {
      let matchCount = 0;
      for (const id of Object.keys(unlockedCountries)) {
        const country = COUNTRIES.find((c) => c.id === id);
        if (
          country &&
          getCountryRarity(country.birthProbability).label === def.rarityLabel
        ) {
          matchCount++;
        }
      }
      return { current: matchCount, total: def.threshold ?? 0 };
    }

    case "group":
      if (!def.countryIds) return null;
      return {
        current: def.countryIds.filter((id) => !!unlockedCountries[id]).length,
        total: def.countryIds.length,
      };

    case "special":
      return null;
  }
}
