import type { ContinentKey } from "@/data/continents";

// ────────────────────────────────────────────────────────────────────────────
// Country data
// ────────────────────────────────────────────────────────────────────────────

export interface CountryData {
  /** ISO 3166-1 alpha-2, e.g. "PT". Used as primary ID. */
  id: string;
  /** ISO 3166-1 alpha-3, e.g. "PRT". */
  alpha3: string;
  /** ISO 3166-1 numeric code — matches world-atlas TopoJSON feature IDs. */
  numericCode: number;
  continent: ContinentKey;
  /** Estimated total population. */
  population: number;
  /** Estimated annual births. */
  annualBirths: number;
  /**
   * Fraction of estimated world annual births.
   * Sums to 1.0 across all countries.
   * Used for weighted random selection.
   */
  birthProbability: number;
  /** Unicode emoji flag, e.g. "🇵🇹". */
  flag: string;
  /** Year of the data estimate. */
  dataYear: number;
}

// ────────────────────────────────────────────────────────────────────────────
// Achievement definitions
// ────────────────────────────────────────────────────────────────────────────

export type AchievementType =
  | "count" // unlock N countries
  | "percentage" // unlock N% of all countries
  | "continent" // complete 1 continent
  | "continents" // complete N continents
  | "all" // unlock every country
  | "all_achievements" // unlock all other achievements
  | "streak" // N new countries in a row
  | "rolls" // make N total rolls
  | "country_rolls" // roll a specific country N times
  | "group" // specific set of countries
  | "rarity" // unlock N countries of a specific rarity
  | "special"; // custom specific achievements (like home country)

export interface AchievementDefinition {
  id: string;
  type: AchievementType;
  threshold?: number;
  continents?: number; // used with type: 'continents'
  countryIds?: string[]; // used with type: 'group'
  countryId?: string; // used with type: 'country_rolls'
  rarityLabel?: string; // used with type: 'rarity', e.g., 'Lendário'
  /** Namespace key prefix in i18n, e.g. "achievements.firstStep" */
  i18nKey: string;
}

// ────────────────────────────────────────────────────────────────────────────
// Save data (versioned)
// ────────────────────────────────────────────────────────────────────────────

export interface UnlockRecord {
  countryId: string;
  /** ISO 8601 timestamp of first unlock. */
  unlockedAt: string;
  /** Total times this country has appeared in roll history. */
  rollCount: number;
}

export interface RollRecord {
  /** UUID-like unique roll ID. */
  id: string;
  countryId: string;
  /** ISO 8601 timestamp. */
  rolledAt: string;
  /** Whether this roll was the first unlock for this country. */
  isNew: boolean;
}

export interface AchievementRecord {
  id: string;
  /** ISO 8601 timestamp, or null if locked. */
  unlockedAt: string | null;
}

export interface GameSettings {
  /** BCP-47 locale string, e.g. "pt-PT". */
  language: string;
  tutorialCompleted: boolean;
  tutorialDismissed: boolean;
}

/** The versioned save structure stored in localStorage. */
export interface SaveData {
  version: 1;
  /** Map of ISO alpha-2 to unlock record. */
  unlockedCountries: Record<string, UnlockRecord>;
  /** Chronological roll history, newest first. Capped at 2000 entries. */
  rollHistory: RollRecord[];
  /** Total roll count per country (including duplicates). */
  rollCounts: Record<string, number>;
  /** Achievement states keyed by achievement ID. */
  achievements: Record<string, AchievementRecord>;
  /** Total number of rolls made. */
  totalRolls: number;
  /** Number of consecutive duplicates since the last new country. */
  pityCounter: number;
  /** Player's current coin balance. */
  coins: number;
  /** Whether the user has seen the completion modal. */
  hasSeenCompletion?: boolean;
  /** Purchased upgrade levels, keyed by upgrade ID. 0 / missing = not bought. */
  shopUpgrades: Record<string, number>;
  settings: GameSettings;
}

// ────────────────────────────────────────────────────────────────────────────
// Game state (in-memory, not persisted)
// ────────────────────────────────────────────────────────────────────────────

export type ActivePanel =
  "progress" | "collection" | "history" | "achievements" | "shop" | "settings";

export interface ToastItem {
  id: string;
  message: string;
  type: "achievement" | "info" | "success" | "error";
  achievementId?: string;
}

export interface GameState {
  save: SaveData;
  /** Country being shown in the detail panel. */
  selectedCountryId: string | null;
  /** The most recently rolled country (for map highlight and result modal). */
  lastRolledCountryId: string | null;
  activePanel: ActivePanel;
  showRollResult: boolean;
  showTutorial: boolean;
  showAboutData: boolean;
  showPrivacy: boolean;
  showReset: boolean;
  showImportExport: boolean;
  /** Whether the shop overlay is visible. */
  showShop: boolean;
  /** Whether the all-countries-complete celebration overlay is visible. */
  showCompletion: boolean;
  toasts: ToastItem[];
}

// ────────────────────────────────────────────────────────────────────────────
// Actions
// ────────────────────────────────────────────────────────────────────────────

export type GameAction =
  | {
      type: "ROLL";
      payload: { countryId: string; isNew: boolean; rollId: string };
    }
  | { type: "SELECT_COUNTRY"; payload: string | null }
  | { type: "SET_PANEL"; payload: ActivePanel }
  | { type: "CLOSE_ROLL_RESULT" }
  | { type: "UNLOCK_ACHIEVEMENT"; payload: string }
  | { type: "COMPLETE_TUTORIAL" }
  | { type: "DISMISS_TUTORIAL" }
  | { type: "SHOW_TUTORIAL" }
  | { type: "TOGGLE_ABOUT_DATA" }
  | { type: "TOGGLE_PRIVACY" }
  | { type: "TOGGLE_RESET" }
  | { type: "TOGGLE_IMPORT_EXPORT" }
  | { type: "RESET_PROGRESS" }
  | { type: "IMPORT_SAVE"; payload: SaveData }
  | { type: "CLEAR_HISTORY" }
  | { type: "SET_LANGUAGE"; payload: string }
  | { type: "ADD_TOAST"; payload: ToastItem }
  | { type: "REMOVE_TOAST"; payload: string }
  // ── Shop ──────────────────────────────────
  | { type: "TOGGLE_SHOP" }
  | { type: "SHOW_COMPLETION" }
  | { type: "DISMISS_COMPLETION" }
  | { type: "ADD_COINS"; payload: number }
  | {
      type: "ANTI_CHEAT_CORRECT";
      payload: { maxCoins: number; tampered: boolean };
    }
  | { type: "BUY_COUNTRY"; payload: { countryId: string; price: number } }
  | { type: "BUY_UPGRADE"; payload: { upgradeId: string; price: number } };
