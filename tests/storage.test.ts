import { describe, it, expect, beforeEach } from 'vitest';
import {
  createInitialSave,
  validateSaveData,
  loadSave,
  persistSave,
  clearSave,
  importSaveFromJson,
  exportSaveAsJson,
} from '../src/store/storage';
import type { SaveData } from '../src/store/types';

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function makeSave(overrides: Partial<SaveData> = {}): SaveData {
  return { ...createInitialSave(), ...overrides };
}

// ─────────────────────────────────────────────
// createInitialSave
// ─────────────────────────────────────────────

describe('createInitialSave', () => {
  it('returns a version 1 save', () => {
    const save = createInitialSave();
    expect(save.version).toBe(1);
  });

  it('starts with empty collections', () => {
    const save = createInitialSave();
    expect(Object.keys(save.unlockedCountries)).toHaveLength(0);
    expect(save.rollHistory).toHaveLength(0);
    expect(save.totalRolls).toBe(0);
  });

  it('default language is pt-PT', () => {
    const save = createInitialSave();
    expect(save.settings.language).toBe('pt-PT');
  });
});

// ─────────────────────────────────────────────
// validateSaveData
// ─────────────────────────────────────────────

describe('validateSaveData', () => {
  it('validates a fresh save', () => {
    expect(validateSaveData(createInitialSave())).toBe(true);
  });

  it('rejects null', () => {
    expect(validateSaveData(null)).toBe(false);
  });

  it('rejects non-object', () => {
    expect(validateSaveData('string')).toBe(false);
    expect(validateSaveData(42)).toBe(false);
  });

  it('rejects wrong version', () => {
    expect(validateSaveData({ ...createInitialSave(), version: 2 })).toBe(false);
  });

  it('rejects missing required fields', () => {
    const { totalRolls: _, ...partial } = createInitialSave();
    expect(validateSaveData(partial)).toBe(false);
  });

  it('validates a save with unlock records', () => {
    const save = makeSave({
      unlockedCountries: {
        PT: { countryId: 'PT', unlockedAt: new Date().toISOString(), rollCount: 3 },
      },
      rollHistory: [
        { id: 'roll-1', countryId: 'PT', rolledAt: new Date().toISOString(), isNew: true },
      ],
      rollCounts: { PT: 3 },
      totalRolls: 3,
    });
    expect(validateSaveData(save)).toBe(true);
  });

  it('rejects corrupted unlock record', () => {
    const save = makeSave({
      unlockedCountries: {
        // @ts-expect-error — intentionally malformed
        PT: { countryId: 'PT', unlockedAt: 12345, rollCount: 'bad' },
      },
    });
    expect(validateSaveData(save)).toBe(false);
  });

  it('rejects invalid roll history entry', () => {
    const save = makeSave({
      // @ts-expect-error — intentionally malformed
      rollHistory: [{ id: 1, countryId: null }],
    });
    expect(validateSaveData(save)).toBe(false);
  });
});

// ─────────────────────────────────────────────
// localStorage persistence
// ─────────────────────────────────────────────

describe('localStorage persistence', () => {
  beforeEach(() => {
    clearSave();
  });

  it('loads fresh save when nothing is stored', () => {
    const { data, wasCorrupted } = loadSave();
    expect(data.version).toBe(1);
    expect(wasCorrupted).toBe(false);
  });

  it('round-trips a save correctly', () => {
    const save = makeSave({
      totalRolls: 42,
      settings: { language: 'en', tutorialCompleted: true, tutorialDismissed: false },
    });
    persistSave(save);

    const { data, wasCorrupted } = loadSave();
    expect(wasCorrupted).toBe(false);
    expect(data.totalRolls).toBe(42);
    expect(data.settings.language).toBe('en');
    expect(data.settings.tutorialCompleted).toBe(true);
  });

  it('reports corruption on invalid JSON', () => {
    localStorage.setItem('worldBirthGame.save.v1', 'not valid json {{{');
    const { data, wasCorrupted } = loadSave();
    expect(wasCorrupted).toBe(true);
    expect(data.version).toBe(1); // fresh save
  });

  it('reports corruption on wrong schema', () => {
    localStorage.setItem('worldBirthGame.save.v1', JSON.stringify({ foo: 'bar' }));
    const { wasCorrupted } = loadSave();
    expect(wasCorrupted).toBe(true);
  });
});

// ─────────────────────────────────────────────
// Export / Import
// ─────────────────────────────────────────────

describe('exportSaveAsJson / importSaveFromJson', () => {
  it('exports valid JSON', () => {
    const save = createInitialSave();
    const json = exportSaveAsJson(save);
    expect(() => JSON.parse(json)).not.toThrow();
  });

  it('imports exported save correctly', () => {
    const save = makeSave({ totalRolls: 99 });
    const json = exportSaveAsJson(save);
    const imported = importSaveFromJson(json);
    expect(imported).not.toBeNull();
    expect(imported?.totalRolls).toBe(99);
  });

  it('returns null for invalid JSON', () => {
    expect(importSaveFromJson('not json')).toBeNull();
  });

  it('returns null for valid JSON with wrong schema', () => {
    expect(importSaveFromJson('{"foo":"bar"}')).toBeNull();
  });

  it('includes exportedAt in exported JSON', () => {
    const json = exportSaveAsJson(createInitialSave());
    const parsed = JSON.parse(json);
    expect(parsed.exportedAt).toBeTruthy();
  });
});
