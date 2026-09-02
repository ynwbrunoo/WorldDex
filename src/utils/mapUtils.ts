import type { ContinentKey } from "@/data/continents";
import type { CountryData } from "@/store/types";

// ─────────────────────────────────────────────
// D3 / TopoJSON map utilities
// ─────────────────────────────────────────────

/**
 * Converts a D3/TopoJSON feature ID string to a numeric code.
 * TopoJSON feature IDs are ISO 3166-1 numeric codes stored as strings.
 */
export function featureIdToNumeric(id: string | number | undefined): number {
  if (id === undefined || id === null) return -1;
  const n = parseInt(String(id), 10);
  return isNaN(n) ? -1 : n;
}

// ─────────────────────────────────────────────
// Country lookup helpers
// ─────────────────────────────────────────────

/** Counts countries per continent in an array. */
export function countByContinent(
  countries: CountryData[],
): Record<ContinentKey, number> {
  const result = {
    africa: 0,
    asia: 0,
    europe: 0,
    northAmerica: 0,
    southAmerica: 0,
    oceania: 0,
  } satisfies Record<ContinentKey, number>;

  for (const c of countries) {
    result[c.continent]++;
  }
  return result;
}

/** Filters country list to a given continent. */
export function filterByContinent(
  countries: CountryData[],
  continent: ContinentKey,
): CountryData[] {
  return countries.filter((c) => c.continent === continent);
}

// ─────────────────────────────────────────────
// Progress calculations
// ─────────────────────────────────────────────

export interface ProgressStats {
  totalCountries: number;
  unlockedCount: number;
  percentage: number;
  remaining: number;
  byContinent: Record<
    ContinentKey,
    { total: number; unlocked: number; complete: boolean }
  >;
  completedContinents: ContinentKey[];
  longestStreak: number;
}

/**
 * Computes all progress stats from the game state.
 * Memoize this in React using useMemo.
 */
export function computeProgress(
  allCountries: CountryData[],
  unlockedIds: Set<string>,
  rollHistory: Array<{ isNew: boolean }>,
): ProgressStats {
  const totalCountries = allCountries.length;
  const unlockedCount = unlockedIds.size;
  const percentage =
    totalCountries > 0 ? (unlockedCount / totalCountries) * 100 : 0;
  const remaining = totalCountries - unlockedCount;

  // Per-continent breakdown
  const continents: ContinentKey[] = [
    "africa",
    "asia",
    "europe",
    "northAmerica",
    "southAmerica",
    "oceania",
  ];

  const byContinent = {} as ProgressStats["byContinent"];
  const completedContinents: ContinentKey[] = [];

  for (const cont of continents) {
    const total = allCountries.filter((c) => c.continent === cont).length;
    const unlocked = allCountries.filter(
      (c) => c.continent === cont && unlockedIds.has(c.id),
    ).length;
    const complete = total > 0 && unlocked === total;
    byContinent[cont] = { total, unlocked, complete };
    if (complete) completedContinents.push(cont);
  }

  // Longest streak without duplicates (in roll history, newest-first)
  // We need to process from oldest to newest for streak calculation
  const orderedHistory = [...rollHistory].reverse();
  let longestStreak = 0;
  let currentStreak = 0;

  for (const roll of orderedHistory) {
    if (roll.isNew) {
      currentStreak++;
      if (currentStreak > longestStreak) {
        longestStreak = currentStreak;
      }
    } else {
      currentStreak = 0;
    }
  }

  return {
    totalCountries,
    unlockedCount,
    percentage,
    remaining,
    byContinent,
    completedContinents,
    longestStreak,
  };
}

// ─────────────────────────────────────────────
// Accessible focus trap utility
// ─────────────────────────────────────────────

const FOCUSABLE_SELECTORS = [
  "a[href]",
  "button:not([disabled])",
  "textarea:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ");

/**
 * Returns all focusable elements within a container.
 */
export function getFocusableElements(container: HTMLElement): HTMLElement[] {
  return Array.from(
    container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTORS),
  );
}

/**
 * Traps keyboard focus within a container (for modal dialogs).
 * Call this in a keydown event handler.
 */
export function handleFocusTrap(
  event: KeyboardEvent,
  container: HTMLElement,
): void {
  if (event.key !== "Tab") return;

  const focusable = getFocusableElements(container);
  if (focusable.length === 0) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey) {
    if (document.activeElement === first) {
      event.preventDefault();
      last.focus();
    }
  } else {
    if (document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
