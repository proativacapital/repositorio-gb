// Two pages in one headless Chromium, manual SDP exchange, DataChannel ping-pong. No STUN, no network.
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-loopback-in-peer-connection', '--use-gl=swiftshader'] });
  const A = await (await browser.newContext()).newPage(), B = await (await browser.newContext()).newPage();
  await A.goto('file:///tmp/claude-0/-home-user-repositorio-gb/b8f10c88-baf8-512e-9bcd-f5069d36e574/scratchpad/harness/smoke.html');
  await B.goto('file:///tmp/claude-0/-home-user-repositorio-gb/b8f10c88-baf8-512e-9bcd-f5069d36e574/scratchpad/harness/smoke.html');
  const boot = (isHost) => `
    window.pc = new RTCPeerConnection({ iceServers: [] });
    window.log = [];
    window.gather = () => new Promise(r => { if (pc.iceGatheringState === 'complete') return r(); const t = setTimeout(r, 3000); pc.addEventListener('icegatheringstatechange', () => { if (pc.iceGatheringState === 'complete') { clearTimeout(t); r(); } }); });
    window.ready = new Promise(r => { window._ready = r; });
    if (${isHost}) { window.dc = pc.createDataChannel('game', { ordered: true }); dc.onopen = () => _ready(); dc.onmessage = e => log.push(e.data); }
    else { pc.ondatachannel = e => { window.dc = e.channel; dc.onopen = () => _ready(); dc.onmessage = e => { log.push(e.data); dc.send('pong:' + e.data); }; }; }
  `;
  await A.evaluate(boot(true)); await B.evaluate(boot(false));
  const offer = await A.evaluate(async () => { const o = await pc.createOffer(); await pc.setLocalDescription(o); await gather(); return pc.localDescription.sdp; });
  const answer = await B.evaluate(async (sdp) => { await pc.setRemoteDescription({ type: 'offer', sdp }); const a = await pc.createAnswer(); await pc.setLocalDescription(a); await gather(); return pc.localDescription.sdp; }, offer);
  await A.evaluate(async (sdp) => { await pc.setRemoteDescription({ type: 'answer', sdp }); }, answer);
  const t0 = Date.now();
  await Promise.race([A.evaluate(() => ready), new Promise((_, rej) => setTimeout(() => rej(new Error('dc open timeout')), 8000))]);
  const rtts = await A.evaluate(async () => { const out = []; for (let i = 0; i < 20; i++) { const t = performance.now(); const p = new Promise(r => { dc.onmessage = e => { r(performance.now() - t); }; }); dc.send('ping' + i); out.push(await p); } return out; });
  const cands = (offer.match(/a=candidate:[^\r\n]+/g) || []).map(c => c.split(' ').slice(4, 8).join(' '));
  console.log(JSON.stringify({ ok: true, open_ms: Date.now() - t0, rtt_ms: { min: Math.min(...rtts).toFixed(2), avg: (rtts.reduce((a, b) => a + b) / rtts.length).toFixed(2) }, offer_bytes: offer.length, candidates: cands }, null, 2));
  await browser.close();
})().catch(e => { console.log(JSON.stringify({ ok: false, error: String(e) })); process.exit(1); });
