import React from "react";
import { useTranslation } from "react-i18next";
import { COUNTRY_MAP } from "@/data/countries";
import { CONTINENT_I18N_KEY } from "@/data/continents";
import { Flag } from "@/components/ui/Flag";
import { Lock } from "lucide-react";
import { getCountryRarity } from "@/utils/rarity";
import { formatBirthChance } from "@/utils/formatting";

interface UnlockedCardProps {
  countryId: string;
  rollCount: number;
  isSelected: boolean;
  isUnlocked: boolean;
  onClick: () => void;
  locale: string;
}

export function UnlockedCard({
  countryId,
  rollCount,
  isSelected,
  isUnlocked,
  onClick,
  locale,
}: UnlockedCardProps): React.ReactElement | null {
  const { t } = useTranslation();
  const country = COUNTRY_MAP.get(countryId);
  if (!country) return null;

  const isRevealed = isUnlocked || rollCount === -1;
  const name = isRevealed
    ? t(`countries.${countryId}.name`, { defaultValue: countryId })
    : t(`countries.${countryId}.name`, { defaultValue: countryId });
  const continentName = t(CONTINENT_I18N_KEY[country.continent]);
  const rarity = getCountryRarity(country.birthProbability);

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all relative overflow-hidden",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
        isSelected
          ? "bg-accent-600/20 border border-accent-500/40 text-slate-100"
          : isUnlocked
            ? "bg-surface-700/20 border border-transparent hover:bg-surface-700/40 hover:border-slate-600/30 text-slate-300"
            : "bg-surface-800/40 border border-transparent hover:bg-surface-800/60 text-slate-500 grayscale opacity-50 cursor-pointer",
      ].join(" ")}
      aria-pressed={isSelected}
      aria-label={isUnlocked ? name : t("collection.locked")}
    >
      {/* Flag */}
      <div className="w-8 h-6 flex-shrink-0 flex items-center justify-center rounded-[2px] overflow-hidden bg-slate-800/50 shadow-sm border border-white/5">
        {isRevealed ? (
          <Flag countryId={country.id} className="w-full h-full" />
        ) : (
          <Lock className="w-3.5 h-3.5 text-slate-500" />
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">
            {isRevealed ? name : "???"}
          </p>
          {isRevealed && (
            <span
              className={`text-[9px] px-1.5 py-0.5 rounded uppercase font-bold tracking-wider ${rarity.badgeClass}`}
            >
              <span aria-hidden="true" className="mr-1">
                {rarity.symbol}
              </span>
              {t(`rarity.${rarity.key}`, rarity.label)}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 text-xs opacity-60 truncate mt-0.5">
          <span>{continentName}</span>
          {isRevealed && (
            <>
              <span>•</span>
              <span>{formatBirthChance(country.birthProbability, locale)}</span>
            </>
          )}
        </div>
      </div>

      {/* Roll count / Lock icon */}
      <span className="text-xs text-slate-500 flex-shrink-0">
        {isUnlocked ? `×${rollCount.toLocaleString(locale)}` : "🔒"}
      </span>
    </button>
  );
}
