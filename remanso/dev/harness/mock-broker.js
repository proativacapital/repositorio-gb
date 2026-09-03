// mock-broker.js — minimal MQTT 3.1.1 over WebSocket broker for local tests (QoS 0, exact-topic fan-out).
// Usage: node mock-broker.js [port]  → prints {"port":N} on stdout when listening. Also exports start(port) for in-process use.
const { WebSocketServer } = require('ws');
function start(port = 0) {
  return new Promise((resolve) => {
    const wss = new WebSocketServer({ port, handleProtocols: () => 'mqtt' });
    const subs = new Map(); // topic -> Set(ws)
    const parseVarint = (buf, i) => { let m = 1, v = 0, b; do { b = buf[i++]; v += (b & 127) * m; m *= 128; } while (b & 128); return [v, i]; };
    const str = (buf, i) => { const n = buf.readUInt16BE(i); return [buf.slice(i + 2, i + 2 + n).toString('utf8'), i + 2 + n]; };
    const enc = (type, body) => { const len = []; let n = body.length; do { let b = n % 128; n = Math.floor(n / 128); if (n) b |= 128; len.push(b); } while (n); return Buffer.concat([Buffer.from([type]), Buffer.from(len), body]); };
    wss.on('connection', (ws) => {
      ws.binaryType = 'nodebuffer'; ws._subs = new Set();
      ws.on('message', (data) => {
        const buf = Buffer.isBuffer(data) ? data : Buffer.from(data);
        let i = 0;
        while (i < buf.length) {
          const type = buf[i] >> 4; const [len, j] = parseVarint(buf, i + 1); const body = buf.slice(j, j + len); i = j + len;
          if (type === 1) { ws.send(enc(0x20, Buffer.from([0, 0]))); }                       // CONNECT → CONNACK
          else if (type === 8) {                                                            // SUBSCRIBE → SUBACK
            const id = body.readUInt16BE(0); let k = 2; const codes = [];
            while (k < body.length) { const [topic, k2] = str(body, k); k = k2 + 1; if (!subs.has(topic)) subs.set(topic, new Set()); subs.get(topic).add(ws); ws._subs.add(topic); codes.push(0); }
            ws.send(enc(0x90, Buffer.concat([Buffer.from([id >> 8, id & 255]), Buffer.from(codes)])));
          }
          else if (type === 10) {                                                           // UNSUBSCRIBE → UNSUBACK
            const id = body.readUInt16BE(0); let k = 2; while (k < body.length) { const [topic, k2] = str(body, k); k = k2; const s = subs.get(topic); if (s) s.delete(ws); ws._subs.delete(topic); }
            ws.send(enc(0xB0, Buffer.from([id >> 8, id & 255])));
          }
          else if (type === 3) {                                                            // PUBLISH (QoS 0) → fan-out
            const qos = (buf[j - len - 1 - 0] >> 1) & 3; const [topic, k] = str(body, 0); const payload = body.slice(qos ? k + 2 : k);
            const s = subs.get(topic); if (s) for (const c of s) if (c.readyState === 1) c.send(enc(0x30, Buffer.concat([Buffer.from([topic.length >> 8, topic.length & 255]), Buffer.from(topic), payload])));
          }
          else if (type === 12) { ws.send(enc(0xD0, Buffer.alloc(0))); }                    // PINGREQ → PINGRESP
          else if (type === 14) { ws.close(); }                                             // DISCONNECT
        }
      });
      ws.on('close', () => { for (const t of ws._subs) { const s = subs.get(t); if (s) s.delete(ws); } });
    });
    wss.on('listening', () => resolve({ port: wss.address().port, close: () => wss.close(), subs }));
  });
}
module.exports = { start };
if (require.main === module) start(+process.argv[2] || 0).then(b => { console.log(JSON.stringify({ port: b.port })); });
