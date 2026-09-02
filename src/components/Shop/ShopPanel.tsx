import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Coins, Zap, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { COUNTRIES } from "@/data/countries";
import { getCountryRarity } from "@/utils/rarity";
import {
  SHOP_UPGRADES,
  getCountryPrice,
  getUpgradeCurrentPrice,
} from "@/utils/shopEconomy";

// ─── Types ──────────────────────────────────────────────────────────────────

interface ShopPanelProps {
  coins: number;
  shopUpgrades: Record<string, number>;
  unlockedCountries: Record<string, unknown>;
  onBuyCountry: (countryId: string, price: number) => void;
  onBuyUpgrade: (upgradeId: string, price: number) => void;
  locale: string;
}

type Tab = "countries" | "upgrades";

// ─── Animated coin counter ───────────────────────────────────────────────────

function CoinDisplay({ coins }: { coins: number }) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center gap-2 bg-surface-700/50 border border-white/10 rounded-xl px-4 py-2.5">
      <Coins
        className="w-4 h-4 text-amber-400 flex-shrink-0"
        aria-hidden="true"
      />
      <span className="text-sm font-bold text-amber-300 tabular-nums">
        {coins.toLocaleString()}
      </span>
      <span className="text-xs text-slate-500">
        {t("shop.coins", "moedas")}
      </span>
    </div>
  );
}

// ─── Country card ─────────────────────────────────────────────────────────────

interface CountryCardProps {
  id: string;
  probability: number;
  coins: number;
  onBuy: (id: string, price: number) => void;
}

function CountryCard({ id, probability, coins, onBuy }: CountryCardProps) {
  const { t } = useTranslation();
  const rarity = getCountryRarity(probability);
  const price = getCountryPrice(probability);
  const canAfford = coins >= price;
  const flagSrc = `https://flagcdn.com/w40/${id.toLowerCase()}.png`;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ type: "spring", stiffness: 350, damping: 30 }}
      className="bg-surface-700/30 border border-white/5 hover:border-white/10 rounded-xl p-3 flex items-center justify-between transition-colors group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-7 rounded overflow-hidden flex-shrink-0 shadow-sm opacity-90 group-hover:opacity-100 transition-opacity">
          <img
            src={flagSrc}
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-slate-200 truncate">
            {t(`countries.${id}.name`, id)}
          </h3>
          <span
            className={`inline-flex items-center gap-1 rounded-full border font-medium mt-0.5 text-[10px] px-1.5 py-0 ${rarity.badgeClass}`}
          >
            <span aria-hidden="true" className="mr-1">
              {rarity.symbol}
            </span>
            {t(`rarity.${rarity.key}`, rarity.label)}
          </span>
        </div>
      </div>
      <Button
        variant={canAfford ? "primary" : "secondary"}
        size="sm"
        disabled={!canAfford}
        onClick={() => onBuy(id, price)}
        className="flex-shrink-0 ml-3"
      >
        <Coins className="w-3.5 h-3.5 mr-1" aria-hidden="true" />
        {price.toLocaleString()}
      </Button>
    </motion.div>
  );
}

// ─── Upgrade card ─────────────────────────────────────────────────────────────

interface UpgradeCardProps {
  upgradeId: string;
  currentLevel: number;
  coins: number;
  onBuy: (id: string, price: number) => void;
}

function UpgradeCard({
  upgradeId,
  currentLevel,
  coins,
  onBuy,
}: UpgradeCardProps) {
  const { t } = useTranslation();
  const upgrade = SHOP_UPGRADES.find((u) => u.id === upgradeId);
  if (!upgrade) return null;

  const isMaxed = currentLevel >= upgrade.maxLevel;
  const price = getUpgradeCurrentPrice(upgrade, currentLevel);
  const canAfford = !isMaxed && coins >= price;

  return (
    <div
      className={[
        "rounded-xl p-4 border transition-colors",
        isMaxed
          ? "bg-gold-900/10 border-gold-700/30"
          : "bg-surface-700/30 border-white/5 hover:border-white/10",
      ].join(" ")}
    >
      <div className="flex items-start gap-3">
        {/* Icon */}
        <div
          className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isMaxed
              ? "bg-gold-600/20 text-gold-400"
              : "bg-accent-600/20 text-accent-400"
          }`}
          aria-hidden="true"
        >
          <Zap className="w-4 h-4" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold text-slate-200">
              {t(`${upgrade.i18nKey}.name`)}
            </p>
            {isMaxed && (
              <Badge variant="achievement">
                <ChevronUp className="w-2.5 h-2.5" aria-hidden="true" />
                {t("shop.maxLevel", "Máx.")}
              </Badge>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            {t(`${upgrade.i18nKey}.description`, {
              level: currentLevel + 1,
              max: upgrade.maxLevel,
              mult: currentLevel + 2,
            })}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            {t("shop.level", "Nível")} {currentLevel} / {upgrade.maxLevel}
          </p>
        </div>

        {/* Price + buy */}
        {!isMaxed && (
          <div className="flex flex-col items-end gap-1.5 flex-shrink-0">
            <div className="flex items-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" aria-hidden="true" />
              <span className="text-xs font-bold text-amber-300 tabular-nums">
                {price.toLocaleString()}
              </span>
            </div>
            <Button
              variant={canAfford ? "primary" : "secondary"}
              size="sm"
              disabled={!canAfford}
              onClick={() => onBuy(upgradeId, price)}
              aria-label={t("shop.buyUpgrade", {
                upgrade: t(`${upgrade.i18nKey}.name`),
              })}
            >
              {t("shop.upgrade", "Melhorar")}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main panel ──────────────────────────────────────────────────────────────

/**
 * ShopPanel — full in-game shop with two tabs:
 *   • "Países"   — buy locked countries directly with coins
 *   • "Upgrades" — purchase gameplay upgrades (coin bonuses, roll buffs, etc.)
 *
 * Imports SHOP_UPGRADES and getCountryPrice from @/utils/shopEconomy.
 * TODO: @/utils/shopEconomy is created by a parallel agent — ensure it exports
 *       { SHOP_UPGRADES, getCountryPrice } before using this component.
 */
export function ShopPanel({
  coins,
  shopUpgrades,
  unlockedCountries,
  onBuyCountry,
  onBuyUpgrade,
}: ShopPanelProps): React.ReactElement {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<Tab>("countries");
  const [search, setSearch] = useState("");

  // Locked countries sorted by price ascending
  const lockedCountries = useMemo(() => {
    return COUNTRIES.filter((c) => !unlockedCountries[c.id])
      .map((c) => ({ ...c, price: getCountryPrice(c.birthProbability) }))
      .sort((a, b) => a.price - b.price);
  }, [unlockedCountries]);

  const filteredCountries = useMemo(() => {
    if (!search.trim()) return lockedCountries;
    const q = search.toLowerCase();
    return lockedCountries.filter((c) => {
      const name = t(`countries.${c.id}.name`, c.id).toLowerCase();
      return name.includes(q) || c.id.toLowerCase().includes(q);
    });
  }, [lockedCountries, search, t]);

  const upgradeIds = SHOP_UPGRADES.map((u) => u.id);

  const tabs: { id: Tab; label: string }[] = [
    { id: "countries", label: t("shop.tabs.countries", "Países") },
    { id: "upgrades", label: t("shop.tabs.upgrades", "Upgrades") },
  ];

  return (
    <div className="space-y-4">
      {/* Coin balance */}
      <div className="flex items-center justify-between">
        <h2 className="text-base font-semibold text-slate-200">
          {t("shop.title", "Loja")}
        </h2>
        <CoinDisplay coins={coins} />
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 bg-surface-700/40 rounded-xl p-1 border border-white/5">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
            className={[
              "flex-1 text-sm font-medium py-1.5 rounded-lg transition-all duration-150",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
              activeTab === tab.id
                ? "bg-accent-600 text-white shadow-glow-accent"
                : "text-slate-400 hover:text-slate-200 hover:bg-surface-600/50",
            ].join(" ")}
            aria-current={activeTab === tab.id ? "page" : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab panels */}
      <AnimatePresence mode="wait">
        {activeTab === "countries" && (
          <motion.div
            key="countries"
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 8 }}
            transition={{ duration: 0.15 }}
            className="space-y-3"
          >
            {/* Search bar */}
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500 pointer-events-none"
                aria-hidden="true"
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("collection.search", "Pesquisar país...")}
                aria-label={t("collection.search", "Pesquisar país...")}
                className="w-full bg-surface-700/40 border border-white/5 rounded-xl pl-9 pr-3 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:border-accent-600/50 transition-colors"
              />
            </div>

            {/* Count */}
            <p className="text-xs text-slate-500 px-1">
              {t("shop.lockedCount", {
                count: filteredCountries.length,
                defaultValue: "{{count}} países bloqueados",
              })}
            </p>

            {/* Country list */}
            {filteredCountries.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                {search
                  ? t(
                      "collection.noResults",
                      "Nenhum país corresponde à tua pesquisa.",
                    )
                  : t(
                      "shop.allUnlocked",
                      "Já desbloqueaste todos os países! 🎉",
                    )}
              </div>
            ) : (
              <div className="space-y-2 max-h-[55vh] overflow-y-auto pr-1">
                <AnimatePresence initial={false}>
                  {filteredCountries.map((c) => (
                    <CountryCard
                      key={c.id}
                      id={c.id}
                      probability={c.birthProbability}
                      coins={coins}
                      onBuy={onBuyCountry}
                    />
                  ))}
                </AnimatePresence>
              </div>
            )}
          </motion.div>
        )}

        {activeTab === "upgrades" && (
          <motion.div
            key="upgrades"
            initial={{ opacity: 0, x: 8 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -8 }}
            transition={{ duration: 0.15 }}
            className="space-y-2 max-h-[60vh] overflow-y-auto pr-1"
          >
            {upgradeIds.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                {t("shop.noUpgrades", "Nenhum upgrade disponível.")}
              </div>
            ) : (
              upgradeIds.map((id) => (
                <UpgradeCard
                  key={id}
                  upgradeId={id}
                  currentLevel={shopUpgrades[id] ?? 0}
                  coins={coins}
                  onBuy={onBuyUpgrade}
                />
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
