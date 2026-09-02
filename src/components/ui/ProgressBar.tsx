import React from "react";

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  /** Accessible label for screen readers */
  label: string;
  className?: string;
  /** Color variant */
  variant?:
    "accent" | "gold" | "rose" | "emerald" | "blue" | "violet" | "amber";
  /** Height class. Defaults to 'h-2'. */
  height?: string;
  /** Show percentage text. Defaults to false. */
  showValue?: boolean;
  /** Whether to animate the fill. Defaults to true. */
  animated?: boolean;
}

const VARIANT_CLASSES: Record<
  NonNullable<ProgressBarProps["variant"]>,
  string
> = {
  accent: "bg-accent-500",
  gold: "bg-gold-400",
  rose: "bg-rose-400",
  emerald: "bg-emerald-400",
  blue: "bg-blue-400",
  violet: "bg-violet-400",
  amber: "bg-amber-400",
};

export function ProgressBar({
  value,
  label,
  className = "",
  variant = "accent",
  height = "h-2",
  showValue = false,
  animated = true,
}: ProgressBarProps): React.ReactElement {
  const clampedValue = Math.min(Math.max(value, 0), 100);

  return (
    <div className={`w-full ${className}`}>
      {showValue && (
        <div
          className="text-xs text-slate-400 mb-1 text-right"
          aria-hidden="true"
        >
          {clampedValue.toFixed(0)}%
        </div>
      )}
      <div
        className={`w-full ${height} bg-slate-700/50 rounded-full overflow-hidden`}
        role="progressbar"
        aria-valuenow={clampedValue}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <div
          className={`${height} ${VARIANT_CLASSES[variant]} rounded-full ${animated ? "transition-all duration-700 ease-out" : ""}`}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  );
}
