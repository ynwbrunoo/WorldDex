import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Trophy, Info, CheckCircle, AlertCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import type { ToastItem } from "@/store/types";

// ─────────────────────────────────────────────
// Individual toast
// ─────────────────────────────────────────────

const ICON_MAP = {
  achievement: <Trophy className="w-4 h-4 text-gold-400" aria-hidden="true" />,
  info: <Info className="w-4 h-4 text-accent-400" aria-hidden="true" />,
  success: (
    <CheckCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
  ),
  error: <AlertCircle className="w-4 h-4 text-rose-400" aria-hidden="true" />,
};

const BORDER_MAP: Record<ToastItem["type"], string> = {
  achievement: "border-gold-500/30 bg-surface-800",
  info: "border-accent-500/30 bg-surface-800",
  success: "border-emerald-500/30 bg-surface-800",
  error: "border-rose-500/30 bg-surface-800",
};

const PROGRESS_MAP: Record<ToastItem["type"], string> = {
  achievement: "bg-gold-500",
  info: "bg-accent-500",
  success: "bg-emerald-500",
  error: "bg-rose-500",
};

interface ToastCardProps {
  toast: ToastItem;
  onRemove: (id: string) => void;
  onNavigate?: (panel: string) => void;
}

function ToastCard({
  toast,
  onRemove,
  onNavigate,
}: ToastCardProps): React.ReactElement {
  const { t } = useTranslation();

  // Auto-dismiss after 15s
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(toast.id);
    }, 15000);
    return () => clearTimeout(timer);
  }, [toast.id, onRemove]);

  // The message field is either an i18n key or a plain string
  const message = t(toast.message, { defaultValue: toast.message });

  const handleClick = () => {
    if (toast.type === "achievement" && onNavigate) {
      onNavigate("achievements");
      onRemove(toast.id);
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 16, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 40, scale: 0.96 }}
      transition={{ type: "spring", stiffness: 300, damping: 28 }}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      onClick={handleClick}
      className={`relative overflow-hidden flex items-start gap-3 px-4 py-3 rounded-xl border shadow-card w-72 ${BORDER_MAP[toast.type]} ${toast.type === "achievement" ? "cursor-pointer hover:brightness-110 transition-all" : ""}`}
    >
      <span className="mt-0.5 flex-shrink-0">{ICON_MAP[toast.type]}</span>
      <div className="flex-1 min-w-0">
        {toast.type === "achievement" && (
          <p className="text-xs font-medium text-gold-400 mb-0.5">
            {t("achievements.newUnlock")}
          </p>
        )}
        <p className="text-sm text-slate-200 leading-snug break-words">
          {message}
        </p>
        {toast.type === "achievement" && (
          <p className="text-[10px] text-slate-500 mt-1">
            {t("achievements.clickToView", "Clica para ver conquistas")}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          onRemove(toast.id);
        }}
        aria-label={t("accessibility.closeModal")}
        className="flex-shrink-0 p-0.5 rounded text-slate-500 hover:text-slate-300 transition-colors focus:outline-none focus-visible:ring-1 focus-visible:ring-accent-500"
      >
        <X className="w-3.5 h-3.5" aria-hidden="true" />
      </button>

      {/* Progress bar */}
      <motion.div
        className={`absolute bottom-0 left-0 h-1 opacity-70 ${PROGRESS_MAP[toast.type]}`}
        initial={{ width: "100%" }}
        animate={{ width: "0%" }}
        transition={{ duration: 15, ease: "linear" }}
      />
    </motion.div>
  );
}

// ─────────────────────────────────────────────
// Toast container
// ─────────────────────────────────────────────

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
  onNavigate?: (panel: string) => void;
}

export function ToastContainer({
  toasts,
  onRemove,
  onNavigate,
}: ToastContainerProps): React.ReactElement {
  return (
    <div
      className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end pointer-events-none"
      aria-label="Notifications"
    >
      <AnimatePresence initial={false} mode="sync">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastCard
              toast={toast}
              onRemove={onRemove}
              onNavigate={onNavigate}
            />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
