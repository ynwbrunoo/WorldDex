import React from "react";
import { useTranslation } from "react-i18next";
import { CheckCircle2 } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  ALL_CONTINENTS,
  CONTINENT_I18N_KEY,
  CONTINENT_BG,
  CONTINENT_COLOR,
} from "@/data/continents";
import type { ProgressStats } from "@/utils/mapUtils";
import type { ContinentKey } from "@/data/continents";

const CONTINENT_PROGRESS_VARIANT: Record<
  ContinentKey,
  NonNullable<React.ComponentProps<typeof ProgressBar>["variant"]>
> = {
  africa: "amber",
  asia: "rose",
  europe: "blue",
  northAmerica: "emerald",
  southAmerica: "emerald",
  oceania: "violet",
};

interface ContinentProgressProps {
  byContinent: ProgressStats["byContinent"];
  locale: string;
}

export function ContinentProgress({
  byContinent,
  locale,
}: ContinentProgressProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="space-y-2.5">
      {ALL_CONTINENTS.map((cont) => {
        const { total, unlocked, complete } = byContinent[cont];
        const pct = total > 0 ? (unlocked / total) * 100 : 0;

        return (
          <div
            key={cont}
            className={`rounded-xl px-3 py-2.5 border ${CONTINENT_BG[cont]}`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <span className={`text-xs font-medium ${CONTINENT_COLOR[cont]}`}>
                {t(CONTINENT_I18N_KEY[cont])}
              </span>
              <span className="text-xs text-slate-400 flex items-center gap-1">
                {complete && (
                  <CheckCircle2
                    className="w-3.5 h-3.5 text-emerald-400"
                    aria-label={t("achievements.continentalExplorer.name")}
                  />
                )}
                {unlocked.toLocaleString(locale)} /{" "}
                {total.toLocaleString(locale)}
              </span>
            </div>
            <ProgressBar
              value={pct}
              label={`${t(CONTINENT_I18N_KEY[cont])}: ${unlocked} / ${total}`}
              variant={CONTINENT_PROGRESS_VARIANT[cont]}
              height="h-1.5"
            />
          </div>
        );
      })}
    </div>
  );
}
