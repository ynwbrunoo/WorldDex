import { describe, it, expect } from 'vitest';
import { ACHIEVEMENTS } from '../src/data/achievements';
import { createInitialSave } from '../src/store/storage';
import { gameReducer, createInitialGameState } from '../src/store/gameReducer';
import type { GameState } from '../src/store/types';

// ─────────────────────────────────────────────
// Achievement definitions
// ─────────────────────────────────────────────

describe('ACHIEVEMENTS definition', () => {
  it('has 16 achievements', () => {
    expect(ACHIEVEMENTS).toHaveLength(16);
  });

  it('all achievements have unique IDs', () => {
    const ids = ACHIEVEMENTS.map(a => a.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(ACHIEVEMENTS.length);
  });

  it('all achievements have i18nKey', () => {
    for (const ach of ACHIEVEMENTS) {
      expect(ach.i18nKey).toBeTruthy();
    }
  });

  it('count achievements have a threshold', () => {
    const countAchs = ACHIEVEMENTS.filter(a => a.type === 'count');
    for (const ach of countAchs) {
      expect(ach.threshold).toBeGreaterThan(0);
    }
  });
});

// ─────────────────────────────────────────────
// Achievement unlock via reducer
// ─────────────────────────────────────────────

function makeStateWithRolls(unlockedCount: number): GameState {
  const save = createInitialSave();
  // Simulate unlocking countries
  for (let i = 0; i < unlockedCount; i++) {
    const id = `C${i}`;
    save.unlockedCountries[id] = {
      countryId: id,
      unlockedAt: new Date().toISOString(),
      rollCount: 1,
    };
    save.rollCounts[id] = 1;
    save.rollHistory.push({
      id: `roll-${i}`,
      countryId: id,
      rolledAt: new Date().toISOString(),
      isNew: true,
    });
    save.totalRolls++;
  }
  return createInitialGameState(save);
}

describe('achievement unlock via reducer UNLOCK_ACHIEVEMENT', () => {
  it('locks an achievement initially', () => {
    const state = makeStateWithRolls(0);
    expect(state.save.achievements['firstStep']?.unlockedAt).toBeFalsy();
  });

  it('unlocks an achievement', () => {
    const state = makeStateWithRolls(1);
    const newState = gameReducer(state, {
      type: 'UNLOCK_ACHIEVEMENT',
      payload: 'firstStep',
    });
    expect(newState.save.achievements['firstStep']?.unlockedAt).toBeTruthy();
  });

  it('does not re-unlock an already unlocked achievement', () => {
    const state = makeStateWithRolls(0);
    const state1 = gameReducer(state, {
      type: 'UNLOCK_ACHIEVEMENT',
      payload: 'firstStep',
    });
    const firstUnlockTime = state1.save.achievements['firstStep']?.unlockedAt;

    // Wait a ms
    const state2 = gameReducer(state1, {
      type: 'UNLOCK_ACHIEVEMENT',
      payload: 'firstStep',
    });
    expect(state2.save.achievements['firstStep']?.unlockedAt).toBe(firstUnlockTime);
  });
});

// ─────────────────────────────────────────────
// Progress-based achievement triggers
// ─────────────────────────────────────────────

describe('achievement progress calculation', () => {
  it('firstStep requires 1 unlock', () => {
    const firstStep = ACHIEVEMENTS.find(a => a.id === 'firstStep');
    expect(firstStep?.type).toBe('count');
    expect(firstStep?.threshold).toBe(1);
  });

  it('explorer requires 10 unlocks', () => {
    const explorer = ACHIEVEMENTS.find(a => a.id === 'explorer');
    expect(explorer?.threshold).toBe(10);
  });

  it('persistent requires 100 rolls', () => {
    const persistent = ACHIEVEMENTS.find(a => a.id === 'persistent');
    expect(persistent?.type).toBe('rolls');
    expect(persistent?.threshold).toBe(100);
  });

  it('luckyStreak requires 5-in-a-row', () => {
    const luckyStreak = ACHIEVEMENTS.find(a => a.id === 'luckyStreak');
    expect(luckyStreak?.type).toBe('streak');
    expect(luckyStreak?.threshold).toBe(5);
  });

  it('continentalMaster requires 3 continents', () => {
    const cm = ACHIEVEMENTS.find(a => a.id === 'continentalMaster');
    expect(cm?.type).toBe('continents');
    expect(cm?.continents).toBe(3);
  });
});
