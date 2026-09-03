// bot.js — plays REMANSO end-to-end through REAL mouse events, reading window.__game for targets.
// Usage: node bot.js <file.html> [--viewport 1280x720] [--dpr 1] [--timescale 2] [--max-minutes 14] [--shots <dir>] [--seed 7] [--from act0] [--vsync]
// Report: acts reached, glyph outcomes, elapsed, errors, frame stats. Exit 0 if the arc reaches 'dawn' with >= 4 of 6 glyphs saved and G1 never lost.
const { chromium } = require('playwright');
const path = require('path'); const fs = require('fs');
const args = process.argv.slice(2); const file = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const [vw, vh] = opt('viewport', '1280x720').split('x').map(Number);
const dpr = +opt('dpr', 1), timescale = +opt('timescale', 2), maxMin = +opt('max-minutes', 14), shots = opt('shots', null), from = opt('from', null);
let seed = +opt('seed', 7); const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
(async () => {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--enable-precise-memory-info', '--use-gl=swiftshader', '--ignore-gpu-blocklist'].concat(args.includes('--vsync') ? [] : ['--disable-frame-rate-limit', '--disable-gpu-vsync']) });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dpr });
  const page = await ctx.newPage();
  const errors = [], warnings = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); else if (m.type() === 'warning') warnings.push(m.text()); });
  page.on('pageerror', e => errors.push('PAGEERROR ' + String(e && e.stack || e)));
  await page.goto('file://' + path.resolve(file), { waitUntil: 'load' });
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const snap = () => page.evaluate(() => { try { return window.__game && window.__game.snapshot(); } catch (e) { return { error: String(e) }; } });
  const flow = (x, y) => page.evaluate(([x, y]) => { try { return window.__game.flowAt(x, y); } catch (e) { return { u: 0, v: 0, speed: 0 }; } }, [x, y]);
  const shot = async (tag) => { if (shots) await page.screenshot({ path: path.join(shots, `bot-${tag}.png`) }); };
  const log = [];
  const say = (s) => { log.push(s); process.stderr.write(s + '\n'); };
  let s0 = await snap();
  if (!s0 || s0.error) { console.log(JSON.stringify({ ok: false, reason: 'no window.__game.snapshot(): ' + (s0 && s0.error), errors }, null, 2)); await browser.close(); process.exit(1); }
  // first gesture (audio init) + timescale
  await page.mouse.move(vw / 2, vh * 0.6); await page.mouse.down(); await page.waitForTimeout(80); await page.mouse.up();
  await page.evaluate(k => window.__game.setTimeScale(k), timescale);
  await page.evaluate(n => window.__game.setSeed(n), 11);
  if (from) await page.evaluate(p => window.__game.skipToPhase(p), from);
  const t0 = Date.now(); const deadline = t0 + maxMin * 60000;
  const seenPhases = new Set(); const outcomes = {}; let lastPhase = null; let g1Lost = false; let holds = 0, stirs = 0;
  const priority = { FADING: 0, WISP: 1, LIVE: 2 };
  let lastShotPhase = null;
  while (Date.now() < deadline) {
    const s = await snap(); if (!s || s.error) { say('snapshot error ' + (s && s.error)); break; }
    if (s.phase !== lastPhase) { say(`t=${((Date.now() - t0) / 1000).toFixed(0)}s phase -> ${s.phase} (game t=${(s.t || 0).toFixed(0)})`); lastPhase = s.phase; seenPhases.add(s.phase); await shot(s.phase); }
    for (const g of (s.glyphs || [])) { outcomes[g.id] = g.state; if (g.id === 'G1' && (g.state === 'WISP' || g.state === 'PERMANENT')) g1Lost = true; }
    if (s.phase === 'dawn' || s.phase === 'epilogue') { await page.waitForTimeout(3000); await shot('dawn-mid'); break; }
    // choose target: an unresolved glyph, most endangered first
    const cands = (s.glyphs || []).filter(g => ['LIVE', 'FADING', 'WISP'].includes(g.state) && g.center);
    cands.sort((a, b) => (priority[a.state] - priority[b.state]) || (a.cohN - b.cohN));
    const g = cands[0];
    if (!g) { await page.mouse.move(vw / 2 + (rnd() - .5) * 40, vh * 0.6 + (rnd() - .5) * 40); await page.waitForTimeout(400); continue; }
    const cx = g.center.x, cy = g.center.y;
    // 1) counter-stir for ~1.5 s around the ghost, against local flow
    const f = await flow(cx, cy);
    if (f.speed > 15) {
      stirs++;
      const nx = -f.u / (f.speed || 1), ny = -f.v / (f.speed || 1);
      const span = Math.max(30, g.extentPx * 0.45);
      await page.mouse.move(cx - nx * span, cy - ny * span); await page.mouse.down();
      for (let k = 0; k < 4; k++) { await page.mouse.move(cx + nx * span, cy + ny * span, { steps: 6 }); await page.mouse.move(cx - nx * span + (rnd() - .5) * 20, cy - ny * span + (rnd() - .5) * 20, { steps: 6 }); }
      await page.mouse.up();
    }
    // 2) press-hold on the ghost centre up to ~10 s (game time), checking state
    holds++;
    await page.mouse.move(cx, cy, { steps: 3 }); await page.mouse.down();
    const holdStart = Date.now(); let resolved = false, lastState = g.state;
    while (Date.now() - holdStart < 10000 / Math.max(1, timescale) + 2000) {
      await page.waitForTimeout(250);
      const s2 = await snap(); const g2 = (s2.glyphs || []).find(x => x.id === g.id);
      if (g2) { lastState = g2.state; outcomes[g.id] = g2.state; }   // the post-transition state (LIFTING/STAR vs WISP/PERMANENT), not the stale pre-hold one
      if (!g2 || !['LIVE', 'FADING', 'WISP'].includes(g2.state)) { resolved = true; break; }
      if (s2.phase !== s.phase) break;
      // nudge the held pointer minimally (carry) so a stuck-still detector isn't fooled by zero events
      if ((Date.now() - holdStart) % 2000 < 260) await page.mouse.move(cx + (rnd() - .5) * 2, cy + (rnd() - .5) * 2);
    }
    await page.mouse.up();
    if (resolved) say(`  ${g.id} resolved -> ${lastState} after hold #${holds}`);
    await page.waitForTimeout(300);
  }
  const stats = await page.evaluate(() => { try { return window.__game.stats(); } catch (e) { return null; } });
  const final = await snap();
  await browser.close();
  const saved = Object.values(outcomes).filter(v => ['SET', 'LIFTING', 'STAR', 'DIM', 'RELIT'].includes(v)).length;
  const lost = Object.values(outcomes).filter(v => ['WISP', 'PERMANENT'].includes(v)).length;
  const ok = seenPhases.has('dawn') && saved >= 4 && !g1Lost && errors.length === 0;
  console.log(JSON.stringify({ ok, file, viewport: `${vw}x${vh}@${dpr}`, timescale, elapsed_s: Math.round((Date.now() - t0) / 1000), phases: [...seenPhases], outcomes, saved, lost, g1Lost, holds, stirs, sky: final && final.sky, stats, errors: errors.slice(0, 15), warnings: warnings.slice(0, 5), log: log.slice(-40) }, null, 2));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log(JSON.stringify({ ok: false, crash: String(e && e.stack || e) })); process.exit(1); });
