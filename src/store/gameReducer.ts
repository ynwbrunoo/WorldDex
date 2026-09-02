import type { GameState, GameAction, SaveData } from "./types";
import { createInitialSave } from "./storage";
import { getDuplicateCoins } from "@/utils/shopEconomy";
import { COUNTRY_MAP } from "@/data/countries";

// ─────────────────────────────────────────────
// Initial state
// ─────────────────────────────────────────────

export function createInitialGameState(save: SaveData): GameState {
  const showTutorial =
    !save.settings.tutorialCompleted && !save.settings.tutorialDismissed;

  return {
    save,
    selectedCountryId: null,
    lastRolledCountryId: null,
    activePanel: "progress",
    showRollResult: false,
    showTutorial,
    showAboutData: false,
    showPrivacy: false,
    showReset: false,
    showImportExport: false,
    showShop: false,
    showCompletion: false,
    toasts: [],
  };
}

// ─────────────────────────────────────────────
// Reducer
// ─────────────────────────────────────────────

/**
 * Core state reducer for the WorldDex game.
 * Manages unlocks, rolls, coins, pity system, and shop upgrades.
 *
 * @param state - Current game state
 * @param action - Dispatched action to mutate state
 * @returns The new game state
 */
export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    // ── Rolling ──────────────────────────────
    case "ROLL": {
      const { countryId, isNew, rollId } = action.payload;
      const now = new Date().toISOString();

      const currentCount = (state.save.rollCounts[countryId] ?? 0) + 1;

      const updatedRollCounts = {
        ...state.save.rollCounts,
        [countryId]: currentCount,
      };

      const newRollRecord = {
        id: rollId,
        countryId,
        rolledAt: now,
        isNew,
      };

      // Newest first, capped at 2000
      const updatedHistory = [newRollRecord, ...state.save.rollHistory].slice(
        0,
        2000,
      );

      const updatedUnlocked = { ...state.save.unlockedCountries };
      if (isNew) {
        updatedUnlocked[countryId] = {
          countryId,
          unlockedAt: now,
          rollCount: currentCount,
        };
      } else if (updatedUnlocked[countryId]) {
        updatedUnlocked[countryId] = {
          ...updatedUnlocked[countryId],
          rollCount: currentCount,
        };
      }

      // Award coins for duplicate rolls
      let coinsEarned = 0;
      if (!isNew) {
        const country = COUNTRY_MAP.get(countryId);
        if (country) {
          const coinMultiplierLevel =
            state.save.shopUpgrades["coin_multiplier"] ?? 0;
          coinsEarned = getDuplicateCoins(
            country.birthProbability,
            coinMultiplierLevel,
          );
        }
      }

      return {
        ...state,
        save: {
          ...state.save,
          totalRolls: state.save.totalRolls + 1,
          pityCounter: isNew ? 0 : state.save.pityCounter + 1,
          rollHistory: updatedHistory,
          rollCounts: updatedRollCounts,
          unlockedCountries: updatedUnlocked,
          coins: state.save.coins + coinsEarned,
        },
        lastRolledCountryId: countryId,
        showRollResult: true,
      };
    }

    // ── Navigation ───────────────────────────
    case "SELECT_COUNTRY":
      return { ...state, selectedCountryId: action.payload };

    case "SET_PANEL":
      return { ...state, activePanel: action.payload };

    // ── Roll result ──────────────────────────
    case "CLOSE_ROLL_RESULT":
      return { ...state, showRollResult: false };

    // ── Achievements ─────────────────────────
    case "UNLOCK_ACHIEVEMENT": {
      const id = action.payload;
      // Prevent re-unlocking
      if (state.save.achievements[id]?.unlockedAt) return state;
      return {
        ...state,
        save: {
          ...state.save,
          achievements: {
            ...state.save.achievements,
            [id]: { id, unlockedAt: new Date().toISOString() },
          },
        },
      };
    }

    // ── Tutorial ─────────────────────────────
    case "COMPLETE_TUTORIAL":
      return {
        ...state,
        showTutorial: false,
        save: {
          ...state.save,
          settings: { ...state.save.settings, tutorialCompleted: true },
        },
      };

    case "DISMISS_TUTORIAL":
      return {
        ...state,
        showTutorial: false,
        save: {
          ...state.save,
          settings: { ...state.save.settings, tutorialDismissed: true },
        },
      };

    case "SHOW_TUTORIAL":
      return { ...state, showTutorial: true };

    // ── Modals ───────────────────────────────
    case "TOGGLE_ABOUT_DATA":
      return { ...state, showAboutData: !state.showAboutData };

    case "TOGGLE_PRIVACY":
      return { ...state, showPrivacy: !state.showPrivacy };

    case "TOGGLE_RESET":
      return { ...state, showReset: !state.showReset };

    case "TOGGLE_IMPORT_EXPORT":
      return { ...state, showImportExport: !state.showImportExport };

    // ── Data management ──────────────────────
    case "RESET_PROGRESS": {
      const freshSave = createInitialSave();
      freshSave.settings.language = state.save.settings.language; // Preserve language
      return {
        ...state,
        save: freshSave,
        selectedCountryId: null,
        lastRolledCountryId: null,
        showRollResult: false,
        showReset: false,
        showTutorial: true,
      };
    }

    case "IMPORT_SAVE":
      return {
        ...state,
        save: action.payload,
        selectedCountryId: null,
        lastRolledCountryId: null,
        showRollResult: false,
        showImportExport: false,
      };

    case "CLEAR_HISTORY":
      return {
        ...state,
        save: { ...state.save, rollHistory: [] },
      };

    // ── Settings ─────────────────────────────
    case "SET_LANGUAGE":
      return {
        ...state,
        save: {
          ...state.save,
          settings: { ...state.save.settings, language: action.payload },
        },
      };

    // ── Toasts ───────────────────────────────
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [
          ...state.toasts.filter((t) => t.id !== action.payload.id),
          action.payload,
        ],
      };

    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter((t) => t.id !== action.payload),
      };

    // ── Shop ─────────────────────────────────
    case "TOGGLE_SHOP":
      return { ...state, showShop: !state.showShop };

    case "SHOW_COMPLETION":
      return { ...state, showCompletion: true };

    case "DISMISS_COMPLETION":
      return { ...state, showCompletion: false };

    case "ADD_COINS":
      return {
        ...state,
        save: { ...state.save, coins: state.save.coins + action.payload },
      };

    case "ANTI_CHEAT_CORRECT":
      return {
        ...state,
        save: {
          ...state.save,
          coins: action.payload.maxCoins,
          // If obvious cheating, we wipe the upgrades as a penalty
          shopUpgrades: action.payload.tampered ? {} : state.save.shopUpgrades,
        },
      };

    case "BUY_COUNTRY": {
      const { countryId, price } = action.payload;
      const now = new Date().toISOString();
      const currentCount = (state.save.rollCounts[countryId] ?? 0) + 1;

      return {
        ...state,
        save: {
          ...state.save,
          coins: state.save.coins - price,
          rollCounts: { ...state.save.rollCounts, [countryId]: currentCount },
          unlockedCountries: {
            ...state.save.unlockedCountries,
            [countryId]: {
              countryId,
              unlockedAt: now,
              rollCount: currentCount,
            },
          },
          rollHistory: [
            {
              id: `shop-${countryId}-${now}`,
              countryId,
              rolledAt: now,
              isNew: true,
            },
            ...state.save.rollHistory,
          ].slice(0, 2000),
        },
        lastRolledCountryId: countryId,
        showRollResult: true,
      };
    }

    case "BUY_UPGRADE": {
      const { upgradeId, price } = action.payload;
      const currentLevel = state.save.shopUpgrades[upgradeId] ?? 0;
      return {
        ...state,
        save: {
          ...state.save,
          coins: state.save.coins - price,
          shopUpgrades: {
            ...state.save.shopUpgrades,
            [upgradeId]: currentLevel + 1,
          },
        },
      };
    }

    default:
      return state;
  }
}
