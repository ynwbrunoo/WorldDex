import { useCallback, useRef, useState } from "react";
import type { ToastItem } from "@/store/types";

const TOAST_DURATION_MS = 4000;
const ACHIEVEMENT_TOAST_DURATION_MS = 6000;

export interface UseToastReturn {
  toasts: ToastItem[];
  addToast: (item: Omit<ToastItem, "id"> & { id?: string }) => void;
  removeToast: (id: string) => void;
}

/**
 * Self-contained toast manager.
 * Toasts auto-dismiss after a duration.
 */
export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timers.current.delete(id);
    }
  }, []);

  const addToast = useCallback(
    (item: Omit<ToastItem, "id"> & { id?: string }) => {
      const id =
        item.id ??
        `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

      const toast: ToastItem = { ...item, id };

      setToasts((prev) => {
        // Deduplicate by id
        const filtered = prev.filter((t) => t.id !== id);
        return [...filtered, toast];
      });

      const duration =
        item.type === "achievement"
          ? ACHIEVEMENT_TOAST_DURATION_MS
          : TOAST_DURATION_MS;

      // Clear any existing timer for this id
      const existing = timers.current.get(id);
      if (existing) clearTimeout(existing);

      const timer = setTimeout(() => {
        removeToast(id);
      }, duration);

      timers.current.set(id, timer);
    },
    [removeToast],
  );

  return { toasts, addToast, removeToast };
}
