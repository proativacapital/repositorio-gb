# Debug API contract for REMANSO (required; consumed by harness/bot.js and harness/probe.js)

The game MUST expose `window.__game` at boot (before any gesture). It must never affect gameplay or visuals,
must not allocate in hot paths, and every method must be safe to call at any time (including before the first gesture).

```js
window.__game = {
  version: '1.0',
  snapshot() {                      // cheap, JSON-serializable, small (< 4 KB)
    return {
      phase: 'calibrate'|'act0'|'act1'|'act2'|'act3'|'dawn'|'epilogue',
      t: 12.3,                      // seconds since boot (game time, affected by timeScale)
      actT: 4.1,                    // seconds since the current act started
      rung: 0, quality: 'high'|'medium'|'low'|..., fps: 60,
      water: { x, y, w, h },        // water rect in CSS px
      glyphs: [ { id: 'G1', state: 'STAMPING'|'LIVE'|'FADING'|'WISP'|'SET'|'LIFTING'|'STAR'|'DIM'|'PERMANENT',
                  coh: 0.62, cohN: 0.83, eligible: true,
                  center: { x, y },  // ghost centre in CSS px
                  extentPx: 240 } ],
      remansos: [ { x, y, r, s, d, strain } ],   // CSS px, s = stillness 0..1, d = depth seconds
      pointers: 1,
      sky: { stars: 1, dim: 0, wisps: 0 },
      audio: { ok: true, running: true, muted: false },
    };
  },
  flowAt(x, y) { return { u, v, speed }; },   // local water velocity at a CSS-px point, in CSS px/s (0 outside water)
  setTimeScale(k),        // 1 = normal; bots may use up to 3; sim must stay stable (more fixed steps per frame, capped sanely)
  skipToPhase(name),      // 'act0'..'act3','dawn','epilogue' — jumps the director, resetting act state cleanly
  setSeed(n),             // reseed the PRNG (weather/noise/IR); Math.random must never be used by the game
  setQuality(q),          // force a quality ladder step (or 'auto')
  setRung(r),             // SOLO only: force grid rung 0|1|2 — clears the fields, history count = 0, re-derives the grid and the stamped masks; the calibrator and the ladder then leave the rung alone (det.js calls setRung(0) on both pages)
  stats() { return { frameMs: { avg, p95, max }, stepMs: { avg, p95, max }, renderMs: { avg, p95, max }, heapMB, quality, rung, steps }; },
};
```
Rules: no hidden cheat path — bots play through real DOM pointer events (Playwright mouse), the API is read-only + director control.
