import React, { useEffect, useRef, useCallback } from "react";
import { X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "framer-motion";
import { handleFocusTrap } from "@/utils/mapUtils";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  /** Max width class. Defaults to 'max-w-lg'. */
  maxWidth?: string;
  /** If true, clicking the backdrop closes the modal. Default: true. */
  closeOnBackdrop?: boolean;
  hideCloseButton?: boolean;
}

/**
 * Accessible modal dialog with:
 * - Focus trap
 * - Escape key close
 * - aria-modal + role="dialog"
 * - Click-outside dismiss
 * - Motion animation
 * - Scroll lock on open
 */
export function Modal({
  isOpen,
  onClose,
  title,
  children,
  maxWidth = "max-w-lg",
  closeOnBackdrop = true,
}: ModalProps): React.ReactElement | null {
  const { t } = useTranslation();
  const dialogRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  // Store and restore focus
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement;
      // Focus the dialog itself or first focusable element
      requestAnimationFrame(() => {
        dialogRef.current?.focus();
      });
      // Lock scroll
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      previousFocusRef.current?.focus();
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Escape key and focus trap
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (dialogRef.current) {
        handleFocusTrap(e.nativeEvent, dialogRef.current);
      }
    },
    [onClose],
  );

  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (closeOnBackdrop && e.target === e.currentTarget) {
        onClose();
      }
    },
    [closeOnBackdrop, onClose],
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={handleBackdropClick}
          aria-hidden={!isOpen}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
            onClick={closeOnBackdrop ? onClose : undefined}
          />

          {/* Dialog */}
          <motion.div
            ref={dialogRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            tabIndex={-1}
            className={`relative w-full ${maxWidth} bg-surface-800 border border-slate-700/50 rounded-2xl shadow-card outline-none overflow-hidden`}
            initial={{ scale: 0.92, opacity: 0, y: 12 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 8 }}
            transition={{
              duration: 0.2,
              type: "spring",
              damping: 25,
              stiffness: 300,
            }}
            onKeyDown={handleKeyDown}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
              <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
              <button
                type="button"
                onClick={onClose}
                aria-label={t("accessibility.closeModal")}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-100 hover:bg-slate-700/50 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500"
              >
                <X className="w-4 h-4" aria-hidden="true" />
              </button>
            </div>

            {/* Content */}
            <div className="px-6 py-5 max-h-[75vh] overflow-y-auto">
              {children}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
