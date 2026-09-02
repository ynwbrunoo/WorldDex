import React, { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Globe, MapPin, Calendar, BarChart2 } from "lucide-react";
import { COUNTRY_MAP } from "@/data/countries";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import {
  formatCompactNumber,
  formatBirthChance,
  formatDate,
} from "@/utils/formatting";
import type { UnlockRecord } from "@/store/types";
import { CONTINENT_I18N_KEY } from "@/data/continents";
import { Flag } from "@/components/ui/Flag";

interface CountryDetailPanelProps {
  countryId: string | null;
  unlockRecord: UnlockRecord | undefined;
  rollCount: number;
  isUnlocked: boolean;
  onZoomToCountry: (id: string) => void;
  locale: string;
}

export function CountryDetailPanel({
  countryId,
  unlockRecord,
  rollCount,
  isUnlocked,
  onZoomToCountry,
  locale,
}: CountryDetailPanelProps): React.ReactElement {
  const { t } = useTranslation();

  const country = useMemo(
    () => (countryId ? COUNTRY_MAP.get(countryId) : null),
    [countryId],
  );

  if (!countryId || !country) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-slate-500 text-sm">
        <Globe className="w-8 h-8 mb-2 opacity-40" aria-hidden="true" />
        <p>{t("country.clickToExplore")}</p>
      </div>
    );
  }

  const countName = t(`countries.${country.id}.name`, {
    defaultValue: country.id,
  });
  const countCapital = t(`countries.${country.id}.capital`, {
    defaultValue: "",
  });
  const continentName = t(CONTINENT_I18N_KEY[country.continent]);

  return (
    <div className="space-y-4">
      {/* Flag + Name */}
      <div className="flex items-center gap-4">
        <div className="shadow-lg overflow-hidden rounded-[4px] border border-slate-700/50 flex-shrink-0">
          <Flag
            countryId={country.id}
            countryName={countName}
            className="w-16 h-auto block"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-xl font-bold text-slate-100 leading-tight truncate">
            {countName}
          </h3>
          {countCapital && (
            <p className="text-sm text-slate-400 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 flex-shrink-0" aria-hidden="true" />
              <span>{countCapital}</span>
            </p>
          )}
        </div>
        <Badge variant={isUnlocked ? "unlocked" : "locked"}>
          {isUnlocked
            ? t("country.status.unlocked")
            : t("country.status.locked")}
        </Badge>
      </div>

      {/* Continent */}
      <div className="flex items-center gap-2 text-sm text-slate-400">
        <Globe className="w-4 h-4" aria-hidden="true" />
        <span>{continentName}</span>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatCard
          label={t("country.population")}
          value={formatCompactNumber(country.population, locale)}
        />
        <StatCard
          label={`${t("country.annualBirths")} (10 Yrs)`}
          value={formatCompactNumber(country.annualBirths * 10, locale)}
        />
        <StatCard
          label={t("country.birthChance")}
          value={formatBirthChance(country.birthProbability, locale)}
          highlight
          colSpan
        />
      </div>

      {/* Roll history */}
      {isUnlocked && (
        <div className="bg-surface-700/30 rounded-xl p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-sm">
            <BarChart2 className="w-4 h-4 text-slate-400" aria-hidden="true" />
            <span className="text-slate-300">
              {t(`country.rollCount${rollCount === 1 ? "" : "_other"}`, {
                count: rollCount,
              })}
            </span>
          </div>
          {unlockRecord?.unlockedAt && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
              <span>
                {t("country.firstUnlocked", {
                  date: formatDate(unlockRecord.unlockedAt, locale),
                })}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Data note */}
      <p className="text-xs text-slate-600 italic">
        {t("data.approximation")} {country.dataYear}.
      </p>

      {/* Zoom to country */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => onZoomToCountry(country.id)}
        icon={<MapPin className="w-3.5 h-3.5" />}
        className="w-full"
      >
        {t("country.zoomToCountry")}
      </Button>
    </div>
  );
}

// ─────────────────────────────────────────────
// Stat card sub-component
// ─────────────────────────────────────────────

function StatCard({
  label,
  value,
  highlight = false,
  colSpan = false,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  colSpan?: boolean;
}): React.ReactElement {
  return (
    <div
      className={`bg-surface-700/40 rounded-xl p-3 ${colSpan ? "col-span-2" : ""}`}
    >
      <p className="text-xs text-slate-500 mb-0.5">{label}</p>
      <p
        className={`text-sm font-semibold ${highlight ? "text-accent-400" : "text-slate-200"}`}
      >
        {value}
      </p>
    </div>
  );
}
