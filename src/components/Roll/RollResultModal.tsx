import React, { useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import { MapPin, X, Sparkles, RefreshCw } from "lucide-react";
import confetti from "canvas-confetti";
import { COUNTRY_MAP } from "@/data/countries";
import { useUserCountry } from "@/hooks/useUserCountry";
import { formatCompactNumber, formatBirthChance } from "@/utils/formatting";
import { getCountryRarity } from "@/utils/rarity";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Flag } from "@/components/ui/Flag";

interface RollResultModalProps {
  isOpen: boolean;
  countryId: string | null;
  isNew: boolean;
  onClose: () => void;
  onViewOnMap: (id: string) => void;
  locale: string;
  autoCloseTimer?: number | null;
}

export function RollResultModal({
  isOpen,
  countryId,
  isNew,
  onClose,
  onViewOnMap,
  locale,
  autoCloseTimer = null,
}: RollResultModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const country = countryId ? COUNTRY_MAP.get(countryId) : null;
  const userCountryId = useUserCountry();

  useEffect(() => {
    if (isOpen && countryId && countryId === userCountryId) {
      confetti({
        particleCount: 150,
        spread: 100,
        origin: { y: 0.6 },
        colors: ["#fbbf24", "#f59e0b", "#d97706", "#3b82f6", "#10b981"],
        zIndex: 9999,
      });
    }
  }, [isOpen, countryId, userCountryId]);

  useEffect(() => {
    if (isOpen && autoCloseTimer) {
      const timer = setTimeout(() => {
        onClose();
      }, autoCloseTimer);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoCloseTimer, onClose]);

  const handleViewOnMap = useCallback(() => {
    if (countryId) {
      onViewOnMap(countryId);
      onClose();
    }
  }, [countryId, onViewOnMap, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        onClose();
      }
    },
    [onClose],
  );

  if (!country) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6"
          onKeyDown={handleKeyDown}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />

          {/* Card */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={isNew ? t("roll.newCountry") : t("roll.duplicate")}
            className="relative w-full max-w-sm bg-surface-800 border border-slate-700/50 rounded-2xl shadow-card overflow-hidden"
            initial={{ y: 60, opacity: 0, scale: 0.92 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.94 }}
            transition={{ type: "spring", stiffness: 300, damping: 26 }}
          >
            {/* Glow bar on new unlock */}
            {isNew && (
              <div className="h-1 w-full bg-gradient-to-r from-accent-600 via-cyan-400 to-accent-600" />
            )}

            {/* Header */}
            <div className="flex items-start justify-between p-5 pb-0">
              <div className="flex items-center gap-2">
                {isNew ? (
                  <Badge variant="new">
                    <Sparkles className="w-3 h-3" aria-hidden="true" />
                    {t("roll.firstUnlock")}
                  </Badge>
                ) : (
                  <Badge variant="duplicate">
                    <RefreshCw className="w-3 h-3" aria-hidden="true" />
                    {t("roll.alreadyHave")}
                  </Badge>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("accessibility.closeModal")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Country info */}
            <div className="px-5 py-4 flex flex-col items-center">
              {/* Rarity Label */}
              {(() => {
                const { label, colorClass, symbol } = getCountryRarity(
                  country.birthProbability,
                );
                return (
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.2, type: "spring", damping: 12 }}
                    className={`text-[10px] font-black tracking-[0.2em] mb-3 ${colorClass}`}
                  >
                    <span aria-hidden="true" className="mr-1">
                      {symbol}
                    </span>
                    {label === "Lendário"
                      ? `🌟 LENDÁRIO 🌟`
                      : label.toUpperCase()}
                  </motion.div>
                );
              })()}

              {/* Flag + Name */}
              <div className="flex flex-col items-center gap-3 mb-4 w-full">
                <motion.div
                  initial={{ scale: 0, rotate: -10 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", delay: 0.1 }}
                  className="shadow-xl overflow-hidden rounded-[4px] border-2 border-white/10"
                >
                  <Flag
                    countryId={country.id}
                    countryName={t(`countries.${country.id}.name`, {
                      defaultValue: country.id,
                    })}
                    className="w-32 h-auto block"
                  />
                </motion.div>
                <div className="text-center">
                  <h2 className="text-2xl font-bold text-slate-100 leading-tight">
                    {t(`countries.${country.id}.name`, {
                      defaultValue: country.id,
                    })}
                  </h2>
                  <p className="text-sm text-slate-400 mt-0.5">
                    {t(`countries.${country.id}.capital`, { defaultValue: "" })}
                  </p>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid grid-cols-3 gap-3 mb-4 w-full">
                <div className="bg-surface-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">
                    {t("country.population")}
                  </p>
                  <p className="text-sm font-semibold text-slate-200">
                    {formatCompactNumber(country.population, locale)}
                  </p>
                </div>
                <div className="bg-surface-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">{`${t("country.annualBirths")} (10 Yrs)`}</p>
                  <p className="text-sm font-semibold text-slate-200">
                    {formatCompactNumber(country.annualBirths * 10, locale)}
                  </p>
                </div>
                <div className="bg-surface-700/50 rounded-xl p-3 text-center">
                  <p className="text-xs text-slate-500 mb-1">
                    {t("roll.estimatedChance")}
                  </p>
                  <p className="text-sm font-semibold text-accent-400">
                    {formatBirthChance(country.birthProbability, locale)}
                  </p>
                </div>
              </div>

              {/* Message */}
              <p className="text-center text-sm text-slate-400 mb-4">
                {isNew ? t("roll.newCountry") : t("roll.duplicate")}
              </p>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 w-full">
                <Button
                  variant="secondary"
                  size="md"
                  onClick={onClose}
                  className="w-full sm:flex-1"
                >
                  {t("roll.close")}
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleViewOnMap}
                  icon={<MapPin className="w-4 h-4" />}
                  className="w-full sm:flex-1"
                >
                  {t("roll.viewOnMap")}
                </Button>
              </div>

              <div className="mt-3 text-center text-[10px] text-slate-500 font-medium hidden sm:block">
                {t("roll.spacebarToClose", "Pressione [Espaço] para fechar")}
              </div>
            </div>

            {/* Auto Close Timer Progress Bar */}
            {autoCloseTimer && (
              <motion.div
                className="absolute bottom-0 left-0 h-1 bg-accent-500 opacity-60"
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: autoCloseTimer / 1000, ease: "linear" }}
              />
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
