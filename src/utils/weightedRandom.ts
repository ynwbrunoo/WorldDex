import type { CountryData } from "@/store/types";

// ─────────────────────────────────────────────
// Weighted random selection
// ─────────────────────────────────────────────

/**
 * Cumulative probability distribution entry.
 * Built once, reused for O(log n) lookups.
 */
interface CdfEntry {
  cumulative: number;
  country: CountryData;
}

/**
 * Builds a Cumulative Distribution Function (CDF) from a list of countries.
 * The CDF is sorted by cumulative probability ascending.
 *
 * We normalize here to guarantee the sum is exactly 1.0
 * even after floating-point rounding.
 */
export function buildCdf(countries: CountryData[]): CdfEntry[] {
  if (countries.length === 0) {
    throw new Error("Cannot build CDF from empty country list.");
  }

  // Normalize to defend against floating-point drift
  const totalProbability = countries.reduce(
    (s, c) => s + c.birthProbability,
    0,
  );

  const cdf: CdfEntry[] = [];
  let cumulative = 0;

  for (const country of countries) {
    cumulative += country.birthProbability / totalProbability;
    cdf.push({ cumulative, country });
  }

  // Force the last entry to exactly 1.0 to avoid edge-case misses
  cdf[cdf.length - 1].cumulative = 1.0;

  return cdf;
}

/**
 * Selects a country using binary search over a pre-built CDF.
 *
 * Time complexity: O(log n)
 * The selection is unbiased — the probability of selecting country i
 * is proportional to its birthProbability.
 *
 * @param cdf    - Pre-built CDF from `buildCdf`
 * @param random - A random number in [0, 1). Defaults to Math.random().
 *                 Accepts an override for deterministic testing.
 */
export function rollCountry(
  cdf: CdfEntry[],
  random: number = Math.random(),
): CountryData {
  if (cdf.length === 0) {
    throw new Error("CDF is empty — cannot select a country.");
  }

  // Clamp to [0, 1) just in case
  const r = Math.min(Math.max(random, 0), 0.9999999999);

  // Binary search for the first CDF entry >= r
  let lo = 0;
  let hi = cdf.length - 1;

  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (cdf[mid].cumulative < r) {
      lo = mid + 1;
    } else {
      hi = mid;
    }
  }

  return cdf[lo].country;
}

// ─────────────────────────────────────────────
// Statistical utilities (for testing)
// ─────────────────────────────────────────────

/**
 * Runs `iterations` rolls and returns a frequency map.
 * Useful for verifying distribution accuracy in tests.
 */
export function sampleDistribution(
  cdf: CdfEntry[],
  iterations: number,
): Map<string, number> {
  const counts = new Map<string, number>();

  for (let i = 0; i < iterations; i++) {
    const country = rollCountry(cdf);
    counts.set(country.id, (counts.get(country.id) ?? 0) + 1);
  }

  return counts;
}

/**
 * Checks that all country IDs in the CDF are sampled within a tolerance
 * of their expected probability over many iterations.
 * Returns true if the distribution is within tolerance for all entries.
 *
 * @param cdf        - The distribution to test
 * @param iterations - Number of samples (more = more accurate)
 * @param tolerance  - Maximum allowed relative error (e.g. 0.15 = 15%)
 */
export function verifyDistribution(
  cdf: CdfEntry[],
  iterations = 100_000,
  tolerance = 0.15,
): boolean {
  const counts = sampleDistribution(cdf, iterations);
  const totalProbability = cdf.reduce(
    (s, e) =>
      s +
      (e.cumulative -
        (cdf.indexOf(e) > 0 ? cdf[cdf.indexOf(e) - 1].cumulative : 0)),
    0,
  );

  // For each country, check if observed frequency is within tolerance
  for (const entry of cdf) {
    const observed = (counts.get(entry.country.id) ?? 0) / iterations;
    const idx = cdf.indexOf(entry);
    const expected = entry.cumulative - (idx > 0 ? cdf[idx - 1].cumulative : 0);

    const normalizedExpected = expected / totalProbability;

    // Allow minimum of 0.0001 to avoid division by zero on tiny countries
    const relativeError =
      normalizedExpected > 0.0001
        ? Math.abs(observed - normalizedExpected) / normalizedExpected
        : 0;

    if (relativeError > tolerance) {
      console.warn(
        `[verifyDistribution] ${entry.country.id}: expected ${normalizedExpected.toFixed(6)}, ` +
          `got ${observed.toFixed(6)} (${(relativeError * 100).toFixed(1)}% error)`,
      );
      return false;
    }
  }

  return true;
}

// ─────────────────────────────────────────────
// ID generation
// ─────────────────────────────────────────────

/**
 * Generates a unique roll ID using crypto.randomUUID() when available,
 * falling back to a timestamp + random suffix.
 */
export function generateRollId(): string {
  if (
    typeof crypto !== "undefined" &&
    typeof crypto.randomUUID === "function"
  ) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}
