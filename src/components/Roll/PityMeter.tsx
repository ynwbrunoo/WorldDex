import React from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";

interface PityMeterProps {
  current: number;
  max: number;
}

export function PityMeter({
  current,
  max,
}: PityMeterProps): React.ReactElement | null {
  const { t } = useTranslation();

  // Hide completely if there's no pity system active (e.g. all 200 unlocked)
  if (max <= 0) return null;

  const progress = Math.min(100, (current / max) * 100);
  const isFull = current >= max;

  return (
    <div className="w-full flex flex-col gap-1.5 px-1 pb-2">
      <div className="flex justify-between items-center text-[10px] font-medium uppercase tracking-wider">
        <span
          className={isFull ? "text-accent-400 font-bold" : "text-slate-400"}
        >
          {isFull
            ? t("pity.guaranteedTitle", {
                defaultValue: "País Novo Garantido!",
              })
            : t("pity.title", { defaultValue: "Sorte Acumulada" })}
        </span>
        <span className={isFull ? "text-accent-400" : "text-slate-500"}>
          {current} / {max}
        </span>
      </div>

      <div className="h-1.5 w-full bg-surface-800 rounded-full overflow-hidden flex">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ type: "spring", stiffness: 100, damping: 15 }}
          className={`h-full rounded-full ${
            isFull
              ? "bg-gradient-to-r from-accent-500 to-amber-400"
              : "bg-accent-500/60"
          }`}
        />
      </div>

      {isFull && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-1.5 justify-center text-xs text-amber-400 mt-1"
        >
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>
            {t("pity.ready", {
              defaultValue: "O próximo roll vai ser mágico!",
            })}
          </span>
        </motion.div>
      )}
    </div>
  );
}
