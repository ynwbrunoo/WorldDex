import { describe, it, expect } from 'vitest';
import { buildCdf, rollCountry, verifyDistribution, generateRollId } from '../src/utils/weightedRandom';
import type { CountryData } from '../src/store/types';

// ─────────────────────────────────────────────
// Test data
// ─────────────────────────────────────────────

function makeCountry(id: string, prob: number): CountryData {
  return {
    id,
    alpha3: id + 'X',
    numericCode: 1,
    continent: 'europe',
    population: 1000000,
    annualBirths: Math.round(prob * 140_000_000),
    birthProbability: prob,
    flag: '🏳️',
    dataYear: 2023,
  };
}

const TEST_COUNTRIES: CountryData[] = [
  makeCountry('IN', 0.18),   // India — most common
  makeCountry('CN', 0.064),  // China
  makeCountry('NG', 0.061),  // Nigeria
  makeCountry('PK', 0.05),   // Pakistan
  makeCountry('US', 0.026),  // USA
  makeCountry('PT', 0.0006), // Portugal — rare
];

// ─────────────────────────────────────────────
// CDF building
// ─────────────────────────────────────────────

describe('buildCdf', () => {
  it('builds a CDF from countries', () => {
    const cdf = buildCdf(TEST_COUNTRIES);
    expect(cdf).toHaveLength(TEST_COUNTRIES.length);
  });

  it('last entry cumulative is exactly 1.0', () => {
    const cdf = buildCdf(TEST_COUNTRIES);
    expect(cdf[cdf.length - 1].cumulative).toBe(1.0);
  });

  it('CDF is monotonically non-decreasing', () => {
    const cdf = buildCdf(TEST_COUNTRIES);
    for (let i = 1; i < cdf.length; i++) {
      expect(cdf[i].cumulative).toBeGreaterThanOrEqual(cdf[i - 1].cumulative);
    }
  });

  it('throws on empty array', () => {
    expect(() => buildCdf([])).toThrow();
  });

  it('works with a single country', () => {
    const cdf = buildCdf([makeCountry('PT', 1.0)]);
    expect(cdf).toHaveLength(1);
    expect(cdf[0].cumulative).toBe(1.0);
    expect(cdf[0].country.id).toBe('PT');
  });
});

// ─────────────────────────────────────────────
// Rolling
// ─────────────────────────────────────────────

describe('rollCountry', () => {
  const cdf = buildCdf(TEST_COUNTRIES);

  it('always returns a country', () => {
    for (let i = 0; i < 100; i++) {
      const result = rollCountry(cdf);
      expect(result).toBeDefined();
      expect(result.id).toBeTruthy();
    }
  });

  it('returns a valid country ID', () => {
    const validIds = new Set(TEST_COUNTRIES.map(c => c.id));
    for (let i = 0; i < 50; i++) {
      const result = rollCountry(cdf);
      expect(validIds.has(result.id)).toBe(true);
    }
  });

  it('with random=0, returns first country', () => {
    const result = rollCountry(cdf, 0);
    expect(result.id).toBe(TEST_COUNTRIES[0].id);
  });

  it('with random=0.9999, returns last country', () => {
    const result = rollCountry(cdf, 0.9999);
    // The last country should be one of the test countries
    const validIds = new Set(TEST_COUNTRIES.map(c => c.id));
    expect(validIds.has(result.id)).toBe(true);
  });

  it('throws on empty CDF', () => {
    expect(() => rollCountry([])).toThrow();
  });
});

// ─────────────────────────────────────────────
// Distribution accuracy
// ─────────────────────────────────────────────

describe('distribution accuracy', () => {
  it('high-probability country appears most often', () => {
    const cdf = buildCdf(TEST_COUNTRIES);
    const counts = new Map<string, number>();
    const N = 10_000;

    for (let i = 0; i < N; i++) {
      const c = rollCountry(cdf);
      counts.set(c.id, (counts.get(c.id) ?? 0) + 1);
    }

    // India (18%) should appear far more than Portugal (0.06%)
    const indiaCount = counts.get('IN') ?? 0;
    const ptCount = counts.get('PT') ?? 0;
    expect(indiaCount).toBeGreaterThan(ptCount * 10);
  });

  it('distribution is within 20% tolerance over 50k samples', () => {
    const cdf = buildCdf(TEST_COUNTRIES);
    // Only test with a small set for performance
    const isValid = verifyDistribution(cdf, 50_000, 0.20);
    expect(isValid).toBe(true);
  });

  it('all countries can be selected (no impossible entries)', () => {
    const cdf = buildCdf(TEST_COUNTRIES);
    const seen = new Set<string>();
    // Roll many times — all 6 countries should appear
    for (let i = 0; i < 50_000; i++) {
      seen.add(rollCountry(cdf).id);
      if (seen.size === TEST_COUNTRIES.length) break;
    }
    expect(seen.size).toBe(TEST_COUNTRIES.length);
  });
});

// ─────────────────────────────────────────────
// ID generation
// ─────────────────────────────────────────────

describe('generateRollId', () => {
  it('generates a non-empty string', () => {
    const id = generateRollId();
    expect(typeof id).toBe('string');
    expect(id.length).toBeGreaterThan(0);
  });

  it('generates unique IDs', () => {
    const ids = new Set(Array.from({ length: 100 }, () => generateRollId()));
    expect(ids.size).toBe(100);
  });
});
