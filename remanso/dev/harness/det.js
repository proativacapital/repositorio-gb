// det.js — determinism regression: two SOLO pages, different viewports/DPR, same seed, same scripted per-tick input → identical hashLog().
// Usage: node det.js <file.html> [--ticks 3600] [--timescale 3]
const { chromium } = require('playwright'); const path = require('path');
const args = process.argv.slice(2); const file = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const ticks = +opt('ticks', 3600), timescale = +opt('timescale', 3);
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--use-gl=swiftshader', '--disable-frame-rate-limit', '--disable-gpu-vsync'] });
  // scripted input: hover, stir, then hold on the water centre, in water-normalized coords, deterministic
  const log = []; let s = 3; const rnd = () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; };
  for (let t = 120; t < ticks; t += 2) { const ph = Math.floor(t / 600) % 3; if (ph === 0) log.push({ tick: t, x: 0.5 + 0.2 * Math.sin(t / 40), y: 0.5 + 0.15 * Math.cos(t / 33), down: t % 200 < 120 }); else if (ph === 1) log.push({ tick: t, x: 0.5, y: 0.5, down: true }); else log.push({ tick: t, x: 0.3 + 0.4 * rnd(), y: 0.3 + 0.4 * rnd(), down: rnd() < 0.5 }); }
  const run = async (vp, dpr) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr }); const page = await ctx.newPage(); const errors = [];
    page.on('pageerror', e => errors.push(String(e))); page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
    await page.goto('file://' + path.resolve(file), { waitUntil: 'load' });
    await page.evaluate(([log, k]) => { window.__game.setSeed(11); window.__game.scriptInput(log); window.__game.setTimeScale(k); window.__game.skipToPhase('act0'); }, [log, timescale]);
    const t0 = Date.now(); while (Date.now() - t0 < 300000) { const h = await page.evaluate(() => window.__game.stateHash()); if (h.tick >= ticks) break; await page.waitForTimeout(500); }
    const out = { hashes: await page.evaluate(() => window.__game.hashLog()), snap: await page.evaluate(() => { const s = window.__game.snapshot(); return { phase: s.phase, glyphs: (s.glyphs || []).map(g => g.id + ':' + g.state + ':' + (g.cohN || 0).toFixed(2)) }; }), errors };
    await ctx.close(); return out;
  };
  const A = await run({ width: 1280, height: 720 }, 1), B = await run({ width: 1920, height: 1080 }, 2);
  await browser.close();
  const bm = new Map(B.hashes.map(h => [h.tick, h.hash])); const cmp = A.hashes.filter(h => bm.has(h.tick)); const diff = cmp.filter(h => bm.get(h.tick) !== h.hash);
  const ok = cmp.length >= 5 && diff.length === 0 && A.errors.length === 0 && B.errors.length === 0;
  console.log(JSON.stringify({ ok, compared: cmp.length, first_divergence: diff[0] || null, A: A.snap, B: B.snap, errors: { A: A.errors.slice(0, 5), B: B.errors.slice(0, 5) } }, null, 2));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log(JSON.stringify({ ok: false, crash: String(e && e.stack || e) })); process.exit(1); });
