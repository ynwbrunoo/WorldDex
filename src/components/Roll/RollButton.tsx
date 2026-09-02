import React, { useCallback } from "react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Shuffle } from "lucide-react";
import { COUNTRIES } from "@/data/countries";

interface RollButtonProps {
  onRoll: () => void;
  isRolling: boolean;
  disabled?: boolean;
  rouletteText?: string | null;
  highlightId?: string | null;
}

/**
 * The primary game action button.
 * Large, accessible, visually prominent with animation feedback.
 */
export function RollButton({
  onRoll,
  isRolling,
  disabled = false,
  rouletteText,
  highlightId,
}: RollButtonProps): React.ReactElement {
  const { t } = useTranslation();

  const handleClick = useCallback(() => {
    if (!isRolling && !disabled) onRoll();
  }, [onRoll, isRolling, disabled]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        handleClick();
      }
    },
    [handleClick],
  );

  return (
    <motion.button
      type="button"
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      disabled={isRolling || disabled}
      aria-label={t("accessibility.rollButton")}
      aria-busy={isRolling}
      className={[
        "relative group inline-flex items-center justify-center gap-3 overflow-hidden",
        "w-full py-5 rounded-3xl",
        "text-xl font-black tracking-widest text-white uppercase truncate",
        (() => {
          if (isRolling && highlightId) {
            const hlCountry = COUNTRIES.find((c) => c.id === highlightId);
            if (hlCountry) {
              const p = hlCountry.birthProbability;
              if (p < 0.0005)
                return "bg-gradient-to-br from-amber-400 to-orange-500 border-b-4 border-r-2 border-amber-600 shadow-[0_8px_30px_rgba(251,191,36,0.6),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white";
              if (p < 0.0025)
                return "bg-gradient-to-br from-purple-500 to-fuchsia-600 border-b-4 border-r-2 border-purple-700 shadow-[0_8px_30px_rgba(192,132,252,0.6),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white";
              if (p < 0.01)
                return "bg-gradient-to-br from-blue-400 to-indigo-500 border-b-4 border-r-2 border-blue-600 shadow-[0_8px_30px_rgba(96,165,250,0.6),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white";
              if (p < 0.05)
                return "bg-gradient-to-br from-emerald-400 to-teal-500 border-b-4 border-r-2 border-emerald-600 shadow-[0_8px_30px_rgba(52,211,153,0.6),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white";
              return "bg-gradient-to-br from-slate-400 to-slate-500 border-b-4 border-r-2 border-slate-600 shadow-[0_8px_30px_rgba(148,163,184,0.6),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white";
            }
          }
          return "bg-gradient-to-br from-accent-500 to-blue-600 border-b-4 border-r-2 border-accent-700 shadow-[0_8px_30px_rgba(6,182,212,0.5),inset_0_4px_10px_rgba(255,255,255,0.4)] text-white";
        })(),
        "transition-all duration-150",
        "focus:outline-none focus-visible:ring-4 focus-visible:ring-accent-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-950",
        isRolling || disabled
          ? "cursor-not-allowed opacity-90 scale-95 border-b-0 border-r-0 translate-y-1"
          : "cursor-pointer hover:shadow-[0_15px_40px_rgba(6,182,212,0.6),inset_0_4px_15px_rgba(255,255,255,0.5)] hover:-translate-y-1 active:border-b-0 active:border-r-0 active:translate-y-1 active:shadow-[0_0px_10px_rgba(6,182,212,0.5),inset_0_4px_10px_rgba(255,255,255,0.2)]",
      ].join(" ")}
      whileTap={isRolling || disabled ? {} : { scale: 0.98 }}
      whileHover={isRolling || disabled ? {} : { scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* Animated background gradient shimmer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 -skew-x-12"
        animate={isRolling ? { opacity: [0, 1, 0], x: ["-200%", "200%"] } : {}}
        transition={{ duration: 0.8, repeat: Infinity, ease: "easeInOut" }}
      />

      {isRolling ? (
        <span className="truncate flex-1 text-center" key={rouletteText}>
          {rouletteText || t("roll.rolling")}
        </span>
      ) : (
        <>
          <Shuffle className="w-5 h-5 flex-shrink-0" aria-hidden="true" />
          <span className="truncate">{t("roll.button")}</span>
        </>
      )}
    </motion.button>
  );
}
