import { describe, it, expect } from 'vitest';
import { gameReducer, createInitialGameState } from '../src/store/gameReducer';
import { createInitialSave } from '../src/store/storage';

// ─────────────────────────────────────────────
// Reducer tests
// ─────────────────────────────────────────────

function freshState() {
  return createInitialGameState(createInitialSave());
}

describe('gameReducer — ROLL', () => {
  it('increments totalRolls', () => {
    const state = freshState();
    const next = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    expect(next.save.totalRolls).toBe(1);
  });

  it('adds to roll history (newest first)', () => {
    let state = freshState();
    state = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    state = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'IN', isNew: true, rollId: 'r2' },
    });

    expect(state.save.rollHistory[0].countryId).toBe('IN'); // newest first
    expect(state.save.rollHistory[1].countryId).toBe('PT');
  });

  it('adds to unlockedCountries when isNew=true', () => {
    const state = freshState();
    const next = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    expect(next.save.unlockedCountries['PT']).toBeDefined();
    expect(next.save.unlockedCountries['PT'].rollCount).toBe(1);
  });

  it('does not add to unlockedCountries when isNew=false (but not yet unlocked)', () => {
    const state = freshState();
    const next = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: false, rollId: 'r1' },
    });
    expect(next.save.unlockedCountries['PT']).toBeUndefined();
  });

  it('sets lastRolledCountryId', () => {
    const state = freshState();
    const next = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    expect(next.lastRolledCountryId).toBe('PT');
  });

  it('sets showRollResult to true', () => {
    const state = freshState();
    const next = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    expect(next.showRollResult).toBe(true);
  });

  it('increments rollCounts', () => {
    let state = freshState();
    state = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    state = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: false, rollId: 'r2' },
    });
    expect(state.save.rollCounts['PT']).toBe(2);
  });
});

describe('gameReducer — RESET_PROGRESS', () => {
  it('clears all progress', () => {
    let state = freshState();
    // Add some data
    state = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    expect(state.save.totalRolls).toBe(1);

    const reset = gameReducer(state, { type: 'RESET_PROGRESS' });
    expect(reset.save.totalRolls).toBe(0);
    expect(Object.keys(reset.save.unlockedCountries)).toHaveLength(0);
    expect(reset.save.rollHistory).toHaveLength(0);
  });
});

describe('gameReducer — CLEAR_HISTORY', () => {
  it('removes all roll history', () => {
    let state = freshState();
    state = gameReducer(state, {
      type: 'ROLL',
      payload: { countryId: 'PT', isNew: true, rollId: 'r1' },
    });
    expect(state.save.rollHistory).toHaveLength(1);

    const cleared = gameReducer(state, { type: 'CLEAR_HISTORY' });
    expect(cleared.save.rollHistory).toHaveLength(0);
    // But unlocked countries remain
    expect(cleared.save.unlockedCountries['PT']).toBeDefined();
  });
});

describe('gameReducer — SET_LANGUAGE', () => {
  it('updates the language setting', () => {
    const state = freshState();
    const next = gameReducer(state, { type: 'SET_LANGUAGE', payload: 'en' });
    expect(next.save.settings.language).toBe('en');
  });

  it('does not affect other settings', () => {
    let state = freshState();
    state = gameReducer(state, { type: 'COMPLETE_TUTORIAL' });
    state = gameReducer(state, { type: 'SET_LANGUAGE', payload: 'fr' });
    expect(state.save.settings.tutorialCompleted).toBe(true);
    expect(state.save.settings.language).toBe('fr');
  });
});

describe('gameReducer — tutorial', () => {
  it('COMPLETE_TUTORIAL marks as completed', () => {
    const state = freshState();
    const next = gameReducer(state, { type: 'COMPLETE_TUTORIAL' });
    expect(next.save.settings.tutorialCompleted).toBe(true);
    expect(next.showTutorial).toBe(false);
  });

  it('SHOW_TUTORIAL re-shows tutorial', () => {
    let state = freshState();
    state = gameReducer(state, { type: 'COMPLETE_TUTORIAL' });
    state = gameReducer(state, { type: 'SHOW_TUTORIAL' });
    expect(state.showTutorial).toBe(true);
  });
});

describe('gameReducer — SELECT_COUNTRY', () => {
  it('sets selected country', () => {
    const state = freshState();
    const next = gameReducer(state, { type: 'SELECT_COUNTRY', payload: 'PT' });
    expect(next.selectedCountryId).toBe('PT');
  });

  it('clears selection with null', () => {
    let state = freshState();
    state = gameReducer(state, { type: 'SELECT_COUNTRY', payload: 'PT' });
    state = gameReducer(state, { type: 'SELECT_COUNTRY', payload: null });
    expect(state.selectedCountryId).toBeNull();
  });
});
