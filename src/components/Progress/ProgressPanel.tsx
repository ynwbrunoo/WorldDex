import React from "react";
import { useTranslation } from "react-i18next";
import { Trophy, Shuffle, Copy, TrendingUp } from "lucide-react";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { ContinentProgress } from "./ContinentProgress";
import type { ProgressStats } from "@/utils/mapUtils";

interface ProgressPanelProps {
  progress: ProgressStats;
  totalRolls: number;
  duplicateCount: number;
  locale: string;
}

export function ProgressPanel({
  progress,
  totalRolls,
  duplicateCount,
  locale,
}: ProgressPanelProps): React.ReactElement {
  const { t } = useTranslation();

  return (
    <div className="space-y-5">
      {/* Main progress */}
      <div className="bg-surface-700/30 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium text-slate-300">
            {t("progress.unlocked")}
          </p>
          <p className="text-sm font-bold text-accent-400">
            {t("progress.unlockedCount", {
              count: progress.unlockedCount,
              total: progress.totalCountries,
            })}
          </p>
        </div>
        <ProgressBar
          value={progress.percentage}
          label={t("accessibility.progressBar", {
            value: progress.percentage.toFixed(1),
          })}
          height="h-3"
          showValue
        />
        <p className="text-xs text-slate-500">
          {t("progress.remaining", { count: progress.remaining })}
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2.5">
        <StatItem
          icon={<Shuffle className="w-4 h-4 text-accent-400" />}
          label={t("progress.totalRolls")}
          value={totalRolls.toLocaleString(locale)}
        />
        <StatItem
          icon={<Copy className="w-4 h-4 text-slate-400" />}
          label={t("progress.duplicates")}
          value={duplicateCount.toLocaleString(locale)}
        />
        <StatItem
          icon={<TrendingUp className="w-4 h-4 text-emerald-400" />}
          label={t("progress.longestStreak")}
          value={progress.longestStreak.toLocaleString(locale)}
          className="col-span-2"
        />
      </div>

      {/* Continent breakdown */}
      <div>
        <h3 className="text-sm font-medium text-slate-400 mb-3 flex items-center gap-2">
          <Trophy className="w-4 h-4" aria-hidden="true" />
          {t("progress.continents")}
        </h3>
        <ContinentProgress byContinent={progress.byContinent} locale={locale} />
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────

function StatItem({
  icon,
  label,
  value,
  className = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  className?: string;
}): React.ReactElement {
  return (
    <div
      className={`bg-surface-700/30 rounded-xl p-3 flex items-center gap-3 ${className}`}
    >
      <span className="flex-shrink-0" aria-hidden="true">
        {icon}
      </span>
      <div className="min-w-0">
        <p className="text-xs text-slate-500 truncate">{label}</p>
        <p className="text-sm font-bold text-slate-200">{value}</p>
      </div>
    </div>
  );
}
