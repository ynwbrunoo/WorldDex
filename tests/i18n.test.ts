import { describe, it, expect } from 'vitest';
import { formatNumber, formatPercentage, formatDate, formatCompactNumber, formatBirthChance } from '../src/utils/formatting';
import { computeProgress } from '../src/utils/mapUtils';
import { COUNTRIES } from '../src/data/countries';
import { createInitialSave } from '../src/store/storage';

// ─────────────────────────────────────────────
// i18n / locale formatting tests
// ─────────────────────────────────────────────

describe('formatNumber', () => {
  it('formats a large number with locale separators', () => {
    const enResult = formatNumber(1_430_000_000, 'en');
    expect(enResult).toMatch(/1[,.]?430/);

    const ptResult = formatNumber(1_430_000_000, 'pt-PT');
    expect(ptResult.length).toBeGreaterThan(5); // has separators
  });

  it('formats zero correctly', () => {
    expect(formatNumber(0, 'en')).toBe('0');
  });
});

describe('formatPercentage', () => {
  it('formats a fraction as percentage', () => {
    const result = formatPercentage(0.184, 'en');
    expect(result).toContain('18');
    expect(result).toContain('%');
  });

  it('formats 100% correctly', () => {
    const result = formatPercentage(1.0, 'en');
    expect(result).toContain('100');
  });

  it('formats very small probabilities', () => {
    const result = formatPercentage(0.0006, 'en', 4);
    expect(result).toContain('%');
    expect(result.length).toBeGreaterThan(0);
  });
});

describe('formatBirthChance', () => {
  it('handles large probability (India ~18%)', () => {
    const result = formatBirthChance(0.184, 'en');
    expect(result).toContain('18');
    expect(result).toContain('%');
  });

  it('handles small probability (Portugal ~0.06%)', () => {
    const result = formatBirthChance(0.0006, 'en');
    expect(result).toContain('%');
  });

  it('handles tiny probability (Monaco)', () => {
    const result = formatBirthChance(0.000001, 'en');
    expect(result).toContain('%');
  });
});

describe('formatDate', () => {
  it('formats a valid ISO date', () => {
    const result = formatDate('2024-03-15T10:00:00.000Z', 'en');
    expect(result).toContain('2024');
    expect(result.length).toBeGreaterThan(4);
  });

  it('returns original string for invalid date', () => {
    const badDate = 'not-a-date';
    const result = formatDate(badDate, 'en');
    expect(result).toBe(badDate);
  });

  it('formats in Portuguese locale', () => {
    const result = formatDate('2024-03-15T10:00:00.000Z', 'pt-PT');
    // Should contain the year
    expect(result).toContain('2024');
  });
});

describe('formatCompactNumber', () => {
  it('compacts large numbers', () => {
    const result = formatCompactNumber(25_000_000, 'en');
    // Should be something like "25M" in en
    expect(result.length).toBeLessThan(10);
  });

  it('handles small numbers without compact', () => {
    const result = formatCompactNumber(500, 'en');
    expect(result).toContain('500');
  });
});

// ─────────────────────────────────────────────
// Country data validation
// ─────────────────────────────────────────────

describe('COUNTRIES data', () => {
  it('has at least 150 countries', () => {
    expect(COUNTRIES.length).toBeGreaterThanOrEqual(150);
  });

  it('all probabilities are positive', () => {
    for (const c of COUNTRIES) {
      expect(c.birthProbability).toBeGreaterThan(0);
    }
  });

  it('probabilities sum to approximately 1.0', () => {
    const sum = COUNTRIES.reduce((s, c) => s + c.birthProbability, 0);
    expect(sum).toBeCloseTo(1.0, 3); // within 0.001
  });

  it('all countries have valid ISO alpha-2 codes (2 uppercase letters)', () => {
    const re = /^[A-Z]{2}$/;
    for (const c of COUNTRIES) {
      if (c.id === 'XK') continue; // Kosovo special case
      expect(c.id).toMatch(re);
    }
  });

  it('all numeric codes are positive', () => {
    for (const c of COUNTRIES) {
      expect(c.numericCode).toBeGreaterThan(0);
    }
  });

  it('all countries have non-empty flags', () => {
    for (const c of COUNTRIES) {
      expect(c.flag.length).toBeGreaterThan(0);
    }
  });

  it('India has the highest birth probability', () => {
    const india = COUNTRIES.find(c => c.id === 'IN');
    expect(india).toBeDefined();
    const maxProb = Math.max(...COUNTRIES.map(c => c.birthProbability));
    expect(india!.birthProbability).toBe(maxProb);
  });
});

// ─────────────────────────────────────────────
// Progress computation
// ─────────────────────────────────────────────

describe('computeProgress', () => {
  it('returns 0% with no unlocked countries', () => {
    const p = computeProgress(COUNTRIES, new Set(), []);
    expect(p.unlockedCount).toBe(0);
    expect(p.percentage).toBe(0);
  });

  it('computes correct unlocked count', () => {
    const unlocked = new Set(['IN', 'CN', 'PT']);
    const p = computeProgress(COUNTRIES, unlocked, []);
    expect(p.unlockedCount).toBe(3);
  });

  it('computes 100% when all are unlocked', () => {
    const allIds = new Set(COUNTRIES.map(c => c.id));
    const p = computeProgress(COUNTRIES, allIds, []);
    expect(p.percentage).toBeCloseTo(100, 0);
  });

  it('computes correct remaining count', () => {
    const unlocked = new Set(['IN']);
    const p = computeProgress(COUNTRIES, unlocked, []);
    expect(p.remaining).toBe(COUNTRIES.length - 1);
  });

  it('computes longest streak correctly', () => {
    const history = [
      { isNew: false }, // duplicate (latest)
      { isNew: true },
      { isNew: true },
      { isNew: true },
      { isNew: false }, // break
      { isNew: true },
      { isNew: true },
    ]; // reversed from oldest to newest: 2 new, break, 3 new, duplicate
    // Oldest to newest: true, true, false, true, true, true, false
    // Streaks: 2, then 3
    const p = computeProgress(COUNTRIES, new Set(['IN']), history.reverse());
    expect(p.longestStreak).toBe(3);
  });
});

// ─────────────────────────────────────────────
// Language persistence test
// ─────────────────────────────────────────────

describe('language persistence in save', () => {
  it('save data retains language setting', () => {
    const save = createInitialSave();
    expect(save.settings.language).toBe('pt-PT');

    const modified = { ...save, settings: { ...save.settings, language: 'en' } };
    expect(modified.settings.language).toBe('en');
    // Original unchanged
    expect(save.settings.language).toBe('pt-PT');
  });
});
