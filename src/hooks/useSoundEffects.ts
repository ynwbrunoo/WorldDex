import { useCallback, useEffect, useRef, useState } from "react";

const MUTE_KEY = "worlddex_mute";

/**
 * useSoundEffects — generates and plays synthetic game sounds via Web Audio API.
 * Stores mute preference in localStorage under 'worlddex_mute'.
 * No external audio files are used; all sounds are generated programmatically.
 */
export function useSoundEffects() {
  const [isMuted, setIsMuted] = useState<boolean>(() => {
    try {
      return localStorage.getItem(MUTE_KEY) === "true";
    } catch {
      return false;
    }
  });

  // Persist mute state
  useEffect(() => {
    try {
      localStorage.setItem(MUTE_KEY, String(isMuted));
    } catch {
      // Ignore storage errors
    }
  }, [isMuted]);

  const isMutedRef = useRef(isMuted);
  useEffect(() => {
    isMutedRef.current = isMuted;
  }, [isMuted]);

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev);
  }, []);

  /** Returns a fresh AudioContext, or null on failure. */
  const getCtx = useCallback((): AudioContext | null => {
    if (isMutedRef.current) return null;
    try {
      return new AudioContext();
    } catch {
      return null;
    }
  }, []);

  /**
   * playRoll — rapid ascending pitch sweep, 150 ms.
   * Simulates a "spin" whoosh.
   */
  const playRoll = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(300, t);
      osc.frequency.linearRampToValueAtTime(700, t + 0.15);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.06, t + 0.02);
      gain.gain.linearRampToValueAtTime(0, t + 0.15);

      osc.start(t);
      osc.stop(t + 0.15);
      osc.onended = () => ctx.close();
    } catch {
      ctx.close();
    }
  }, [getCtx]);

  /**
   * playSuspense — rising tone played during roll animation.
   */
  const playSuspense = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(200, t);
      osc.frequency.exponentialRampToValueAtTime(600, t + 1.5); // Rises over 1.5s

      // Increased volume from the original 0.04 to 0.15 to make it louder as requested previously
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.15, t + 0.1);
      gain.gain.linearRampToValueAtTime(0, t + 1.5);

      osc.start(t);
      osc.stop(t + 1.5);
      osc.onended = () => ctx.close();
    } catch {
      ctx.close();
    }
  }, [getCtx]);

  /**
   * playUnlock — chord tones depending on rarity
   */
  const playUnlock = useCallback(
    (rarityLabel: string = "Comum") => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        // Different chords/notes based on rarity
        let notes = [523.25, 659.25, 783.99]; // C5, E5, G5 (Comum)
        if (rarityLabel === "Incomum") notes = [587.33, 739.99, 880.0]; // D5, F#5, A5
        if (rarityLabel === "Raro") notes = [659.25, 830.61, 987.77]; // E5, G#5, B5
        if (rarityLabel === "Épico") notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6 (4 notes)
        if (rarityLabel === "Lendário")
          notes = [523.25, 659.25, 783.99, 1046.5, 1318.51]; // C5, E5, G5, C6, E6

        const noteDuration =
          rarityLabel === "Lendário" || rarityLabel === "Épico" ? 0.18 : 0.14;
        const gap = 0.02;

        notes.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.type =
            rarityLabel === "Lendário" || rarityLabel === "Épico"
              ? "triangle"
              : "sine";
          const t = ctx.currentTime + i * (noteDuration + gap);
          osc.frequency.setValueAtTime(freq, t);

          const volume =
            rarityLabel === "Lendário"
              ? 0.4
              : rarityLabel === "Épico"
                ? 0.35
                : 0.25;
          gain.gain.setValueAtTime(0, t);
          gain.gain.linearRampToValueAtTime(volume, t + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);

          osc.start(t);
          osc.stop(t + noteDuration);
          if (i === notes.length - 1) {
            osc.onended = () => ctx.close();
          }
        });
      } catch {
        ctx.close();
      }
    },
    [getCtx],
  );

  /**
   * playDuplicate — short low "thud" descending tone, 100 ms.
   * Pitch changes slightly based on rarity.
   */
  const playDuplicate = useCallback(
    (rarityLabel: string = "Comum") => {
      const ctx = getCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        let baseFreq = 250;
        if (rarityLabel === "Incomum") baseFreq = 300;
        if (rarityLabel === "Raro") baseFreq = 400;
        if (rarityLabel === "Épico") baseFreq = 500;
        if (rarityLabel === "Lendário") baseFreq = 600;

        osc.type = "sine";
        const t = ctx.currentTime;
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.linearRampToValueAtTime(baseFreq / 2, t + 0.15);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.25, t + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.start(t);
        osc.stop(t + 0.15);
        osc.onended = () => ctx.close();
      } catch {
        ctx.close();
      }
    },
    [getCtx],
  );

  /**
   * playAchievement — triumphant ascending fanfare, very loud and energetic.
   * Fast arpeggio leading to a ringing major chord.
   */
  const playAchievement = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const type = "square"; // Retro punchy synth

      // Fast rising arpeggio: C5, F5, A5, C6
      const arpeggio = [
        { freq: 523.25, delay: 0 },
        { freq: 698.46, delay: 0.08 },
        { freq: 880.0, delay: 0.16 },
        { freq: 1046.5, delay: 0.24 },
      ];

      arpeggio.forEach(({ freq, delay }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = type;
        const t = ctx.currentTime + delay;
        osc.frequency.setValueAtTime(freq, t);

        gain.gain.setValueAtTime(0, t);
        gain.gain.linearRampToValueAtTime(0.15, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

        osc.start(t);
        osc.stop(t + 0.15);
      });

      // Final triumphant chord: C6, F6, A6 (F major)
      const chord = [1046.5, 1396.91, 1760.0];
      const tChord = ctx.currentTime + 0.32;
      chord.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.type = "square";

        // Slight detune for a thicker sound
        osc.frequency.setValueAtTime(freq + i * 2, tChord);

        gain.gain.setValueAtTime(0, tChord);
        gain.gain.linearRampToValueAtTime(0.12, tChord + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.001, tChord + 1.2);

        osc.start(tChord);
        osc.stop(tChord + 1.2);
        if (i === chord.length - 1) {
          osc.onended = () => ctx.close();
        }
      });
    } catch {
      ctx.close();
    }
  }, [getCtx]);

  /**
   * playBuy — short coin "pling" high pitched, 150 ms.
   */
  const playBuy = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(1200, t);
      osc.frequency.linearRampToValueAtTime(1600, t + 0.05);
      osc.frequency.linearRampToValueAtTime(1200, t + 0.15);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.2, t + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);

      osc.start(t);
      osc.stop(t + 0.15);
      osc.onended = () => ctx.close();
    } catch {
      ctx.close();
    }
  }, [getCtx]);

  /**
   * playCoins — very short tick sound, 50 ms.
   * Used for coin counter animation ticks.
   */
  const playCoins = useCallback(() => {
    const ctx = getCtx();
    if (!ctx) return;
    try {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.type = "sine";
      const t = ctx.currentTime;
      osc.frequency.setValueAtTime(1800, t);

      gain.gain.setValueAtTime(0.08, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.05);

      osc.start(t);
      osc.stop(t + 0.05);
      osc.onended = () => ctx.close();
    } catch {
      ctx.close();
    }
  }, [getCtx]);

  return {
    playRoll,
    playUnlock,
    playDuplicate,
    playAchievement,
    playBuy,
    playCoins,
    playSuspense,
    isMuted,
    toggleMute,
  };
}
