import React from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "accent";
type ButtonSize = "sm" | "md" | "lg" | "xl";

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-accent-600 hover:bg-accent-500 text-white border border-accent-500/50 shadow-glow-accent hover:shadow-glow-accent",
  secondary:
    "bg-surface-700 hover:bg-surface-600 text-slate-200 border border-slate-600/50",
  ghost:
    "bg-transparent hover:bg-slate-700/50 text-slate-300 hover:text-slate-100 border border-transparent",
  danger: "bg-rose-700 hover:bg-rose-600 text-white border border-rose-600/50",
  accent:
    "bg-gradient-to-r from-accent-600 to-cyan-500 hover:from-accent-500 hover:to-cyan-400 text-white shadow-glow-accent",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "px-3 py-1.5 text-sm rounded-lg gap-1.5",
  md: "px-4 py-2 text-sm rounded-xl gap-2",
  lg: "px-5 py-2.5 text-base rounded-xl gap-2",
  xl: "px-8 py-4 text-lg font-bold rounded-2xl gap-3 tracking-wide",
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  icon?: React.ReactNode;
  iconRight?: React.ReactNode;
}

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  icon,
  iconRight,
  children,
  className = "",
  disabled,
  ...rest
}: ButtonProps): React.ReactElement {
  const isDisabled = disabled || loading;

  return (
    <button
      type="button"
      disabled={isDisabled}
      className={[
        "inline-flex items-center justify-center font-medium transition-all duration-150",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-accent-500 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-900",
        "active:scale-95",
        VARIANT_CLASSES[variant],
        SIZE_CLASSES[size],
        isDisabled
          ? "opacity-50 cursor-not-allowed active:scale-100"
          : "cursor-pointer",
        className,
      ].join(" ")}
      aria-busy={loading}
      {...rest}
    >
      {loading ? (
        <span
          className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"
          aria-hidden="true"
        />
      ) : (
        icon && <span aria-hidden="true">{icon}</span>
      )}
      {children}
      {iconRight && <span aria-hidden="true">{iconRight}</span>}
    </button>
  );
}
