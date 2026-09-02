import React from "react";

type BadgeVariant =
  | "new"
  | "duplicate"
  | "locked"
  | "unlocked"
  | "achievement"
  | "continent"
  | "default";

const VARIANT_CLASSES: Record<BadgeVariant, string> = {
  new: "bg-accent-600/20 text-accent-300 border border-accent-500/30",
  duplicate: "bg-slate-700/50 text-slate-400 border border-slate-600/30",
  locked: "bg-slate-800/50 text-slate-500 border border-slate-700/30",
  unlocked: "bg-teal-900/40 text-teal-300 border border-teal-700/30",
  achievement: "bg-gold-600/20 text-gold-300 border border-gold-500/30",
  continent: "bg-slate-700/50 text-slate-300 border border-slate-600/30",
  default: "bg-slate-700/50 text-slate-300 border border-slate-600/30",
};

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  children,
  className = "",
}: BadgeProps): React.ReactElement {
  return (
    <span
      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${VARIANT_CLASSES[variant]} ${className}`}
    >
      {children}
    </span>
  );
}
