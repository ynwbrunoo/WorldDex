import React, { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Lock, Unlock, Trophy } from "lucide-react";
import { ACHIEVEMENTS } from "@/data/achievements";
import { getAchievementProgress } from "@/hooks/useAchievements";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Badge } from "@/components/ui/Badge";
import { Checkbox } from "@/components/ui/Checkbox";
import { formatDate } from "@/utils/formatting";
import type { AchievementRecord } from "@/store/types";
import { COUNTRIES } from "@/data/countries";

interface AchievementPanelProps {
  achievements: Record<string, AchievementRecord>;
  unlockedCountries: Record<string, unknown>;
  rollCounts: Record<string, number>;
  unlockedCount: number;
  totalRolls: number;
  completedContinents: number;
  longestStreak: number;
  locale: string;
}

export function AchievementPanel({
  achievements,
  unlockedCountries,
  rollCounts,
  unlockedCount,
  totalRolls,
  completedContinents,
  longestStreak,
  locale,
}: AchievementPanelProps): React.ReactElement {
  const { t } = useTranslation();
  const totalCountries = COUNTRIES.length;
  const [hideCompleted, setHideCompleted] = useState(false);

  const sorted = useMemo(() => {
    return [...ACHIEVEMENTS]
      .filter((a) => {
        const aUnlocked = !!achievements[a.id]?.unlockedAt;
        if (hideCompleted && aUnlocked) return false;
        return true;
      })
      .sort((a, b) => {
        const aUnlocked = !!achievements[a.id]?.unlockedAt;
        const bUnlocked = !!achievements[b.id]?.unlockedAt;
        if (aUnlocked && !bUnlocked) return -1;
        if (!aUnlocked && bUnlocked) return 1;
        return 0;
      });
  }, [achievements, hideCompleted]);

  const unlockedCount_ = Object.values(achievements).filter(
    (a) => a.unlockedAt,
  ).length;

  return (
    <div className="space-y-3">
      {/* Header stats */}
      <div className="bg-surface-700/30 rounded-xl px-4 py-3 flex items-center gap-3">
        <Trophy className="w-5 h-5 text-gold-400" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-slate-200">
            {unlockedCount_} / {ACHIEVEMENTS.length}
          </p>
          <p className="text-xs text-slate-500">{t("achievements.title")}</p>
        </div>
        <div className="flex-1">
          <ProgressBar
            value={(unlockedCount_ / ACHIEVEMENTS.length) * 100}
            label={t("achievements.title")}
            variant="gold"
            height="h-1.5"
          />
        </div>
      </div>

      <div className="flex justify-end px-1">
        <Checkbox
          checked={hideCompleted}
          onChange={setHideCompleted}
          label={t("achievements.hideCompleted", "Esconder completas")}
          id="hide-completed-cb"
        />
      </div>

      {/* Achievement list */}
      <div className="space-y-2">
        {sorted.map((ach) => {
          const record = achievements[ach.id];
          const isUnlocked = !!record?.unlockedAt;
          const progress = getAchievementProgress(
            ach.id,
            unlockedCount,
            totalCountries,
            totalRolls,
            completedContinents,
            longestStreak,
            unlockedCountries,
            rollCounts,
            achievements,
          );
          const progressPct = progress
            ? Math.min((progress.current / progress.total) * 100, 100)
            : 0;

          const name = t(`${ach.i18nKey}.name`);
          const desc = t(`${ach.i18nKey}.description`);

          return (
            <div
              key={ach.id}
              className={[
                "rounded-xl p-3.5 border transition-colors",
                isUnlocked
                  ? "bg-gold-900/10 border-gold-700/30"
                  : "bg-surface-700/20 border-slate-700/20",
              ].join(" ")}
              aria-label={
                isUnlocked
                  ? t("accessibility.achievementUnlocked", { name })
                  : t("accessibility.achievementLocked", { name })
              }
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    isUnlocked
                      ? "bg-gold-600/20 text-gold-400"
                      : "bg-slate-700/50 text-slate-500"
                  }`}
                  aria-hidden="true"
                >
                  {isUnlocked ? (
                    <Trophy className="w-4.5 h-4.5" />
                  ) : (
                    <Lock className="w-4 h-4" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-0.5">
                    <p
                      className={`text-sm font-semibold ${isUnlocked ? "text-gold-300" : "text-slate-400"}`}
                    >
                      {name}
                    </p>
                    {isUnlocked && (
                      <Badge variant="achievement">
                        <Unlock className="w-2.5 h-2.5" aria-hidden="true" />
                        {t("achievements.unlocked")}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mb-2">{desc}</p>

                  {/* Progress bar for non-unlocked */}
                  {!isUnlocked && progress && progress.total > 1 && (
                    <div>
                      <ProgressBar
                        value={progressPct}
                        label={`${name}: ${progress.current} / ${progress.total}`}
                        variant="gold"
                        height="h-1"
                        animated
                      />
                      <p className="text-xs text-slate-600 mt-1">
                        {t("achievements.progress", {
                          current: progress.current,
                          total: progress.total,
                        })}
                      </p>
                    </div>
                  )}

                  {/* Unlock date */}
                  {isUnlocked && record.unlockedAt && (
                    <p className="text-xs text-slate-600">
                      {t("achievements.unlockedOn", {
                        date: formatDate(record.unlockedAt, locale),
                      })}
                    </p>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
