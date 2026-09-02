import React, { useState, useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Trash2 } from "lucide-react";
import { COUNTRY_MAP } from "@/data/countries";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Flag } from "@/components/ui/Flag";
import { formatRelativeTime } from "@/utils/formatting";
import type { RollRecord } from "@/store/types";

type HistoryFilter = "all" | "new" | "duplicates";

interface RollHistoryProps {
  history: RollRecord[];
  onClearHistory: () => void;
  locale: string;
}

export function RollHistory({
  history,
  onClearHistory,
  locale,
}: RollHistoryProps): React.ReactElement {
  const { t } = useTranslation();
  const [filter, setFilter] = useState<HistoryFilter>("all");
  const [showConfirm, setShowConfirm] = useState(false);

  const filtered = useMemo(() => {
    switch (filter) {
      case "new":
        return history.filter((r) => r.isNew);
      case "duplicates":
        return history.filter((r) => !r.isNew);
      default:
        return history;
    }
  }, [history, filter]);

  const handleClear = useCallback(() => {
    setShowConfirm(false);
    onClearHistory();
  }, [onClearHistory]);

  const FILTERS: { value: HistoryFilter; label: string }[] = [
    { value: "all", label: t("history.filter.all") },
    { value: "new", label: t("history.filter.new") },
    { value: "duplicates", label: t("history.filter.duplicates") },
  ];

  if (showConfirm) {
    return (
      <div className="bg-surface-700/40 rounded-2xl p-5 text-center space-y-4">
        <h3 className="font-semibold text-slate-200">
          {t("history.clearConfirmTitle")}
        </h3>
        <p className="text-sm text-slate-400">
          {t("history.clearConfirmMessage")}
        </p>
        <div className="flex gap-2 justify-center">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setShowConfirm(false)}
          >
            {t("history.clearCancel")}
          </Button>
          <Button variant="danger" size="sm" onClick={handleClear}>
            {t("history.clearConfirm")}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 h-full">
      {/* Controls */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Filter tabs */}
        <div className="flex gap-1 bg-surface-700/40 rounded-xl p-1">
          {FILTERS.map((f) => (
            <button
              key={f.value}
              type="button"
              onClick={() => setFilter(f.value)}
              className={[
                "px-3 py-1 rounded-lg text-xs font-medium transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500",
                filter === f.value
                  ? "bg-accent-600 text-white"
                  : "text-slate-400 hover:text-slate-200",
              ].join(" ")}
              aria-pressed={filter === f.value}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Clear button */}
        {history.length > 0 && (
          <button
            type="button"
            onClick={() => setShowConfirm(true)}
            className="ml-auto text-xs text-slate-500 hover:text-rose-400 flex items-center gap-1 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 rounded"
          >
            <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
            {t("history.clearHistory")}
          </button>
        )}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-1.5 min-h-0">
        {filtered.length === 0 ? (
          <div className="text-center py-8 text-slate-500 text-sm">
            {history.length === 0
              ? t("history.empty")
              : t("history.emptyFiltered")}
          </div>
        ) : (
          filtered.map((roll) => {
            const country = COUNTRY_MAP.get(roll.countryId);
            if (!country) return null;
            const name = t(`countries.${roll.countryId}.name`, {
              defaultValue: roll.countryId,
            });

            return (
              <div
                key={roll.id}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-surface-700/20 border border-slate-700/20"
              >
                <div className="w-8 h-6 flex-shrink-0 flex items-center justify-center rounded-[2px] overflow-hidden shadow-sm border border-white/5">
                  <Flag countryId={country.id} className="w-full h-full" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-200 truncate">
                    {name}
                  </p>
                  <p className="text-xs text-slate-500">
                    {formatRelativeTime(roll.rolledAt, locale)}
                  </p>
                </div>
                <Badge variant={roll.isNew ? "new" : "duplicate"}>
                  {roll.isNew ? t("history.new") : t("history.duplicate")}
                </Badge>
              </div>
            );
          })
        )}
      </div>

      {/* Count */}
      {filtered.length > 0 && (
        <p className="text-xs text-slate-600 text-center">
          {filtered.length} {filter === "all" ? "" : `/ ${history.length}`}
        </p>
      )}
    </div>
  );
}
