import React, { useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { X, Globe, Dice6, Clock } from "lucide-react";
import { Button } from "@/components/ui/Button";

interface CompletionModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalRolls: number;
  unlockedCount: number;
}

/** Stable random values computed once per mount so confetti doesn't re-randomise on re-render */
function useConfettiPieces(count: number) {
  return useMemo(() => {
    const colors = [
      "#f59e0b", // amber
      "#10b981", // emerald
      "#3b82f6", // blue
      "#ec4899", // pink
      "#8b5cf6", // violet
      "#ef4444", // red
      "#06b6d4", // cyan
      "#84cc16", // lime
    ];
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      color: colors[Math.floor(Math.random() * colors.length)],
      left: `${Math.random() * 100}%`,
      width: `${6 + Math.random() * 8}px`,
      height: `${10 + Math.random() * 8}px`,
      delay: `${Math.random() * 2.5}s`,
      duration: `${2.5 + Math.random() * 2}s`,
      rotate: Math.random() > 0.5 ? "360deg" : "-360deg",
      shape: Math.random() > 0.4 ? "rect" : "circle",
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [count]);
}

/** Rough estimate: assume average 3 seconds per roll interaction */
function estimateTimePlayed(totalRolls: number): string {
  const minutes = Math.round((totalRolls * 3) / 60);
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rem = minutes % 60;
  return rem > 0 ? `${hours}h ${rem}m` : `${hours}h`;
}

/**
 * CompletionModal — full-screen celebration overlay shown when the player
 * unlocks ALL countries in WorldDex.
 */
export function CompletionModal({
  isOpen,
  onClose,
  totalRolls,
  unlockedCount,
}: CompletionModalProps): React.ReactElement {
  const { t } = useTranslation();
  const confetti = useConfettiPieces(40);

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Inject CSS keyframes once */}
      <style>{`
        @keyframes confetti-fall {
          0%   { transform: translateY(-10vh) rotate(0deg); opacity: 1; }
          80%  { opacity: 1; }
          100% { transform: translateY(110vh) rotate(var(--confetti-rotate)); opacity: 0; }
        }
        @keyframes confetti-sway {
          0%, 100% { margin-left: 0; }
          50%       { margin-left: 30px; }
        }
      `}</style>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="completion-modal-root"
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, pointerEvents: "auto" }}
            exit={{ opacity: 0, pointerEvents: "none" }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label={t("completion.title", "Mundo Completo!")}
          >
            {/* Dark backdrop */}
            <div
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              onClick={onClose}
            />

            {/* Confetti layer */}
            <div
              className="absolute inset-0 overflow-hidden pointer-events-none"
              aria-hidden="true"
            >
              {confetti.map((piece) => (
                <div
                  key={piece.id}
                  style={{
                    position: "absolute",
                    top: "-10px",
                    left: piece.left,
                    width: piece.width,
                    height: piece.height,
                    backgroundColor: piece.color,
                    borderRadius: piece.shape === "circle" ? "50%" : "2px",
                    animationName: "confetti-fall, confetti-sway",
                    animationDuration: `${piece.duration}, ${piece.duration}`,
                    animationDelay: piece.delay,
                    animationTimingFunction: "linear, ease-in-out",
                    animationIterationCount: "infinite",
                    // CSS custom property for rotate value
                    ["--confetti-rotate" as string]: piece.rotate,
                  }}
                />
              ))}
            </div>

            {/* Card */}
            <motion.div
              className="relative w-full max-w-md bg-surface-800 border border-white/10 rounded-2xl shadow-card overflow-hidden"
              initial={{ scale: 0.85, opacity: 0, y: 24 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.88, opacity: 0, y: 16 }}
              transition={{
                duration: 0.35,
                type: "spring",
                damping: 22,
                stiffness: 280,
              }}
            >
              {/* Close button */}
              <button
                type="button"
                onClick={onClose}
                aria-label={t("accessibility.closeModal", "Fechar")}
                className="absolute top-3 right-3 p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 z-10"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>

              {/* Hero section */}
              <div className="bg-gradient-to-b from-accent-900/40 to-surface-800 px-6 pt-10 pb-6 flex flex-col items-center text-center gap-3">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{
                    delay: 0.2,
                    type: "spring",
                    damping: 14,
                    stiffness: 200,
                  }}
                  className="text-7xl leading-none select-none"
                  aria-hidden="true"
                >
                  🌍
                </motion.div>

                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.35 }}
                  className="text-2xl font-bold text-slate-100 tracking-tight"
                >
                  {t("completion.title", "Mundo Completo!")}
                </motion.h2>

                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.45 }}
                  className="text-sm text-slate-300 leading-relaxed max-w-xs"
                >
                  {t(
                    "completion.description",
                    "Desbloqueaste todos os países do mundo. És um verdadeiro colecionador global!",
                  )}
                </motion.p>
              </div>

              {/* Stats */}
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.55 }}
                className="px-6 py-5 space-y-3"
              >
                <div className="grid grid-cols-2 gap-3">
                  {/* Countries unlocked */}
                  <div className="bg-surface-700/40 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-white/5">
                    <Globe
                      className="w-4 h-4 text-accent-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-base font-bold text-slate-100 leading-none">
                        {unlockedCount}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t("completion.countriesUnlocked", "Países")}
                      </p>
                    </div>
                  </div>

                  {/* Total rolls */}
                  <div className="bg-surface-700/40 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-white/5">
                    <Dice6
                      className="w-4 h-4 text-accent-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-base font-bold text-slate-100 leading-none">
                        {totalRolls.toLocaleString()}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t("progress.totalRolls", "Giros Totais")}
                      </p>
                    </div>
                  </div>

                  {/* Time estimate — spans full width */}
                  <div className="col-span-2 bg-surface-700/40 rounded-xl px-4 py-3 flex items-center gap-2.5 border border-white/5">
                    <Clock
                      className="w-4 h-4 text-accent-400 flex-shrink-0"
                      aria-hidden="true"
                    />
                    <div>
                      <p className="text-base font-bold text-slate-100 leading-none">
                        ~{estimateTimePlayed(totalRolls)}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {t("completion.timePlayed", "Tempo estimado a jogar")}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Close button */}
                <Button
                  variant="primary"
                  size="lg"
                  onClick={onClose}
                  className="w-full mt-1"
                >
                  {t("roll.close", "Fechar")}
                </Button>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
