// Reference MQTT 3.1.1-over-WebSocket client (browser-portable: only WebSocket + Uint8Array). Node test: node mqtt-client-reference.js
// Agents: port this to the game's SIGNAL section; it is deliberately tiny.
function mqttConnect(url, WS) {
  const enc = new TextEncoder(), dec = new TextDecoder();
  const varint = (n) => { const o = []; do { let b = n % 128; n = Math.floor(n / 128); if (n) b |= 128; o.push(b); } while (n); return o; };
  const u16 = (n) => [n >> 8, n & 255];
  const mstr = (s) => { const b = enc.encode(s); return [...u16(b.length), ...b]; };
  const pkt = (type, body) => new Uint8Array([type, ...varint(body.length), ...body]);
  const ws = new WS(url, 'mqtt'); ws.binaryType = 'arraybuffer';
  const api = { onmessage: null, onclose: null, ready: null, send(topic, payload) { ws.send(pkt(0x30, [...mstr(topic), ...enc.encode(payload)])); }, subscribe(topic) { ws.send(pkt(0x82, [...u16(1), ...mstr(topic), 0])); }, close() { try { ws.send(pkt(0xE0, [])); } catch (e) {} ws.close(); } };
  api.ready = new Promise((res, rej) => {
    const timer = setTimeout(() => { rej(new Error('mqtt timeout')); ws.close(); }, 4000);
    ws.onopen = () => { const id = 'rm' + Math.floor(Math.random() * 1e9).toString(32); ws.send(pkt(0x10, [...mstr('MQTT'), 4, 0x02, ...u16(30), ...mstr(id)])); };
    ws.onerror = () => { clearTimeout(timer); rej(new Error('ws error')); };
    ws.onclose = () => { clearTimeout(timer); api.onclose && api.onclose(); };
    ws.onmessage = (e) => {
      const b = new Uint8Array(e.data); let i = 0;
      while (i < b.length) {
        const type = b[i] >> 4; let m = 1, len = 0, x; i++; do { x = b[i++]; len += (x & 127) * m; m *= 128; } while (x & 128);
        const body = b.subarray(i, i + len); i += len;
        if (type === 2) { clearTimeout(timer); if (body[1] === 0) res(api); else rej(new Error('connack ' + body[1])); }
        else if (type === 3) { const tl = (body[0] << 8) | body[1]; const topic = dec.decode(body.subarray(2, 2 + tl)); const payload = dec.decode(body.subarray(2 + tl)); api.onmessage && api.onmessage(topic, payload); }
      }
    };
    const ping = setInterval(() => { if (ws.readyState === 1) ws.send(pkt(0xC0, [])); else clearInterval(ping); }, 20000);
  });
  return api;
}
if (typeof module !== 'undefined') module.exports = { mqttConnect };
if (typeof require !== 'undefined' && require.main === module) (async () => {
  const { start } = require('./mock-broker'); const WS = require('ws');
  const broker = await start(0); const url = 'ws://127.0.0.1:' + broker.port;
  const a = await mqttConnect(url, WS).ready, b = await mqttConnect(url, WS).ready;
  a.subscribe('remanso/1/TOVANE'); b.subscribe('remanso/1/TOVANE');
  await new Promise(r => setTimeout(r, 100));
  const got = new Promise(r => { a.onmessage = (t, p) => r({ t, p }); });
  b.send('remanso/1/TOVANE', JSON.stringify({ t: 'join', id: 'b' }));
  const m = await Promise.race([got, new Promise((_, rej) => setTimeout(() => rej(new Error('no relay')), 2000))]);
  console.log(JSON.stringify({ ok: m.p.includes('"join"'), relayed: m })); a.close(); b.close(); broker.close();
})().catch(e => { console.log(JSON.stringify({ ok: false, error: String(e) })); process.exit(1); });
