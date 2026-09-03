// probe.js — headless Chromium game probe.
// Usage: node probe.js <file.html> [--vsync] [--seconds 20] [--input random|drag|none] [--viewport 1280x720] [--dpr 1] [--shots <dir>] [--shot-every 5] [--seed 1]
// Prints a JSON report: console/page errors, frame stats (fps, p1 low, worst frame), JS heap growth, screenshot paths.
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const args = process.argv.slice(2);
const file = args[0];
if (!file) { console.error('usage: node probe.js <file.html> [opts]'); process.exit(2); }
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const seconds = +opt('seconds', 20);
const input = opt('input', 'random');
const [vw, vh] = opt('viewport', '1280x720').split('x').map(Number);
const dpr = +opt('dpr', 1);
const shots = opt('shots', null);
const shotEvery = +opt('shot-every', 5);
let seed = +opt('seed', 1);
const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };

(async () => {
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium',
    args: ['--enable-precise-memory-info', '--use-gl=swiftshader', '--ignore-gpu-blocklist'].concat(args.includes('--vsync') ? [] : ['--disable-frame-rate-limit', '--disable-gpu-vsync']),
  });
  const ctx = await browser.newContext({ viewport: { width: vw, height: vh }, deviceScaleFactor: dpr, hasTouch: input === 'touch' });
  const page = await ctx.newPage();
  const consoleErrors = [], pageErrors = [], warnings = [];
  page.on('console', m => { if (m.type() === 'error') consoleErrors.push(m.text()); else if (m.type() === 'warning') warnings.push(m.text()); });
  page.on('pageerror', e => pageErrors.push(String(e && e.stack || e)));
  await page.addInitScript(() => {
    window.__probe = { frames: [], last: 0, longTasks: 0 };
    const raf = window.requestAnimationFrame.bind(window);
    window.requestAnimationFrame = cb => raf(t => { const p = window.__probe; if (p.last) p.frames.push(t - p.last); p.last = t; cb(t); });
  });
  const url = 'file://' + path.resolve(file);
  const t0 = Date.now();
  await page.goto(url, { waitUntil: 'load' });
  const heap0 = await page.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : -1);
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const shotPaths = [];
  const takeShot = async (tag) => { if (!shots) return; const p = path.join(shots, `shot-${tag}.png`); await page.screenshot({ path: p }); shotPaths.push(p); };
  await takeShot('00-load');
  // Dismiss any intro: click center, press a key
  await page.mouse.move(vw / 2, vh / 2);
  await page.mouse.click(vw / 2, vh / 2);
  await page.keyboard.press('Space');
  const heaps = [];
  let elapsed = 0, lastShot = 0, mx = vw / 2, my = vh / 2, down = false;
  while (elapsed < seconds * 1000) {
    const step = 100; // ms slice
    if (input === 'random') {
      const r = rnd();
      if (r < 0.15) { mx = rnd() * vw; my = rnd() * vh; await page.mouse.move(mx, my, { steps: 5 }); }
      else if (r < 0.30) { if (!down) { await page.mouse.down(); down = true; } else { await page.mouse.up(); down = false; } }
      else if (r < 0.40) { await page.mouse.move(mx + (rnd() - .5) * 200, my + (rnd() - .5) * 200, { steps: 8 }); }
      else if (r < 0.45) { const keys = ['Space', 'Shift', 'KeyR', 'Escape', 'ArrowLeft', 'ArrowRight', 'KeyZ']; await page.keyboard.press(keys[Math.floor(rnd() * keys.length)]); }
      else if (r < 0.48) { await page.mouse.wheel(0, (rnd() - .5) * 400); }
      else if (r < 0.50) { await page.mouse.click(rnd() * vw, rnd() * vh); }
    } else if (input === 'drag') {
      const a = elapsed / 1000; mx = vw / 2 + Math.cos(a) * vw * 0.35; my = vh / 2 + Math.sin(a * 1.3) * vh * 0.35;
      if (!down) { await page.mouse.move(mx, my); await page.mouse.down(); down = true; } else await page.mouse.move(mx, my, { steps: 4 });
    } else if (input === 'touch') {
      const a = elapsed / 1000; const x = vw / 2 + Math.cos(a) * vw * 0.3, y = vh / 2 + Math.sin(a * 1.7) * vh * 0.3;
      await page.touchscreen.tap(x, y);
    }
    await page.waitForTimeout(step);
    elapsed += step;
    if (elapsed % 2000 === 0) heaps.push(await page.evaluate(() => performance.memory ? performance.memory.usedJSHeapSize : -1));
    if (shots && elapsed - lastShot >= shotEvery * 1000) { lastShot = elapsed; await takeShot(String(Math.round(elapsed / 1000)).padStart(2, '0') + 's'); }
  }
  if (down) await page.mouse.up();
  // Resize stress
  await page.setViewportSize({ width: Math.max(320, Math.round(vw * 0.5)), height: Math.max(240, Math.round(vh * 0.6)) });
  await page.waitForTimeout(400);
  await takeShot('resize-small');
  await page.setViewportSize({ width: vw, height: vh });
  await page.waitForTimeout(400);
  // Visibility / tab-blur simulation: freeze rAF by emulating hidden state is not directly possible; instead stall main thread 1.5s
  await page.evaluate(() => { const t = performance.now(); while (performance.now() - t < 1500) {} });
  await page.waitForTimeout(600);
  await takeShot('after-stall');
  const frames = await page.evaluate(() => window.__probe.frames);
  const heap1 = await page.evaluate(() => { if (window.gc) window.gc(); return performance.memory ? performance.memory.usedJSHeapSize : -1; });
  await browser.close();
  const f = frames.filter(x => x > 0 && x < 2000);
  const sorted = [...f].sort((a, b) => a - b);
  const pct = q => sorted.length ? sorted[Math.min(sorted.length - 1, Math.floor(q * sorted.length))] : 0;
  const avg = f.reduce((a, b) => a + b, 0) / (f.length || 1);
  const stalled = f.filter(x => x > 1000).length; // frames after the deliberate stall
  const report = {
    file, seconds, input, viewport: `${vw}x${vh}@${dpr}`,
    frames: f.length,
    fps_avg: +(1000 / avg).toFixed(1),
    frame_ms: { avg: +avg.toFixed(2), p50: +pct(.5).toFixed(2), p95: +pct(.95).toFixed(2), p99: +pct(.99).toFixed(2), max: +(sorted[sorted.length - 1] || 0).toFixed(2) },
    frames_over_33ms: f.filter(x => x > 33.4).length,
    heap_mb: { start: +(heap0 / 1048576).toFixed(2), end: +(heap1 / 1048576).toFixed(2), samples: heaps.map(h => +(h / 1048576).toFixed(2)) },
    console_errors: consoleErrors.slice(0, 20), page_errors: pageErrors.slice(0, 20), warnings: warnings.slice(0, 10),
    screenshots: shotPaths,
    note: 'Headless swiftshader: absolute fps is NOT representative of a GPU browser; use frame_ms p95/max RELATIVE comparisons, error lists and heap growth. frames_over_33ms includes 1 deliberate 1.5s stall.',
  };
  console.log(JSON.stringify(report, null, 2));
})().catch(e => { console.error('PROBE FAILED', e); process.exit(1); });
