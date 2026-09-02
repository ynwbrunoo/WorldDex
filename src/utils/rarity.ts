/**
 * Rarity Utility
 * 
 * Calculates the rarity tier (Comum to Lendário) of a country based on its birth probability.
 * Includes color classes, badge styles, and geometrical symbols for colorblind accessibility.
 */
export type RarityTier = "Lendário" | "Épico" | "Raro" | "Incomum" | "Comum";

export interface RarityInfo {
  label: RarityTier;
  colorClass: string;
  badgeClass: string;
  symbol: string;
}

export function getCountryRarity(probability: number): RarityInfo {
  if (probability < 0.0005) {
    return {
      label: "Lendário",
      colorClass: "text-amber-400 drop-shadow-[0_0_12px_rgba(251,191,36,0.8)]",
      badgeClass: "bg-amber-400/20 text-amber-300 border-amber-400/50",
      symbol: "✦",
    };
  }
  if (probability < 0.0025) {
    return {
      label: "Épico",
      colorClass:
        "text-purple-400 drop-shadow-[0_0_10px_rgba(192,132,252,0.8)]",
      badgeClass: "bg-purple-400/20 text-purple-300 border-purple-400/50",
      symbol: "♦",
    };
  }
  if (probability < 0.01) {
    return {
      label: "Raro",
      colorClass: "text-blue-400 drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]",
      badgeClass: "bg-blue-400/20 text-blue-300 border-blue-400/50",
      symbol: "★",
    };
  }
  if (probability < 0.03) {
    return {
      label: "Incomum",
      colorClass: "text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]",
      badgeClass: "bg-emerald-400/20 text-emerald-300 border-emerald-400/50",
      symbol: "●",
    };
  }
  return {
    label: "Comum",
    colorClass: "text-slate-400 drop-shadow-[0_0_8px_rgba(148,163,184,0.5)]",
    badgeClass: "bg-slate-400/20 text-slate-300 border-slate-400/50",
    symbol: "○",
  };
}
