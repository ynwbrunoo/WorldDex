import React, {
  useCallback,
  useMemo,
  useState,
  useEffect,
  useRef,
} from "react";
import { useTranslation } from "react-i18next";
import {
  Map,
  List,
  Clock,
  Trophy,
  Settings,
  Store,
  Maximize2,
  Minimize2,
} from "lucide-react";

// Core
import { useGameState } from "@/hooks/useGameState";
import { useAchievements } from "@/hooks/useAchievements";
import { useUserCountry } from "@/hooks/useUserCountry";

import { COUNTRIES } from "@/data/countries";
import { getCountryRarity } from "@/utils/rarity";
import { formatCompactNumber, formatBirthChance } from "@/utils/formatting";

// Components
import { Header } from "@/components/Header";
import { WorldMap } from "@/components/Map/WorldMap";
import { RollButton } from "@/components/Roll/RollButton";
import { PityMeter } from "@/components/Roll/PityMeter";
import { RollResultModal } from "@/components/Roll/RollResultModal";
import { CountryDetailPanel } from "@/components/CountryDetail/CountryDetailPanel";
import { ProgressPanel } from "@/components/Progress/ProgressPanel";
import { UnlockedList } from "@/components/Collection/UnlockedList";
import { Flag } from "@/components/ui/Flag";
import { RollHistory } from "@/components/History/RollHistory";
import { AchievementPanel } from "@/components/Achievements/AchievementPanel";
import { ShopPanel } from "@/components/Shop/ShopPanel";
import { TutorialOverlay } from "@/components/Tutorial/TutorialOverlay";
import { SettingsModal } from "@/components/Settings/SettingsModal";
import { ResetModal } from "@/components/Modals/ResetModal";
import { AboutDataModal } from "@/components/Modals/AboutDataModal";
import { InitialLanguageModal } from "@/components/Modals/InitialLanguageModal";
import { PrivacyModal } from "@/components/Modals/PrivacyModal";
import { ImportExportModal } from "@/components/Modals/ImportExportModal";
import { CompletionModal } from "@/components/Modals/CompletionModal";
import { ToastContainer } from "@/components/ui/Toast";
import { useSoundEffects } from "@/hooks/useSoundEffects";

// Store
import type { ActivePanel, SaveData } from "@/store/types";
import i18n from "@/i18n/index";

// ─────────────────────────────────────────────
// Tab definitions
// ─────────────────────────────────────────────

const PANELS: Array<{
  id: ActivePanel;
  labelKey: string;
  Icon: React.FC<{ className?: string }>;
}> = [
  { id: "progress", labelKey: "nav.progress", Icon: Map },
  { id: "collection", labelKey: "nav.collection", Icon: List },
  { id: "history", labelKey: "nav.history", Icon: Clock },
  { id: "achievements", labelKey: "nav.achievements", Icon: Trophy },
  { id: "shop", labelKey: "shop.title", Icon: Store },
];

// ─────────────────────────────────────────────
// App
// ─────────────────────────────────────────────

/**
 * Main application component.
 * Handles layout, routing-like tab switching, and global state providers.
 */
export function App(): React.ReactElement {
  const { t } = useTranslation();
  const {
    state,
    dispatch,
    progress,
    unlockedIds,
    pityThreshold,
    roll,
    selectCountry,
    generateRollResult,
  } = useGameState();
  const {
    playRoll,
    playUnlock,
    playDuplicate,
    playAchievement,
    playBuy,
    playSuspense,
    isMuted,
    toggleMute,
  } = useSoundEffects();
  const [isRolling, setIsRolling] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  const locale = state.save.settings.language;

  // Achievement checking
  useAchievements(
    state,
    dispatch,
    progress.unlockedCount,
    progress.completedContinents,
    progress.longestStreak,
  );

  // Check for 100% completion
  useEffect(() => {
    import("@/data/countries").then(({ COUNTRIES }) => {
      if (
        progress.unlockedCount === COUNTRIES.length &&
        !state.showCompletion &&
        progress.unlockedCount > 0
      ) {
        dispatch({ type: "SHOW_COMPLETION" });
      }
    });
  }, [progress.unlockedCount, state.showCompletion, dispatch]);

  // Toast from state toasts
  const handleRemoveToast = useCallback(
    (id: string) => dispatch({ type: "REMOVE_TOAST", payload: id }),
    [dispatch],
  );

  // Play achievement sound when a new achievement toast appears
  const playedAchievementToasts = useRef<Set<string>>(new Set());

  useEffect(() => {
    let playedNew = false;
    state.toasts.forEach((t) => {
      if (
        t.type === "achievement" &&
        !playedAchievementToasts.current.has(t.id)
      ) {
        playedAchievementToasts.current.add(t.id);
        playedNew = true;
      }
    });

    if (playedNew) {
      playAchievement();
    }
  }, [state.toasts, playAchievement]);

  const [isMobileMaximized, setIsMobileMaximized] = useState(false);
  const [needsLanguageSelect, setNeedsLanguageSelect] = useState(() => {
    return localStorage.getItem("worlddex_lang_selected") !== "true";
  });

  const userCountryId = useUserCountry();

  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [viewOnMapTrigger, setViewOnMapTrigger] = useState<{
    id: string;
    t: number;
  } | null>(null);
  const [resetZoomTrigger, setResetZoomTrigger] = useState<number>(0);

  const [rollingRarityColor, setRollingRarityColor] = useState<string | null>(
    null,
  );
  const [autoRollEnabled, setAutoRollEnabled] = useState(false);

  // Check if autoclicker upgrade is unlocked
  const hasAutoclicker = (state.save.shopUpgrades["autoclicker"] ?? 0) > 0;

  // Roll with gambling animation delay
  const handleRoll = useCallback(() => {
    if (isRolling) return;
    setIsRolling(true);
    setResetZoomTrigger(Date.now());
    setViewOnMapTrigger(null);
    selectCountry(null);
    setHighlightId(null);

    // Determine the result upfront
    const targetCountry = generateRollResult();

    // Only glow blue if it's a new country, so the user knows they got something new
    // but doesn't know the rarity yet (surprise!)
    const isNew = !unlockedIds.has(targetCountry.id);
    setRollingRarityColor(isNew ? "rgba(59, 130, 246, 0.4)" : "transparent");

    playSuspense(); // The rising tension sound

    let ticks = 0;
    const maxTicks = 18;
    let speedMs = 80;

    const tick = () => {
      playRoll();
      const randomCountry =
        COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      setHighlightId(randomCountry.id);

      ticks++;
      // Slow down near the end for suspense
      if (ticks >= maxTicks - 4) speedMs = 150;
      if (ticks >= maxTicks - 2) speedMs = 280;

      if (ticks < maxTicks) {
        setTimeout(tick, speedMs);
      } else {
        // After a pause, hit the real result
        setHighlightId(null);
        setRollingRarityColor(null);
        roll(targetCountry, userCountryId);
        setIsRolling(false);
      }
    };

    setTimeout(tick, speedMs);
  }, [
    isRolling,
    roll,
    generateRollResult,
    userCountryId,
    playRoll,
    playSuspense,
  ]);

  // Language change
  const handleLanguageChange = useCallback(
    (lang: string) => {
      void i18n.changeLanguage(lang);
      dispatch({ type: "SET_LANGUAGE", payload: lang });
    },
    [dispatch],
  );

  const rollIsNew = useMemo(() => {
    if (!state.lastRolledCountryId) return false;
    const history = state.save.rollHistory[0];
    return history?.countryId === state.lastRolledCountryId && history?.isNew;
  }, [state.lastRolledCountryId, state.save.rollHistory]);

  const lastRolledCountryData = useMemo(() => {
    if (!state.lastRolledCountryId) return null;
    const country = COUNTRIES.find((c) => c.id === state.lastRolledCountryId);
    if (!country) return null;
    const rarity = getCountryRarity(country.birthProbability);
    return { country, rarity };
  }, [state.lastRolledCountryId]);

  // Autoclicker logic
  useEffect(() => {
    if (autoRollEnabled && hasAutoclicker && !state.showCompletion) {
      if (state.showRollResult) {
        if (rollIsNew) {
          // Pause auto-rolling while the new country modal is open
          return;
        } else {
          // It's a duplicate: wait briefly and auto-close it
          const timer = setTimeout(() => {
            dispatch({ type: "CLOSE_ROLL_RESULT" });
          }, 400); // 400ms to see the mini result
          return () => clearTimeout(timer);
        }
      } else if (!isRolling) {
        // Start next roll as soon as modal is closed and we're not rolling
        const timer = setTimeout(handleRoll, 50);
        return () => clearTimeout(timer);
      }
    }
  }, [
    autoRollEnabled,
    hasAutoclicker,
    state.showRollResult,
    state.showCompletion,
    handleRoll,
    dispatch,
    rollIsNew,
    isRolling,
  ]);

  // Play sound when roll result is shown
  useEffect(() => {
    if (state.showRollResult && lastRolledCountryData) {
      if (rollIsNew) playUnlock(lastRolledCountryData.rarity.label);
      else playDuplicate(lastRolledCountryData.rarity.label);
    }
  }, [
    state.showRollResult,
    lastRolledCountryData,
    rollIsNew,
    playUnlock,
    playDuplicate,
  ]);

  // Zoom to country — scroll to map and set selected
  const handleZoomToCountry = useCallback(
    (id: string) => {
      selectCountry(id);
      setHighlightId(id);
      setViewOnMapTrigger({ id, t: Date.now() });
    },
    [selectCountry],
  );

  // Duplicate count
  const duplicateCount = useMemo(
    () => state.save.rollHistory.filter((r) => !r.isNew).length,
    [state.save.rollHistory],
  );

  // Reset
  const handleReset = useCallback(() => {
    dispatch({ type: "RESET_PROGRESS" });
  }, [dispatch]);

  // Import save
  const handleImport = useCallback(
    (data: SaveData) => {
      dispatch({ type: "IMPORT_SAVE", payload: data });
    },
    [dispatch],
  );

  // Add toast
  const handleAddToast = useCallback(
    (message: string, type: "success" | "error") => {
      dispatch({
        type: "ADD_TOAST",
        payload: {
          id: `toast-${Date.now()}`,
          message,
          type,
        },
      });
    },
    [dispatch],
  );

  // Global spacebar to roll
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (state.showTutorial) return; // Block spacebar during tutorial

      if (e.code === "Space") {
        const activeTag = document.activeElement?.tagName.toLowerCase();
        if (
          activeTag !== "input" &&
          activeTag !== "textarea" &&
          activeTag !== "button"
        ) {
          e.preventDefault();
          if (state.showRollResult) {
            dispatch({ type: "CLOSE_ROLL_RESULT" });
          } else if (!isRolling) {
            handleRoll();
          }
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    isRolling,
    handleRoll,
    state.showRollResult,
    dispatch,
    state.showTutorial,
  ]);

  return (
    <div className={`h-[100dvh] overflow-x-hidden ${isMobileMaximized ? "overflow-y-hidden" : "overflow-y-auto lg:overflow-hidden"} bg-surface-950 text-slate-100 flex flex-col`}>
      {/* Header */}
      <Header dispatch={dispatch} isMuted={isMuted} toggleMute={toggleMute} />

      {/* Main layout */}
      <div className={`flex-1 flex flex-col lg:flex-row min-h-0 pointer-events-auto ${isMobileMaximized ? "overflow-hidden" : "overflow-y-auto lg:overflow-hidden"}`}>
        {/* ── Left/Main: Map + Roll button ─────────────────── */}
        <main
          className={`flex-1 flex flex-col p-2 sm:p-3 gap-3 ${
            isMobileMaximized ? "h-full overflow-hidden" : "min-h-[50vh]"
          } lg:min-h-0 relative z-10 shrink-0`}
        >
          <div
            id="tour-map"
            className={`flex-1 rounded-xl overflow-hidden ${
              isMobileMaximized ? "min-h-0 h-full" : "min-h-[250px]"
            } relative bg-surface-900`}
          >
            {/* Mobile Maximize Toggle */}
            <button
              type="button"
              onClick={() => setIsMobileMaximized(!isMobileMaximized)}
              className="absolute top-3 left-3 z-30 lg:hidden p-2 bg-surface-800/80 hover:bg-surface-700/90 backdrop-blur-sm border border-slate-700/50 rounded-lg text-slate-300 hover:text-white transition-colors shadow-sm"
              aria-label={
                isMobileMaximized ? "Minimizar mapa" : "Maximizar mapa"
              }
            >
              {isMobileMaximized ? (
                <Minimize2 className="w-5 h-5" />
              ) : (
                <Maximize2 className="w-5 h-5" />
              )}
            </button>
            <WorldMap
              unlockedIds={unlockedIds}
              lastRolledId={state.lastRolledCountryId}
              selectedId={state.selectedCountryId}
              highlightId={highlightId}
              viewOnMapTrigger={viewOnMapTrigger}
              resetZoomTrigger={resetZoomTrigger}
              onCountryClick={(id) => {
                if (id === state.selectedCountryId) {
                  selectCountry(null);
                } else {
                  selectCountry(id);
                  dispatch({ type: "SET_PANEL", payload: "progress" });
                  setIsMobileMaximized(false);
                  // Scroll to panel on mobile
                  setTimeout(() => {
                    document
                      .getElementById("main-aside")
                      ?.scrollIntoView({ behavior: "smooth" });
                  }, 50);
                }
              }}
            />
            {/* Box Shadow Overlay */}
            <div
              className="absolute inset-0 pointer-events-none transition-shadow duration-700 z-10 rounded-xl"
              style={{
                boxShadow:
                  rollingRarityColor && rollingRarityColor !== "transparent"
                    ? `inset 0 0 100px ${rollingRarityColor}`
                    : "none",
              }}
            />

            {/* Mini Roll Result (Autoclicker - Duplicates Only) */}
            {state.showRollResult &&
              autoRollEnabled &&
              !rollIsNew &&
              lastRolledCountryData && (
                <div className="absolute top-2 left-2 sm:top-4 sm:left-4 z-20 pointer-events-none bg-surface-800/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 sm:p-3 shadow-2xl animate-in slide-in-from-top-4 fade-in duration-300 min-w-[180px] sm:min-w-[220px]">
                  <div className="flex items-center gap-2 sm:gap-3 mb-1 sm:mb-2">
                    <Flag
                      countryId={lastRolledCountryData.country.id}
                      countryName={t(
                        `countries.${lastRolledCountryData.country.id}.name`,
                        { defaultValue: lastRolledCountryData.country.id },
                      )}
                      className="w-8 sm:w-10 h-auto rounded shadow-sm border border-slate-700 flex-shrink-0"
                    />
                    <div className="flex-1">
                      <h3 className="font-bold text-white text-xs sm:text-sm leading-tight max-w-[120px] sm:max-w-[150px] truncate">
                        {t(
                          `countries.${lastRolledCountryData.country.id}.name`,
                          { defaultValue: lastRolledCountryData.country.id },
                        )}
                      </h3>
                      <p className="text-slate-400 text-[9px] sm:text-[10px] truncate">
                        {t(
                          `countries.${lastRolledCountryData.country.id}.capital`,
                          { defaultValue: "" },
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-x-2 gap-y-1 mt-1 sm:mt-2 pt-1 sm:pt-2 border-t border-slate-700/50">
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">
                        {t("country.chance", "Probabilidade")}
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold ${lastRolledCountryData.rarity.colorClass}`}
                      >
                        {formatBirthChance(
                          lastRolledCountryData.country.birthProbability,
                          locale,
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">
                        {t("country.rarity", "Raridade")}
                      </span>
                      <span
                        className={`text-[10px] sm:text-[11px] font-bold ${lastRolledCountryData.rarity.colorClass}`}
                      >
                        {lastRolledCountryData.rarity.label}
                      </span>
                    </div>
                    <div className="flex flex-col mt-0.5 sm:mt-1">
                      <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">
                        {t("country.population", "População")}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-300">
                        {formatCompactNumber(
                          lastRolledCountryData.country.population,
                          locale,
                        )}
                      </span>
                    </div>
                    <div className="flex flex-col mt-0.5 sm:mt-1">
                      <span className="text-[8px] sm:text-[9px] text-slate-500 uppercase tracking-wide">
                        {t("country.births", "Nascimentos")}
                      </span>
                      <span className="text-[10px] sm:text-[11px] font-medium text-slate-300">
                        {formatCompactNumber(
                          lastRolledCountryData.country.annualBirths,
                          locale,
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )}
          </div>

          {/* Roll button + status */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4 px-1 sm:px-2 w-full max-w-2xl mx-auto">
            <div className="flex-1 text-center sm:text-left text-sm text-slate-400 hidden sm:block whitespace-nowrap">
              <span className="font-semibold text-accent-400">
                {progress.unlockedCount}
              </span>{" "}
              / {progress.totalCountries} {t("progress.unlocked").toLowerCase()}
            </div>
            <div className="flex flex-col items-center w-full sm:max-w-md flex-shrink-0">
              <div id="tour-pity" className="w-full">
                <PityMeter
                  current={state.save.pityCounter}
                  max={pityThreshold}
                />
              </div>

              <div
                id="tour-roll"
                className="flex w-full gap-2 items-stretch mt-1"
              >
                <div className="flex-1">
                  <RollButton
                    onRoll={handleRoll}
                    isRolling={isRolling}
                    disabled={state.showTutorial}
                    highlightId={highlightId}
                    rouletteText={
                      highlightId
                        ? t(`countries.${highlightId}.name`, {
                            defaultValue: highlightId,
                          })
                        : null
                    }
                  />
                </div>
                {hasAutoclicker && (
                  <button
                    onClick={() => {
                      if (!state.showTutorial)
                        setAutoRollEnabled((prev) => !prev);
                    }}
                    disabled={state.showTutorial}
                    className={`flex flex-col items-center justify-center px-3 sm:px-4 rounded-xl border-2 transition-all duration-200 shadow-md ${
                      autoRollEnabled
                        ? "bg-accent-500/20 border-accent-500/50 text-accent-400 shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                        : "bg-surface-800 border-surface-700 text-slate-500 hover:bg-surface-700 hover:text-slate-300"
                    } ${state.showTutorial ? "opacity-50 cursor-not-allowed" : ""}`}
                    title="Auto Roll"
                  >
                    <span className="text-[10px] font-black uppercase tracking-wider mb-0.5">
                      Auto
                    </span>
                    <span className="text-sm font-black">
                      {autoRollEnabled ? "ON" : "OFF"}
                    </span>
                  </button>
                )}
              </div>
              <div className="mt-2 text-[10px] text-slate-500 font-medium hidden sm:block">
                {t("roll.spacebar", "Pressione [Espaço] para girar")}
              </div>
            </div>
            <div className="flex-1 text-center sm:text-right text-sm text-slate-500 hidden sm:block whitespace-nowrap">
              {state.save.totalRolls > 0 && (
                <span>
                  {t("progress.totalRolls")}:{" "}
                  {state.save.totalRolls.toLocaleString(locale)}
                </span>
              )}
            </div>
          </div>
        </main>

        {/* ── Right panel: Tabs ──────────────────────────── */}
        <aside
          id="main-aside"
          className={`w-full lg:w-[450px] flex-col shrink-0 lg:border-l border-slate-700/50 bg-surface-900/50 relative z-20 ${
            isMobileMaximized ? "hidden lg:flex" : "flex"
          }`}
          aria-label="Panel lateral"
        >
          {/* Tab nav */}
          <nav
            role="tablist"
            aria-label={t("nav.progress")}
            className="flex border-b border-slate-800/60 px-1 pt-1"
          >
            {PANELS.map(({ id, labelKey, Icon }) => {
              const isActive = state.activePanel === id;
              return (
                <button
                  key={id}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${id}`}
                  id={`tab-${id}`}
                  type="button"
                  onClick={() => dispatch({ type: "SET_PANEL", payload: id })}
                  className={[
                    "flex-1 flex flex-col items-center gap-0.5 py-2 px-1 text-[10px] font-medium rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
                    isActive
                      ? "text-accent-400 border-b-2 border-accent-500 -mb-px bg-surface-800/30"
                      : "text-slate-500 hover:text-slate-300",
                  ].join(" ")}
                >
                  <Icon className="w-4 h-4" aria-hidden="true" />
                  <span className="hidden sm:block">{t(labelKey)}</span>
                </button>
              );
            })}
            {/* Settings tab */}
            <button
              type="button"
              onClick={() => setShowSettings(true)}
              aria-label={t("nav.settings")}
              className="flex flex-col items-center gap-0.5 py-2 px-2 text-[10px] font-medium text-slate-500 hover:text-slate-300 rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
            >
              <Settings className="w-4 h-4" aria-hidden="true" />
              <span className="hidden sm:block">{t("nav.settings")}</span>
            </button>
          </nav>

          {/* Panel content */}
          <div
            className="flex-1 overflow-y-auto p-4"
            role="tabpanel"
            id={`panel-${state.activePanel}`}
            aria-labelledby={`tab-${state.activePanel}`}
          >
            {state.activePanel === "progress" && (
              <div className="space-y-5">
                <ProgressPanel
                  progress={progress}
                  totalRolls={state.save.totalRolls}
                  duplicateCount={duplicateCount}
                  locale={locale}
                />
                {/* Country detail — shown when country selected */}
                {state.selectedCountryId && (
                  <div className="border-t border-slate-700/50 pt-4">
                    <CountryDetailPanel
                      countryId={state.selectedCountryId}
                      unlockRecord={
                        state.save.unlockedCountries[state.selectedCountryId]
                      }
                      rollCount={
                        state.save.rollCounts[state.selectedCountryId] ?? 0
                      }
                      isUnlocked={unlockedIds.has(state.selectedCountryId)}
                      onZoomToCountry={handleZoomToCountry}
                      locale={locale}
                    />
                  </div>
                )}
              </div>
            )}

            {state.activePanel === "collection" && (
              <UnlockedList
                unlockedCountries={state.save.unlockedCountries}
                rollCounts={state.save.rollCounts}
                selectedId={state.selectedCountryId}
                onSelect={(id) => {
                  selectCountry(id);
                  dispatch({ type: "SET_PANEL", payload: "progress" });
                }}
                locale={locale}
              />
            )}

            {state.activePanel === "history" && (
              <RollHistory
                history={state.save.rollHistory}
                onClearHistory={() => dispatch({ type: "CLEAR_HISTORY" })}
                locale={locale}
              />
            )}

            {state.activePanel === "achievements" && (
              <AchievementPanel
                achievements={state.save.achievements}
                unlockedCountries={state.save.unlockedCountries}
                rollCounts={state.save.rollCounts}
                unlockedCount={progress.unlockedCount}
                totalRolls={state.save.totalRolls}
                completedContinents={progress.completedContinents.length}
                longestStreak={progress.longestStreak}
                locale={locale}
              />
            )}
            {state.activePanel === "shop" && (
              <ShopPanel
                coins={state.save.coins}
                shopUpgrades={state.save.shopUpgrades}
                unlockedCountries={state.save.unlockedCountries}
                onBuyCountry={(countryId, price) => {
                  playBuy();
                  dispatch({
                    type: "BUY_COUNTRY",
                    payload: { countryId, price },
                  });
                }}
                onBuyUpgrade={(upgradeId, price) => {
                  playBuy();
                  dispatch({
                    type: "BUY_UPGRADE",
                    payload: { upgradeId, price },
                  });
                }}
                locale={locale}
              />
            )}
          </div>
        </aside>
      </div>

      {/* ── Overlays ───────────────────────────────────────── */}

      {/* Roll result (Big Modal - Disabled during autoclicker unless NEW country) */}
      {(!autoRollEnabled || rollIsNew) && (
        <RollResultModal
          isOpen={state.showRollResult}
          countryId={state.lastRolledCountryId}
          isNew={rollIsNew}
          onClose={() => dispatch({ type: "CLOSE_ROLL_RESULT" })}
          onViewOnMap={(id) => {
            selectCountry(id);
            dispatch({ type: "CLOSE_ROLL_RESULT" });
            dispatch({ type: "SET_PANEL", payload: "progress" });
          }}
          locale={locale}
        />
      )}

      {/* Completion */}
      <CompletionModal
        isOpen={state.showCompletion}
        onClose={() => dispatch({ type: "DISMISS_COMPLETION" })}
        totalRolls={state.save.totalRolls}
        unlockedCount={progress.unlockedCount}
      />

      {/* Initial Language Selector */}
      {needsLanguageSelect && (
        <InitialLanguageModal
          onComplete={() => setNeedsLanguageSelect(false)}
        />
      )}

      {/* Tutorial */}
      <TutorialOverlay
        isOpen={state.showTutorial && !needsLanguageSelect}
        onComplete={() => dispatch({ type: "COMPLETE_TUTORIAL" })}
        onDismiss={() => dispatch({ type: "DISMISS_TUTORIAL" })}
      />

      {/* Settings */}
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        currentLanguage={locale}
        onLanguageChange={handleLanguageChange}
        onResetProgress={() => {
          setShowSettings(false);
          dispatch({ type: "TOGGLE_RESET" });
        }}
        onExportProgress={() => {
          dispatch({ type: "TOGGLE_IMPORT_EXPORT" });
        }}
        onImportProgress={() => {
          dispatch({ type: "TOGGLE_IMPORT_EXPORT" });
        }}
        onShowTutorial={() => dispatch({ type: "SHOW_TUTORIAL" })}
        onShowAboutData={() => dispatch({ type: "TOGGLE_ABOUT_DATA" })}
        onShowPrivacy={() => dispatch({ type: "TOGGLE_PRIVACY" })}
      />

      {/* Reset confirmation */}
      <ResetModal
        isOpen={state.showReset}
        onClose={() => dispatch({ type: "TOGGLE_RESET" })}
        onConfirm={handleReset}
      />

      {/* About data */}
      <AboutDataModal
        isOpen={state.showAboutData}
        onClose={() => dispatch({ type: "TOGGLE_ABOUT_DATA" })}
      />

      {/* Privacy */}
      <PrivacyModal
        isOpen={state.showPrivacy}
        onClose={() => dispatch({ type: "TOGGLE_PRIVACY" })}
      />

      {/* Import/Export */}
      <ImportExportModal
        isOpen={state.showImportExport}
        onClose={() => dispatch({ type: "TOGGLE_IMPORT_EXPORT" })}
        saveData={state.save}
        onImport={handleImport}
        onAddToast={handleAddToast}
      />

      {/* Toasts */}
      <ToastContainer
        toasts={state.toasts}
        onRemove={handleRemoveToast}
        onNavigate={(panel) => {
          dispatch({
            type: "SET_PANEL",
            payload: panel as import("@/store/types").ActivePanel,
          });
        }}
      />
    </div>
  );
}
