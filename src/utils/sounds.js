/**
 * Sound effects using the Web Audio API – no external files needed.
 * Each function synthesises a short sound programmatically.
 */

let audioCtx = null;

function getCtx() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  return audioCtx;
}

/** Short click / flip sound */
export function playFlip() {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(880, ctx.currentTime);
    o.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.08);
    g.gain.setValueAtTime(0.15, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.12);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.12);
  } catch (_) { /* silent fail */ }
}

/** Match success chime */
export function playMatch() {
  try {
    const ctx = getCtx();
    [523, 659, 784].forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.1);
      g.gain.setValueAtTime(0.12, ctx.currentTime + i * 0.1);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.1 + 0.25);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.1);
      o.stop(ctx.currentTime + i * 0.1 + 0.25);
    });
  } catch (_) { /* silent fail */ }
}

/** Mismatch buzz */
export function playMismatch() {
  try {
    const ctx = getCtx();
    const o = ctx.createOscillator();
    const g = ctx.createGain();
    o.type = 'sawtooth';
    o.frequency.setValueAtTime(180, ctx.currentTime);
    g.gain.setValueAtTime(0.08, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    o.connect(g).connect(ctx.destination);
    o.start(ctx.currentTime);
    o.stop(ctx.currentTime + 0.2);
  } catch (_) { /* silent fail */ }
}

/** Victory fanfare */
export function playWin() {
  try {
    const ctx = getCtx();
    const notes = [523, 587, 659, 784, 880, 1047];
    notes.forEach((freq, i) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(freq, ctx.currentTime + i * 0.12);
      g.gain.setValueAtTime(0.13, ctx.currentTime + i * 0.12);
      g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.12 + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(ctx.currentTime + i * 0.12);
      o.stop(ctx.currentTime + i * 0.12 + 0.35);
    });
  } catch (_) { /* silent fail */ }
}
