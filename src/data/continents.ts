/** The 6-continent model used in this game (Antarctica excluded — no sovereign nations). */
export type ContinentKey =
  "africa" | "asia" | "europe" | "northAmerica" | "southAmerica" | "oceania";

export const ALL_CONTINENTS: ContinentKey[] = [
  "africa",
  "asia",
  "europe",
  "northAmerica",
  "southAmerica",
  "oceania",
];

/** i18n key suffix for the continent display name. */
export const CONTINENT_I18N_KEY: Record<ContinentKey, string> = {
  africa: "continents.africa",
  asia: "continents.asia",
  europe: "continents.europe",
  northAmerica: "continents.northAmerica",
  southAmerica: "continents.southAmerica",
  oceania: "continents.oceania",
};

/** Tailwind accent colors per continent (for continent progress cards). */
export const CONTINENT_COLOR: Record<ContinentKey, string> = {
  africa: "text-amber-400",
  asia: "text-rose-400",
  europe: "text-blue-400",
  northAmerica: "text-green-400",
  southAmerica: "text-emerald-400",
  oceania: "text-violet-400",
};

export const CONTINENT_BG: Record<ContinentKey, string> = {
  africa: "bg-amber-900/30 border-amber-700/40",
  asia: "bg-rose-900/30 border-rose-700/40",
  europe: "bg-blue-900/30 border-blue-700/40",
  northAmerica: "bg-green-900/30 border-green-700/40",
  southAmerica: "bg-emerald-900/30 border-emerald-700/40",
  oceania: "bg-violet-900/30 border-violet-700/40",
};
