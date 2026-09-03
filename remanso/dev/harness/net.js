// net.js — two-browser online test for REMANSO. No internet needed: WebRTC over loopback + in-process mock MQTT broker.
// Usage: node net.js <file.html> [--via mqtt|manual] [--minutes 4] [--perturb] [--disconnect] [--timescale 1] [--shots DIR]
// Exit 0 when: connected within 10 s, zero errors on both pages, zero hash mismatches (except the injected one), and (if --perturb) resyncs===1 and re-convergence.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
const { start } = require('./mock-broker');
const args = process.argv.slice(2); const file = args[0];
const opt = (k, d) => { const i = args.indexOf('--' + k); return i >= 0 ? args[i + 1] : d; };
const via = opt('via', 'mqtt'), minutes = +opt('minutes', 4), perturb = args.includes('--perturb'), disconnect = args.includes('--disconnect'), shots = opt('shots', null), timescale = +opt('timescale', 1);
let seed = 5; const rnd = () => { seed = (seed * 1664525 + 1013904223) >>> 0; return seed / 4294967296; };
const say = (s) => process.stderr.write(s + '\n');
(async () => {
  const broker = await start(0);
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium', args: ['--allow-loopback-in-peer-connection', '--enable-precise-memory-info', '--use-gl=swiftshader', '--ignore-gpu-blocklist', '--disable-frame-rate-limit', '--disable-gpu-vsync'] });
  const mk = async (name, vp, dpr) => {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: dpr }); const page = await ctx.newPage();
    const rec = { name, errors: [], requests: [], sockets: [] };
    page.on('console', m => { if (m.type() === 'error') rec.errors.push(m.text()); });
    page.on('pageerror', e => rec.errors.push('PAGEERROR ' + String(e && e.stack || e)));
    page.on('request', r => { if (!r.url().startsWith('file://')) rec.requests.push(r.url()); });
    page.on('websocket', w => rec.sockets.push(w.url()));
    await page.goto('file://' + path.resolve(file) + '#broker=ws://127.0.0.1:' + broker.port, { waitUntil: 'load' });
    await page.mouse.move(vp.width / 2, vp.height * 0.6); await page.mouse.down(); await page.waitForTimeout(60); await page.mouse.up(); // first gesture
    return { page, rec, vp };
  };
  const H = await mk('host', { width: 1280, height: 720 }, 1), G = await mk('guest', { width: 1600, height: 900 }, 2);
  if (shots) fs.mkdirSync(shots, { recursive: true });
  const shot = async (p, tag) => { if (shots) await p.page.screenshot({ path: path.join(shots, `net-${p.rec.name}-${tag}.png`) }); };
  const net = (p) => p.page.evaluate(() => { try { return window.__game.net; } catch (e) { return { error: String(e) }; } });
  const t0 = Date.now(); let code = null;
  try {
    if (via === 'mqtt') {
      code = await H.page.evaluate(() => window.__game.netCreate()); say('room ' + code);
      await Promise.race([G.page.evaluate(c => window.__game.netJoin(c), code), new Promise((_, rej) => setTimeout(() => rej(new Error('join timeout 15s')), 15000))]);
    } else {
      const offer = await H.page.evaluate(() => window.__game.netManualOffer()); say('offer chars ' + offer.length);
      const answer = await G.page.evaluate(o => window.__game.netManualAnswer(o), offer); say('answer chars ' + answer.length);
      await Promise.race([H.page.evaluate(a => window.__game.netManualAccept(a), answer), new Promise((_, rej) => setTimeout(() => rej(new Error('accept timeout 15s')), 15000))]);
    }
  } catch (e) { const r = { ok: false, stage: 'connect', via, error: String(e), host: await net(H), guest: await net(G), errors: { host: H.rec.errors, guest: G.rec.errors } }; console.log(JSON.stringify(r, null, 2)); await browser.close(); broker.close(); process.exit(1); }
  // wait for connected on both
  const until = async (fn, ms, what) => { const s = Date.now(); while (Date.now() - s < ms) { if (await fn()) return true; await new Promise(r => setTimeout(r, 200)); } throw new Error('timeout: ' + what); };
  try { await until(async () => (await net(H)).state === 'connected' && (await net(G)).state === 'connected', 10000, 'both connected'); } catch (e) { console.log(JSON.stringify({ ok: false, stage: 'connected', error: String(e), host: await net(H), guest: await net(G) }, null, 2)); await browser.close(); broker.close(); process.exit(1); }
  const connect_ms = Date.now() - t0; say(`connected via ${via} in ${connect_ms} ms`);
  if (timescale !== 1) { await H.page.evaluate(k => window.__game.setTimeScale(k), timescale); await G.page.evaluate(k => window.__game.setTimeScale(k), timescale); }
  await shot(H, 'connected'); await shot(G, 'connected');
  // bots: host holds, guest stirs+holds; both loop until deadline
  const snap = (p) => p.page.evaluate(() => { try { return window.__game.snapshot(); } catch (e) { return { error: String(e) }; } });
  const flow = (p, x, y) => p.page.evaluate(([x, y]) => window.__game.flowAt(x, y), [x, y]);
  let running = true; const outcomes = {};
  async function play(p, role) {
    const { page, vp } = p; const prio = { FADING: 0, WISP: 1, LIVE: 2 };
    while (running) {
      const s = await snap(p); if (!s || s.error) { await page.waitForTimeout(500); continue; }
      for (const g of (s.glyphs || [])) outcomes[g.id] = g.state;
      if (s.phase === 'dawn' || s.phase === 'epilogue') { await page.waitForTimeout(1000); continue; }
      const c = (s.glyphs || []).filter(g => ['LIVE', 'FADING', 'WISP'].includes(g.state) && g.center).sort((a, b) => (prio[a.state] - prio[b.state]) || (a.cohN - b.cohN));
      const g = c[role === 'stir' && c.length > 1 ? 1 : 0]; if (!g) { await page.waitForTimeout(500); continue; }
      const cx = g.center.x, cy = g.center.y;
      if (role === 'stir') { const f = await flow(p, cx, cy); if (f && f.speed > 15) { const nx = -f.u / f.speed, ny = -f.v / f.speed, span = Math.max(30, g.extentPx * 0.45); await page.mouse.move(cx - nx * span, cy - ny * span); await page.mouse.down(); for (let k = 0; k < 3 && running; k++) { await page.mouse.move(cx + nx * span, cy + ny * span, { steps: 6 }); await page.mouse.move(cx - nx * span, cy - ny * span, { steps: 6 }); } await page.mouse.up(); } }
      await page.mouse.move(cx, cy, { steps: 3 }); await page.mouse.down(); const hs = Date.now();
      while (running && Date.now() - hs < 8000) { await page.waitForTimeout(250); const s2 = await snap(p); const g2 = (s2.glyphs || []).find(x => x.id === g.id); if (!g2 || !['LIVE', 'FADING', 'WISP'].includes(g2.state)) break; }
      await page.mouse.up(); await page.waitForTimeout(200 + rnd() * 300);
    }
  }
  const bots = [play(H, 'hold'), play(G, 'stir')];
  // hash monitor
  const mism = [], matched = new Set(); let perturbAt = null, resyncSeen = false, reconverged = false, lostAt = null, hostTicksAfterLoss = null;
  const deadline = Date.now() + minutes * 60000; let lastShot = Date.now(), lastRs = '0/0';
  while (Date.now() < deadline) {
    await new Promise(r => setTimeout(r, 1000));
    const [hl, gl, hn, gn] = await Promise.all([H.page.evaluate(() => window.__game.hashLog()).catch(() => []), G.page.evaluate(() => window.__game.hashLog()).catch(() => []), net(H), net(G).catch(() => ({ state: 'closed' }))]);
    const gm = new Map((gl || []).map(h => [h.tick, h.hash]));
    for (const h of (hl || [])) if (gm.has(h.tick) && !matched.has(h.tick)) { matched.add(h.tick); if (gm.get(h.tick) !== h.hash) { mism.push({ tick: h.tick, host: h.hash, guest: gm.get(h.tick), t: Math.round((Date.now() - t0) / 1000) }); const ph = await H.page.evaluate(() => { const s = window.__game.snapshot(); return s.phase + '/' + s.actT.toFixed(1) + ' glyphs ' + s.glyphs.map(g => g.id + ':' + g.state).join(','); }).catch(() => '?'); say('MISMATCH tick ' + h.tick + ' t=' + Math.round((Date.now() - t0) / 1000) + 's hostTick=' + hn.tick + ' resyncs ' + hn.resyncs + '/' + (gn.resyncs === undefined ? '-' : gn.resyncs) + ' delay ' + hn.delay + ' stalls ' + hn.stalls + '/' + gn.stalls + ' host ' + ph); } }
    { const k = hn.resyncs + '/' + (gn.resyncs === undefined ? '-' : gn.resyncs); if (k !== lastRs) { lastRs = k; say('RESYNC counters ' + k + ' at t=' + Math.round((Date.now() - t0) / 1000) + 's tick ' + hn.tick); } }
    if (perturb && !perturbAt && Date.now() - t0 > 60000) { await G.page.evaluate(() => window.__game.debugPerturb()); perturbAt = Date.now(); say('perturbed guest at tick ' + gn.tick); }
    if (perturbAt && (hn.resyncs >= 1 || gn.resyncs >= 1)) resyncSeen = true;
    if (perturbAt && resyncSeen && mism.length && Date.now() - perturbAt > 5000) { const last = mism[mism.length - 1]; reconverged = (Date.now() - t0) / 1000 - last.t > 4 && matched.size > 0; }
    if (disconnect && !lostAt && Date.now() - t0 > 90000) { running = false; await Promise.allSettled(bots); await G.page.close(); lostAt = Date.now(); say('guest closed'); }
    if (lostAt && hn.state === 'lost' && hostTicksAfterLoss === null) { const t1 = hn.tick; await new Promise(r => setTimeout(r, 2000)); hostTicksAfterLoss = (await net(H)).tick - t1; break; }
    if (shots && Date.now() - lastShot > 45000) { lastShot = Date.now(); await shot(H, 'play-' + Math.round((Date.now() - t0) / 1000)); if (!lostAt) await shot(G, 'play-' + Math.round((Date.now() - t0) / 1000)); }
  }
  running = false; await Promise.allSettled(bots);
  const hn = await net(H); const gn = lostAt ? null : await net(G);
  const hs = await H.page.evaluate(() => window.__game.stats()).catch(() => null);
  await shot(H, 'end'); if (!lostAt) await shot(G, 'end');
  await browser.close(); broker.close();
  const injected = perturb ? mism.filter(m => perturbAt && m.t >= (perturbAt - t0) / 1000 - 1 && m.t <= (perturbAt - t0) / 1000 + 10) : [];   // only the divergence the perturb caused (resolved within seconds); a later one is unexpected
  const unexpected = mism.filter(m => !injected.includes(m));
  const solo_net_clean = true;
  const ok = H.rec.errors.length === 0 && G.rec.errors.length === 0 && unexpected.length === 0 && matched.size >= 3 && (!perturb || (resyncSeen && reconverged)) && (!disconnect || (hn.state === 'lost' && hostTicksAfterLoss > 30));
  console.log(JSON.stringify({ ok, via, connect_ms, ticks_compared: matched.size, mismatches_unexpected: unexpected.slice(0, 5), mismatches_injected: injected.length, resync: { seen: resyncSeen, reconverged, host: hn.resyncs, guest: gn && gn.resyncs }, stalls: { host: hn.stalls, guest: gn && gn.stalls }, delay: hn.delay, rtt: hn.rtt, disconnect: disconnect ? { host_state: hn.state, host_ticks_after_loss: hostTicksAfterLoss } : null, outcomes, host_stats: hs, requests: { host: H.rec.requests.slice(0, 5), guest: G.rec.requests.slice(0, 5) }, sockets: { host: H.rec.sockets, guest: G.rec.sockets }, errors: { host: H.rec.errors.slice(0, 10), guest: G.rec.errors.slice(0, 10) } }, null, 2));
  process.exit(ok ? 0 : 1);
})().catch(e => { console.log(JSON.stringify({ ok: false, crash: String(e && e.stack || e) })); process.exit(1); });
