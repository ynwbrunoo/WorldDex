import React, { useState, useMemo, useCallback } from "react";
import { useTranslation } from "react-i18next";
import { Search } from "lucide-react";
import { COUNTRIES, COUNTRY_MAP } from "@/data/countries";
import { UnlockedCard } from "./UnlockedCard";
import { Select } from "@/components/ui/Select";
import type { UnlockRecord } from "@/store/types";

type SortOption =
  | "recent"
  | "alphabetical"
  | "mostRolled"
  | "continent"
  | "chanceDesc"
  | "chanceAsc";

interface UnlockedListProps {
  unlockedCountries: Record<string, UnlockRecord>;
  rollCounts: Record<string, number>;
  selectedId: string | null;
  onSelect: (id: string) => void;
  locale: string;
}

export function UnlockedList({
  unlockedCountries,
  rollCounts,
  selectedId,
  onSelect,
  locale,
}: UnlockedListProps): React.ReactElement {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<SortOption>("recent");

  const unlockedCount = Object.keys(unlockedCountries).length;
  const remainingCount = COUNTRIES.length - unlockedCount;
  const shouldRevealRemaining = remainingCount <= 15;

  const entries = useMemo(() => {
    const ids = COUNTRIES.map((c) => c.id);

    // Filter
    const filtered = ids.filter((id) => {
      if (!search.trim()) return true;
      const name = t(`countries.${id}.name`, {
        defaultValue: id,
      }).toLowerCase();
      return name.includes(search.toLowerCase());
    });

    // Sort
    filtered.sort((a, b) => {
      const aUnlocked = !!unlockedCountries[a];
      const bUnlocked = !!unlockedCountries[b];

      // Always sort unlocked before locked
      if (aUnlocked && !bUnlocked) return -1;
      if (!aUnlocked && bUnlocked) return 1;

      // If both are locked, sort by birth probability (highest first)
      if (!aUnlocked && !bUnlocked) {
        const aProb = COUNTRY_MAP.get(a)?.birthProbability ?? 0;
        const bProb = COUNTRY_MAP.get(b)?.birthProbability ?? 0;
        return bProb - aProb;
      }

      // If both are unlocked, use the selected sort option
      switch (sort) {
        case "recent": {
          const aTime = new Date(
            unlockedCountries[a]?.unlockedAt ?? 0,
          ).getTime();
          const bTime = new Date(
            unlockedCountries[b]?.unlockedAt ?? 0,
          ).getTime();
          return bTime - aTime;
        }
        case "alphabetical": {
          const aName = t(`countries.${a}.name`, { defaultValue: a });
          const bName = t(`countries.${b}.name`, { defaultValue: b });
          return aName.localeCompare(bName, locale);
        }
        case "mostRolled":
          return (rollCounts[b] ?? 0) - (rollCounts[a] ?? 0);
        case "continent": {
          const aCont = COUNTRY_MAP.get(a)?.continent ?? "";
          const bCont = COUNTRY_MAP.get(b)?.continent ?? "";
          if (aCont !== bCont) return aCont.localeCompare(bCont);
          const aName = t(`countries.${a}.name`, { defaultValue: a });
          const bName = t(`countries.${b}.name`, { defaultValue: b });
          return aName.localeCompare(bName, locale);
        }
        case "chanceDesc": {
          const aProb = COUNTRY_MAP.get(a)?.birthProbability ?? 0;
          const bProb = COUNTRY_MAP.get(b)?.birthProbability ?? 0;
          return bProb - aProb;
        }
        case "chanceAsc": {
          const aProb = COUNTRY_MAP.get(a)?.birthProbability ?? 0;
          const bProb = COUNTRY_MAP.get(b)?.birthProbability ?? 0;
          return aProb - bProb;
        }
        default:
          return 0;
      }
    });

    return filtered;
  }, [search, sort, unlockedCountries, rollCounts, t, locale]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => setSearch(e.target.value),
    [],
  );

  const SORT_OPTIONS = [
    { value: "recent", label: t("collection.sort.recent") },
    { value: "alphabetical", label: t("collection.sort.alphabetical") },
    { value: "mostRolled", label: t("collection.sort.mostRolled") },
    { value: "continent", label: t("collection.sort.continent") },
    {
      value: "chanceDesc",
      label: t("collection.sortChanceDesc", "Maior Chance"),
    },
    {
      value: "chanceAsc",
      label: t("collection.sortChanceAsc", "Menor Chance"),
    },
  ];

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            value={search}
            onChange={handleSearchChange}
            placeholder={t("collection.search")}
            aria-label={t("collection.search")}
            className="w-full pl-8 pr-3 py-2 text-sm bg-surface-700/50 border border-slate-600/40 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
          />
        </div>

        {/* Sort */}
        <div className="w-full sm:w-48 flex-shrink-0 relative z-20">
          <Select
            value={sort}
            options={SORT_OPTIONS}
            onChange={(val) => setSort(val as SortOption)}
            ariaLabel={t("collection.sort.label")}
          />
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {entries.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {search ? t("collection.noResults") : t("collection.empty")}
          </div>
        ) : (
          entries.map((id) => {
            const isUnlocked = !!unlockedCountries[id];
            const rollCount = isUnlocked
              ? (rollCounts[id] ?? 0)
              : shouldRevealRemaining
                ? -1
                : 0;
            return (
              <UnlockedCard
                key={id}
                countryId={id}
                rollCount={rollCount}
                isSelected={id === selectedId}
                isUnlocked={isUnlocked}
                onClick={() => {
                  if (isUnlocked || shouldRevealRemaining) {
                    onSelect(id);
                  }
                }}
                locale={locale}
              />
            );
          })
        )}
      </div>

      {/* Count */}
      <p className="text-xs text-slate-600 text-center">
        {entries.length} / {COUNTRIES.length}
      </p>
    </div>
  );
}
