/**
 * Locale-aware number, date, and percentage formatting.
 * All formatters use the Intl API — no external libraries required.
 */

function getSupportedLocale(locale: string): string {
  const customToPt = ["cv", "kmb", "umb", "kg"];
  if (customToPt.includes(locale)) return "pt-PT";
  return locale;
}

// ─────────────────────────────────────────────
// Number formatting
// ─────────────────────────────────────────────

/** Formats a large integer with locale-appropriate thousand separators. */
export function formatNumber(value: number, locale: string): string {
  try {
    return new Intl.NumberFormat(getSupportedLocale(locale), {
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return value.toLocaleString();
  }
}

/**
 * Formats a compact number (e.g., 25,000,000 → "25M" in en, "25 Mi" in pt).
 * Falls back to full formatting for very small numbers.
 */
export function formatCompactNumber(value: number, locale: string): string {
  try {
    if (value >= 1_000) {
      return new Intl.NumberFormat(getSupportedLocale(locale), {
        notation: "compact",
        compactDisplay: "short",
        maximumSignificantDigits: 3,
      }).format(value);
    }
    return formatNumber(value, locale);
  } catch {
    return formatNumber(value, locale);
  }
}

// ─────────────────────────────────────────────
// Percentage formatting
// ─────────────────────────────────────────────

/**
 * Formats a fraction (0–1) as a locale-aware percentage.
 * @param value     - Fraction, e.g. 0.184 for India
 * @param locale    - BCP-47 locale string
 * @param digits    - Significant digits after the decimal point
 */
export function formatPercentage(
  value: number,
  locale: string,
  digits = 4,
): string {
  try {
    return new Intl.NumberFormat(getSupportedLocale(locale), {
      style: "percent",
      minimumFractionDigits: 2,
      maximumFractionDigits: digits,
    }).format(value);
  } catch {
    return `${(value * 100).toFixed(digits)}%`;
  }
}

/**
 * Formats a percentage from a 0–100 value (e.g., completion percentage).
 */
export function formatPercentageFromHundred(
  value: number,
  locale: string,
  digits = 1,
): string {
  return formatPercentage(value / 100, locale, digits);
}

// ─────────────────────────────────────────────
// Date / time formatting
// ─────────────────────────────────────────────

/** Formats an ISO 8601 timestamp as a short locale date. */
export function formatDate(isoTimestamp: string, locale: string): string {
  try {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) return isoTimestamp;
    return new Intl.DateTimeFormat(getSupportedLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  } catch {
    return isoTimestamp;
  }
}

/** Formats an ISO 8601 timestamp as a short locale date + time. */
export function formatDateTime(isoTimestamp: string, locale: string): string {
  try {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) return isoTimestamp;
    return new Intl.DateTimeFormat(getSupportedLocale(locale), {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  } catch {
    return isoTimestamp;
  }
}

/** Returns a relative time description (e.g., "2 days ago"). */
export function formatRelativeTime(
  isoTimestamp: string,
  locale: string,
): string {
  try {
    const date = new Date(isoTimestamp);
    if (isNaN(date.getTime())) return formatDate(isoTimestamp, locale);

    const diffMs = Date.now() - date.getTime();
    const diffSec = Math.round(diffMs / 1000);
    const diffMin = Math.round(diffSec / 60);
    const diffHour = Math.round(diffMin / 60);
    const diffDay = Math.round(diffHour / 24);

    if (typeof Intl.RelativeTimeFormat !== "undefined") {
      const rtf = new Intl.RelativeTimeFormat(getSupportedLocale(locale), {
        numeric: "auto",
      });
      if (Math.abs(diffDay) >= 1) return rtf.format(-diffDay, "day");
      if (Math.abs(diffHour) >= 1) return rtf.format(-diffHour, "hour");
      if (Math.abs(diffMin) >= 1) return rtf.format(-diffMin, "minute");
      return rtf.format(-diffSec, "second");
    }

    // Fallback
    return formatDate(isoTimestamp, locale);
  } catch {
    return formatDate(isoTimestamp, locale);
  }
}

// ─────────────────────────────────────────────
// Population / births helpers
// ─────────────────────────────────────────────

/**
 * Formats population with compact notation for large numbers.
 * E.g., 1,430,000,000 → "1.43B" (en) or "1,43 mil Mi." (pt-PT)
 */
export function formatPopulation(pop: number, locale: string): string {
  return formatCompactNumber(pop, locale);
}

/**
 * Formats the birth probability as a human-readable percentage.
 * Very small probabilities show more decimal places.
 */
export function formatBirthChance(probability: number, locale: string): string {
  if (probability >= 0.001) {
    return formatPercentage(probability, locale, 2);
  }
  if (probability >= 0.0001) {
    return formatPercentage(probability, locale, 3);
  }
  return formatPercentage(probability, locale, 4);
}
