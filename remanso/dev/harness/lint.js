// lint.js — static checks for the single-file Canvas game (network allowed ONLY for multiplayer signaling/ICE). Usage: node lint.js <file.html>
const fs = require('fs');
const f = process.argv[2];
const src = fs.readFileSync(f, 'utf8');
const problems = [], notes = [];
const has = (re) => re.test(src);
if (!/^\s*<!doctype html>/i.test(src)) problems.push('missing <!doctype html>');
if (/<script[^>]+src=/i.test(src)) problems.push('external <script src> found (must be self-contained)');
if (/<link[^>]+href=(?!["']data:)/i.test(src)) problems.push('external <link href> found');   // an inline data: URI (favicon) is not external
if (/\bfetch\s*\(|XMLHttpRequest|import\s*\(|from\s+['"]http|navigator\.sendBeacon|EventSource\(/i.test(src)) problems.push('forbidden network API (fetch/XHR/import/beacon/EventSource)');
const urls = src.match(/\b(?:https?|wss?|stuns?|turns?):[^\s'"`)]+/gi) || [];
const badUrls = urls.filter(u => !/^(wss?:|stuns?:|turns?:)/i.test(u) && !/w3\.org/i.test(u));
if (badUrls.length) problems.push('http(s) URLs present outside allowed signaling/ICE: ' + [...new Set(badUrls)].slice(0, 5).join(', '));
if (urls.some(u => /^ws:/i.test(u) && !/127\.0\.0\.1|localhost/.test(u))) problems.push('insecure ws:// URL that is not localhost');
if (!has(/RTCPeerConnection/)) problems.push('no RTCPeerConnection (online two-player required)');
if (!has(/new\s+WebSocket\s*\(/)) problems.push('no WebSocket signaling client (room-code path required)');
if (!has(/requestAnimationFrame/)) problems.push('no requestAnimationFrame');
if (!has(/devicePixelRatio/)) problems.push('no devicePixelRatio handling');
if (!has(/visibilitychange|document\.hidden/)) problems.push('no visibilitychange handling (dt spike after tab switch)');
if (!has(/resize/)) problems.push('no resize handling');
if (!has(/pointerdown/i)) problems.push('no pointer events');
if (!has(/<meta[^>]+viewport/i)) problems.push('missing viewport meta');
if (!has(/__game\s*=/)) problems.push('debug API window.__game not exposed (needed by harness)');
if (/Math\.random\s*\(/.test(src)) problems.push('Math.random used (determinism: use the seeded PRNG; crypto.getRandomValues only for room codes/client ids)');
if (/console\.log\(/.test(src)) notes.push('console.log present — remove for final');
if (/debugger/.test(src)) problems.push('debugger statement present');
if (/\bTODO\b|\bFIXME\b|\bXXX\b/.test(src)) notes.push('TODO/FIXME markers present');
if (/ctx\.filter\s*=|shadowBlur\s*=\s*[1-9]/.test(src)) notes.push('ctx.filter or shadowBlur used — GDD forbids (perf)');
// Determinism smell: Math.sin/cos/exp/pow/atan2/hypot inside functions that look like sim passes
const simFns = src.match(/function\s+(step|simStep|fluidStep|advect|project|confine|weather\w*|splat\w*|recall\w*|settle\w*|remanso\w*|stamp\w*|coherence\w*|director\w*|tick\w*)\s*\([^)]*\)\s*\{[\s\S]{0,6000}/g) || [];
let detSmell = 0; for (const s of simFns) detSmell += (s.match(/Math\.(sin|cos|tan|exp|log|pow|atan2|hypot)\(/g) || []).length;
if (detSmell) notes.push(`Math.sin/cos/exp/pow/atan2/hypot inside ${detSmell} sim-looking call sites — verify these are render-only or replaced by deterministic versions (GDD-ONLINE.md)`);
const kb = (Buffer.byteLength(src) / 1024).toFixed(1);
const lines = src.split('\n').length;
const hot = src.match(/function\s+(update|draw|render|step|tick|simulate|loop)[^{]*\{[\s\S]{0,4000}/g) || [];
let allocSmell = 0; for (const h of hot) { allocSmell += (h.match(/\bnew\s+[A-Z]\w*\(|\[\s*\]|\{\s*\}|\.map\(|\.filter\(|\.slice\(|\.concat\(|\.\.\./g) || []).length; }
if (allocSmell > 6) notes.push(`possible per-frame allocations in hot functions (${allocSmell} smells) — verify with heap probe`);
console.log(JSON.stringify({ file: f, kb: +kb, lines, problems, notes }, null, 2));
process.exit(problems.length ? 1 : 0);
