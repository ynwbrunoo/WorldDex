import { useReducer, useEffect, useMemo, useCallback, useRef } from "react";
import { useTranslation } from "react-i18next";
import { gameReducer, createInitialGameState } from "@/store/gameReducer";
import { loadSave, persistSave } from "@/store/storage";
import { COUNTRIES } from "@/data/countries";
import { buildCdf, rollCountry, generateRollId } from "@/utils/weightedRandom";
import { computeProgress } from "@/utils/mapUtils";
import type { GameState, GameAction } from "@/store/types";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────

export interface UseGameStateReturn {
  state: GameState;
  dispatch: React.Dispatch<GameAction>;
  progress: ReturnType<typeof computeProgress>;
  unlockedIds: Set<string>;
  pityThreshold: number;
  generateRollResult: () => (typeof COUNTRIES)[0];
  roll: (country: (typeof COUNTRIES)[0], userCountryId?: string | null) => void;
  selectCountry: (id: string | null) => void;
}

// ─────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────

/**
 * Core game state hook.
 * Manages the reducer, localStorage persistence, and derived state.
 */
export function useGameState(): UseGameStateReturn {
  const { i18n } = useTranslation();

  // Load persisted save on first render
  const {
    data: initialSave,
    wasCorrupted,
    isFresh,
  } = useMemo(() => {
    const res = loadSave();
    // If it's a fresh save, default to the language i18next detected
    if (res.isFresh && i18n.language) {
      res.data.settings.language = i18n.language;
    }
    return res;
  }, [i18n.language]);

  const [state, dispatch] = useReducer(
    gameReducer,
    initialSave,
    createInitialGameState,
  );

  // Anti-cheat on mount
  useEffect(() => {
    import("@/utils/antiCheat").then(({ validateEconomy }) => {
      const { maxCoins, tampered } = validateEconomy(state.save, COUNTRIES);

      if (tampered || state.save.coins > maxCoins) {
        console.warn(
          `[Anti-Cheat] Correção de economia necessária. Máx permitido: ${maxCoins}`,
        );
        dispatch({
          type: "ANTI_CHEAT_CORRECT",
          payload: { maxCoins, tampered },
        });
        dispatch({
          type: "ADD_TOAST",
          payload: {
            id: "cheat-detected",
            message: i18n.t(
              "progress.antiCheat",
              "Anomalia de saldo detetada. Economia corrigida.",
            ),
            type: "error",
          },
        });
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  // Sync i18n language from save
  const savedLanguage = state.save.settings.language;
  useEffect(() => {
    if (savedLanguage && i18n.language !== savedLanguage) {
      void i18n.changeLanguage(savedLanguage);
    }
  }, [savedLanguage, i18n]);

  // Show corrupted-data toast once on mount
  const corruptionReported = useRef(false);
  useEffect(() => {
    if (wasCorrupted && !corruptionReported.current) {
      corruptionReported.current = true;
      if (isFresh) {
        dispatch({
          type: "ADD_TOAST",
          payload: {
            id: "data-corrupted",
            message: "errors.dataCorrupt",
            type: "error",
          },
        });
      }
    }
  }, [wasCorrupted, isFresh]);

  // Persist to localStorage whenever save changes
  const prevSaveRef = useRef(state.save);
  useEffect(() => {
    if (state.save !== prevSaveRef.current) {
      prevSaveRef.current = state.save;
      persistSave(state.save);
    }
  }, [state.save]);

  // Derived: set of unlocked country IDs
  const unlockedIds = useMemo(
    () => new Set(Object.keys(state.save.unlockedCountries)),
    [state.save.unlockedCountries],
  );

  // Pre-built CDF for weighted random selection (affected by luck_boost)
  const cdf = useMemo(() => {
    const luckLevel = state.save.shopUpgrades["luck_boost"] ?? 0;
    if (luckLevel === 0) return buildCdf(COUNTRIES);

    // Decrease the probability of common countries to artificially boost rare ones
    const modifiedCountries = COUNTRIES.map((c) => {
      let mod = c.birthProbability;
      if (mod > 0.01) {
        // Reduce common countries probability by up to 30% per luck level
        mod = mod * (1 - 0.3 * luckLevel);
      }
      return { ...c, birthProbability: mod };
    });
    return buildCdf(modifiedCountries);
  }, [state.save.shopUpgrades]);

  // Derived: all progress statistics
  const progress = useMemo(
    () => computeProgress(COUNTRIES, unlockedIds, state.save.rollHistory),
    [unlockedIds, state.save.rollHistory],
  );

  const pityThreshold = useMemo(() => {
    const unlocked = unlockedIds.size;
    let base = 50;
    if (unlocked > 190) base = 15;
    else if (unlocked > 150) base = 20;
    else if (unlocked > 100) base = 30;
    else if (unlocked > 50) base = 40;

    const pityReducerLevel = state.save.shopUpgrades["pity_reducer"] ?? 0;
    if (pityReducerLevel > 0) {
      base = Math.max(5, Math.floor(base * 0.75));
    }
    return base;
  }, [unlockedIds.size, state.save.shopUpgrades]);

  const generateRollResult = useCallback(() => {
    const unlocked = unlockedIds.size;
    let country;
    if (
      state.save.pityCounter >= pityThreshold &&
      unlocked < COUNTRIES.length
    ) {
      const lockedCountries = COUNTRIES.filter((c) => !unlockedIds.has(c.id));
      country =
        lockedCountries[Math.floor(Math.random() * lockedCountries.length)];
    } else {
      country = rollCountry(cdf);
    }
    return country;
  }, [unlockedIds, state.save.pityCounter, pityThreshold, cdf]);

  // Roll action
  const roll = useCallback(
    (country: (typeof COUNTRIES)[0]) => {
      const isNew = !unlockedIds.has(country.id);

      dispatch({
        type: "ROLL",
        payload: {
          countryId: country.id,
          isNew,
          rollId: generateRollId(),
        },
      });

    },
    [unlockedIds, dispatch, state.save.achievements],
  );

  const selectCountry = useCallback((id: string | null) => {
    dispatch({ type: "SELECT_COUNTRY", payload: id });
  }, []);

  return {
    state,
    dispatch,
    progress,
    unlockedIds,
    pityThreshold,
    generateRollResult,
    roll,
    selectCountry,
  };
}
